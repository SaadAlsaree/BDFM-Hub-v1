using AutoMapper;
using BDFM.Domain.Entities.Automation;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.Dashboard.Queries.GetDashboardOverview;

public class GetDashboardOverviewHandler : IRequestHandler<GetDashboardOverviewQuery, Response<DashboardOverviewViewModel>>
{
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;
    private readonly IBaseRepository<OrganizationalUnit> _unitRepository;
    private readonly IBaseRepository<UserCorrespondenceInteraction> _userInteractionRepository;
    private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
    private readonly IBaseRepository<AutomationExecutionLog> _automationLogRepository;
    private readonly IMapper _mapper;

    public GetDashboardOverviewHandler(
        IBaseRepository<Correspondence> correspondenceRepository,
        IBaseRepository<OrganizationalUnit> unitRepository,
        IBaseRepository<UserCorrespondenceInteraction> userInteractionRepository,
        IBaseRepository<WorkflowStep> workflowStepRepository,
        IBaseRepository<AutomationExecutionLog> automationLogRepository,
        IMapper mapper)
    {
        _correspondenceRepository = correspondenceRepository;
        _unitRepository = unitRepository;
        _userInteractionRepository = userInteractionRepository;
        _workflowStepRepository = workflowStepRepository;
        _automationLogRepository = automationLogRepository;
        _mapper = mapper;
    }

    public async Task<Response<DashboardOverviewViewModel>> Handle(GetDashboardOverviewQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var endDate = request.EndDate ?? DateTime.UtcNow;
            var startDate = request.StartDate ?? endDate.AddMonths(-request.MonthsBack);

            var dashboard = new DashboardOverviewViewModel
            {
                FilteredByUnitId = request.UnitId
            };

            // Set unit name if filtering by specific unit
            if (request.UnitId.HasValue)
            {
                var unit = await _unitRepository.Find(u => u.Id == request.UnitId.Value, cancellationToken: cancellationToken);
                dashboard.FilteredByUnitName = unit?.UnitName;
            }

            // Get correspondence data
            var correspondenceQuery = _correspondenceRepository.Query(
                filter: c => c.CreateAt >= startDate && c.CreateAt <= endDate,
                include: c => c.Include(x => x.WorkflowSteps)
                              .Include(x => x.CreateByUser!)
                              .ThenInclude(u => u.OrganizationalUnit!)
                              .Include(x => x.UserCorrespondenceInteractions)
            );

            // Filter by unit if specified
            if (request.UnitId.HasValue)
            {
                correspondenceQuery = correspondenceQuery.Where(c =>
                    c.WorkflowSteps.Any(ws => ws.FromUnitId == request.UnitId.Value) ||
                    c.CreateByUser!.OrganizationalUnitId == request.UnitId.Value);
            }

            var correspondenceList = correspondenceQuery.ToList();

            // 1. Unread incoming mail count
            dashboard.UnreadIncomingMailCount = await GetUnreadIncomingMailCount(request.UnitId, cancellationToken);

            // 2. Total active correspondence (not completed/cancelled)
            var activeStatuses = new[] {
                CorrespondenceStatusEnum.Registered,
                CorrespondenceStatusEnum.PendingReferral,
                CorrespondenceStatusEnum.UnderProcessing,
                CorrespondenceStatusEnum.PendingApproval,
                CorrespondenceStatusEnum.InSignatureAgenda
            };
            dashboard.TotalActiveCorrespondence = correspondenceList.Count(c => activeStatuses.Contains(c.Status));

            // 3. Total correspondence
            dashboard.TotalCorrespondence = correspondenceList.Count;

            // 4. Average monthly volume
            dashboard.AverageMonthlyVolume = CalculateAverageMonthlyVolume(correspondenceList, startDate, endDate);

            // 5. Correspondence type distribution
            dashboard.CorrespondenceTypeDistribution = GetCorrespondenceTypeDistribution(correspondenceList);

            // 6. Top units receiving correspondence
            dashboard.TopUnitsReceivingCorrespondence = await GetTopUnitsReceivingCorrespondence(correspondenceList, request.UnitId, cancellationToken);

            // 7. Automation performance
            dashboard.AutomationPerformance = await GetAutomationPerformance(startDate, endDate, request.UnitId, cancellationToken);

            // 8. Correspondence status distribution
            dashboard.CorrespondenceStatusDistribution = GetCorrespondenceStatusDistribution(correspondenceList);

            // 9. Backlog metrics
            dashboard.BacklogMetrics = await GetBacklogMetrics(request.UnitId, cancellationToken);

            return Response<DashboardOverviewViewModel>.Success(dashboard);
        }
        catch (Exception ex)
        {
            return Response<DashboardOverviewViewModel>.Fail(
                new List<object>() { ex.Message },
                new MessageResponse() { Code = "Error2000", Message = "خطأ في تحميل بيانات لوحة المعلومات" }
            );
        }
    }

    private async Task<int> GetUnreadIncomingMailCount(Guid? unitId, CancellationToken cancellationToken)
    {
        Expression<Func<UserCorrespondenceInteraction, bool>> filter = ui =>
            !ui.IsRead && ui.Correspondence.CorrespondenceType == CorrespondenceTypeEnum.IncomingExternal;

        if (unitId.HasValue)
        {
            var unitIdValue = unitId.Value; // Capture the value for the expression
            filter = ui => !ui.IsRead &&
                          ui.Correspondence.CorrespondenceType == CorrespondenceTypeEnum.IncomingExternal &&
                          ui.User.OrganizationalUnitId == unitIdValue;
        }

        var interactions = await _userInteractionRepository.GetAsync(
            filter: filter,
            include: ui => ui.Include(x => x.Correspondence).Include(x => x.User).ThenInclude(u => u.OrganizationalUnit!)
        );

        return interactions.Count();
    }

    private double CalculateAverageMonthlyVolume(List<Correspondence> correspondences, DateTime startDate, DateTime endDate)
    {
        if (!correspondences.Any()) return 0;

        var totalMonths = ((endDate.Year - startDate.Year) * 12) + endDate.Month - startDate.Month + 1;
        return totalMonths > 0 ? (double)correspondences.Count / totalMonths : 0;
    }

    private List<CorrespondenceTypeDistribution> GetCorrespondenceTypeDistribution(List<Correspondence> correspondences)
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

    private async Task<List<UnitCorrespondenceVolume>> GetTopUnitsReceivingCorrespondence(List<Correspondence> correspondences, Guid? filterUnitId, CancellationToken cancellationToken)
    {
        var units = await _unitRepository.GetAsync();
        var unitsList = units.ToList();

        var unitCorrespondence = correspondences
            .SelectMany(c => c.WorkflowSteps.Select(ws => new { Correspondence = c, UnitId = ws.FromUnitId }))
            .Where(x => x.UnitId.HasValue)
            .GroupBy(x => x.UnitId!.Value)
            .Select(g => new
            {
                UnitId = g.Key,
                Correspondences = g.Select(x => x.Correspondence).Distinct().ToList()
            })
            .ToList();

        var result = unitCorrespondence
            .Select(uc =>
            {
                var unit = unitsList.FirstOrDefault(u => u.Id == uc.UnitId);
                return new UnitCorrespondenceVolume
                {
                    UnitId = uc.UnitId,
                    UnitName = unit?.UnitName ?? "Unknown Unit",
                    UnitCode = unit?.UnitCode ?? "N/A",
                    CorrespondenceCount = uc.Correspondences.Count,
                    IncomingCount = uc.Correspondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.IncomingExternal),
                    OutgoingCount = uc.Correspondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.OutgoingExternal),
                    InternalCount = uc.Correspondences.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.IncomingInternal)
                };
            })
            .OrderByDescending(x => x.CorrespondenceCount)
            .Take(5)
            .ToList();

        return result;
    }

    private async Task<AutomationPerformanceMetrics> GetAutomationPerformance(DateTime startDate, DateTime endDate, Guid? unitId, CancellationToken cancellationToken)
    {
        var logs = await _automationLogRepository.GetAsync(
            filter: log => log.CreateAt >= startDate && log.CreateAt <= endDate
        );

        var logsList = logs.ToList();

        if (!logsList.Any())
        {
            return new AutomationPerformanceMetrics();
        }

        var successfulLogs = logsList.Where(log => log.Status == "Success").ToList();
        var totalProcesses = logsList.Count;
        var successfulProcesses = successfulLogs.Count;

        return new AutomationPerformanceMetrics
        {
            TotalAutomatedProcesses = totalProcesses,
            SuccessfulProcesses = successfulProcesses,
            FailedProcesses = totalProcesses - successfulProcesses,
            SuccessRate = totalProcesses > 0 ? Math.Round((double)successfulProcesses / totalProcesses * 100, 2) : 0,
            AverageExecutionTimeMinutes = logsList.Any(l => l.Duration.HasValue)
                ? Math.Round(logsList.Where(l => l.Duration.HasValue).Average(l => l.Duration!.Value.TotalMinutes), 2)
                : 0
        };
    }

    private List<CorrespondenceStatusDistribution> GetCorrespondenceStatusDistribution(List<Correspondence> correspondences)
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

    private async Task<BacklogMetrics> GetBacklogMetrics(Guid? unitId, CancellationToken cancellationToken)
    {
        var pendingSteps = await _workflowStepRepository.GetAsync(
            filter: ws => ws.Status == WorkflowStepStatus.Pending || ws.Status == WorkflowStepStatus.InProgress,
            include: ws => ws.Include(x => x.FromUnit!)
        );

        var pendingStepsList = pendingSteps.ToList();

        if (unitId.HasValue)
        {
            pendingStepsList = pendingStepsList.Where(ws => ws.FromUnitId == unitId.Value).ToList();
        }

        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var endOfWeek = today.AddDays(7 - (int)now.DayOfWeek);

        var overdueTasks = pendingStepsList.Where(ws => ws.DueDate.HasValue && ws.DueDate.Value < now).ToList();
        var tasksDueToday = pendingStepsList.Where(ws => ws.DueDate.HasValue && DateOnly.FromDateTime(ws.DueDate.Value) == today).ToList();
        var tasksDueThisWeek = pendingStepsList.Where(ws => ws.DueDate.HasValue && DateOnly.FromDateTime(ws.DueDate.Value) <= endOfWeek).ToList();

        var averageAge = pendingStepsList.Any()
            ? pendingStepsList.Average(ws => (now - ws.CreateAt).TotalDays)
            : 0;

        var unitBacklogs = new List<UnitBacklogSummary>();
        if (!unitId.HasValue) // Only show unit breakdown if not filtering by specific unit
        {
            var units = await _unitRepository.GetAsync();
            unitBacklogs = units
                .Select(unit => new UnitBacklogSummary
                {
                    UnitId = unit.Id,
                    UnitName = unit.UnitName,
                    UnitCode = unit.UnitCode,
                    BackloggedTasks = pendingStepsList.Count(ws => ws.FromUnitId == unit.Id),
                    OverdueTasks = overdueTasks.Count(ws => ws.FromUnitId == unit.Id)
                })
                .Where(ub => ub.BackloggedTasks > 0)
                .OrderByDescending(ub => ub.BackloggedTasks)
                .Take(10)
                .ToList();
        }

        return new BacklogMetrics
        {
            TotalBackloggedTasks = pendingStepsList.Count,
            OverdueTasks = overdueTasks.Count,
            TasksDueToday = tasksDueToday.Count,
            TasksDueThisWeek = tasksDueThisWeek.Count,
            AverageTaskAge = Math.Round(averageAge, 1),
            ByUnit = unitBacklogs
        };
    }
}
