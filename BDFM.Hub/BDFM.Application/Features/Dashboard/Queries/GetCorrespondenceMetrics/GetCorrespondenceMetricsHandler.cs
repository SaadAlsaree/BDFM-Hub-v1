using AutoMapper;
using BDFM.Application.Features.Dashboard.Queries.GetDashboardOverview;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.Dashboard.Queries.GetCorrespondenceMetrics;

public class GetCorrespondenceMetricsHandler : IRequestHandler<GetCorrespondenceMetricsQuery, Response<CorrespondenceMetricsViewModel>>
{
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;
    private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
    private readonly IMapper _mapper;

    public GetCorrespondenceMetricsHandler(
        IBaseRepository<Correspondence> correspondenceRepository,
        IBaseRepository<WorkflowStep> workflowStepRepository,
        IMapper mapper)
    {
        _correspondenceRepository = correspondenceRepository;
        _workflowStepRepository = workflowStepRepository;
        _mapper = mapper;
    }

    public async Task<Response<CorrespondenceMetricsViewModel>> Handle(GetCorrespondenceMetricsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var endDate = request.EndDate ?? DateTime.UtcNow;
            var startDate = request.StartDate ?? endDate.AddMonths(-12);

            // Build filter expression
            Expression<Func<Correspondence, bool>> filter = c => c.CreateAt >= startDate && c.CreateAt <= endDate;

            if (request.UnitId.HasValue)
            {
                var unitIdValue = request.UnitId.Value;
                filter = c => c.CreateAt >= startDate && c.CreateAt <= endDate &&
                             (c.WorkflowSteps.Any(ws => ws.FromUnitId == unitIdValue) ||
                              c.CreateByUser!.OrganizationalUnitId == unitIdValue);
            }

            if (request.CorrespondenceType.HasValue)
            {
                var typeValue = request.CorrespondenceType.Value;
                var existingFilter = filter;
                filter = c => existingFilter.Compile()(c) && c.CorrespondenceType == typeValue;
            }

            if (request.Status.HasValue)
            {
                var statusValue = request.Status.Value;
                var existingFilter = filter;
                filter = c => existingFilter.Compile()(c) && c.Status == statusValue;
            }

            var correspondences = await _correspondenceRepository.GetAsync(
                filter: filter,
                include: c => c.Include(x => x.WorkflowSteps)
                              .Include(x => x.CreateByUser!)
                              .ThenInclude(u => u.OrganizationalUnit!)
            );

            var correspondenceList = correspondences.ToList();

            var viewModel = new CorrespondenceMetricsViewModel
            {
                TotalCount = correspondenceList.Count,
                ActiveCount = correspondenceList.Count(c => IsActiveStatus(c.Status)),
                CompletedCount = correspondenceList.Count(c => c.Status == CorrespondenceStatusEnum.Completed),
                PendingCount = correspondenceList.Count(c => c.Status == CorrespondenceStatusEnum.PendingReferral ||
                                                            c.Status == CorrespondenceStatusEnum.PendingApproval),
                OverdueCount = await GetOverdueCount(request.UnitId, cancellationToken),
                AverageProcessingTimeInDays = CalculateAverageProcessingTime(correspondenceList),
                MonthlyVolume = GetMonthlyVolumeData(correspondenceList, startDate, endDate),
                TypeDistribution = GetTypeDistribution(correspondenceList),
                StatusDistribution = GetStatusDistribution(correspondenceList),
                PriorityDistribution = GetPriorityDistribution(correspondenceList)
            };

            return Response<CorrespondenceMetricsViewModel>.Success(viewModel);
        }
        catch (Exception ex)
        {
            return Response<CorrespondenceMetricsViewModel>.Fail(
                new List<object>() { ex.Message },
                new MessageResponse() { Code = "Error2000", Message = "خطأ في تحميل بيانات المراسلات" }
            );
        }
    }

    private bool IsActiveStatus(CorrespondenceStatusEnum status)
    {
        return status switch
        {
            CorrespondenceStatusEnum.Registered or
            CorrespondenceStatusEnum.PendingReferral or
            CorrespondenceStatusEnum.UnderProcessing or
            CorrespondenceStatusEnum.PendingApproval or
            CorrespondenceStatusEnum.InSignatureAgenda => true,
            _ => false
        };
    }

    private async Task<int> GetOverdueCount(Guid? unitId, CancellationToken cancellationToken)
    {
        Expression<Func<WorkflowStep, bool>> filter = ws =>
            (ws.Status == WorkflowStepStatus.Pending || ws.Status == WorkflowStepStatus.InProgress) &&
            ws.DueDate.HasValue && ws.DueDate.Value < DateTime.UtcNow;

        if (unitId.HasValue)
        {
            var unitIdValue = unitId.Value;
            filter = ws => (ws.Status == WorkflowStepStatus.Pending || ws.Status == WorkflowStepStatus.InProgress) &&
                          ws.DueDate.HasValue && ws.DueDate.Value < DateTime.UtcNow &&
                          ws.FromUnitId == unitIdValue;
        }

        var overdueSteps = await _workflowStepRepository.GetAsync(filter: filter);
        return overdueSteps.Count();
    }

    private double CalculateAverageProcessingTime(List<Correspondence> correspondences)
    {
        var completedCorrespondences = correspondences
            .Where(c => c.Status == CorrespondenceStatusEnum.Completed && c.FinalizedAt.HasValue)
            .ToList();

        if (!completedCorrespondences.Any()) return 0;

        var totalDays = completedCorrespondences
            .Sum(c => (c.FinalizedAt!.Value - c.CreateAt).TotalDays);

        return Math.Round(totalDays / completedCorrespondences.Count, 2);
    }

    private List<MonthlyVolumeData> GetMonthlyVolumeData(List<Correspondence> correspondences, DateTime startDate, DateTime endDate)
    {
        var monthlyData = new List<MonthlyVolumeData>();
        var current = new DateTime(startDate.Year, startDate.Month, 1);

        while (current <= endDate)
        {
            var monthCorrespondences = correspondences
                .Where(c => c.CreateAt.Year == current.Year && c.CreateAt.Month == current.Month)
                .ToList();

            monthlyData.Add(new MonthlyVolumeData
            {
                Year = current.Year,
                Month = current.Month,
                MonthName = GetMonthNameArabic(current.Month),
                Count = monthCorrespondences.Count,
                IncomingCount = monthCorrespondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.IncomingExternal),
                OutgoingCount = monthCorrespondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.OutgoingExternal),
                InternalCount = monthCorrespondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.IncomingInternal)

            });

            current = current.AddMonths(1);
        }

        return monthlyData;
    }

    private List<CorrespondenceTypeDistribution> GetTypeDistribution(List<Correspondence> correspondences)
    {
        if (!correspondences.Any()) return new List<CorrespondenceTypeDistribution>();

        var total = correspondences.Count;
        return correspondences
            .GroupBy(c => c.CorrespondenceType)
            .Select(g => new CorrespondenceTypeDistribution
            {
                CorrespondenceType = g.Key,
                TypeName = g.Key.GetDisplayName(),
                Count = g.Count(),
                Percentage = Math.Round((double)g.Count() / total * 100, 2)
            })
            .OrderByDescending(x => x.Count)
            .ToList();
    }

    private List<CorrespondenceStatusDistribution> GetStatusDistribution(List<Correspondence> correspondences)
    {
        if (!correspondences.Any()) return new List<CorrespondenceStatusDistribution>();

        var total = correspondences.Count;
        return correspondences
            .GroupBy(c => c.Status)
            .Select(g => new CorrespondenceStatusDistribution
            {
                Status = g.Key,
                StatusName = g.Key.GetDisplayName(),
                Count = g.Count(),
                Percentage = Math.Round((double)g.Count() / total * 100, 2)
            })
            .OrderByDescending(x => x.Count)
            .ToList();
    }

    private List<PriorityDistribution> GetPriorityDistribution(List<Correspondence> correspondences)
    {
        if (!correspondences.Any()) return new List<PriorityDistribution>();

        var total = correspondences.Count;
        return correspondences
            .GroupBy(c => c.PriorityLevel)
            .Select(g => new PriorityDistribution
            {
                Priority = g.Key,
                PriorityName = g.Key.GetDisplayName(),
                Count = g.Count(),
                Percentage = Math.Round((double)g.Count() / total * 100, 2)
            })
            .OrderByDescending(x => x.Count)
            .ToList();
    }

    private string GetMonthNameArabic(int month)
    {
        return month switch
        {
            1 => "يناير",
            2 => "فبراير",
            3 => "مارس",
            4 => "أبريل",
            5 => "مايو",
            6 => "يونيو",
            7 => "يوليو",
            8 => "أغسطس",
            9 => "سبتمبر",
            10 => "أكتوبر",
            11 => "نوفمبر",
            12 => "ديسمبر",
            _ => month.ToString()
        };
    }
}
