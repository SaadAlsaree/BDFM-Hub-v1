using AutoMapper;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;
using System.Globalization;

namespace BDFM.Application.Features.Dashboard.Queries.GetDailyPerformanceSummary;

public class GetDailyPerformanceSummaryHandler : IRequestHandler<GetDailyPerformanceSummaryQuery, Response<DailyPerformanceSummaryViewModel>>
{
    private readonly IBaseRepository<Correspondence> _correspondenceRepository;
    private readonly IBaseRepository<OrganizationalUnit> _unitRepository;
    private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
    private readonly IMapper _mapper;

    public GetDailyPerformanceSummaryHandler(
        IBaseRepository<Correspondence> correspondenceRepository,
        IBaseRepository<OrganizationalUnit> unitRepository,
        IBaseRepository<WorkflowStep> workflowStepRepository,
        IMapper mapper)
    {
        _correspondenceRepository = correspondenceRepository;
        _unitRepository = unitRepository;
        _workflowStepRepository = workflowStepRepository;
        _mapper = mapper;
    }

    public async Task<Response<DailyPerformanceSummaryViewModel>> Handle(GetDailyPerformanceSummaryQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var targetDate = request.Date?.Date ?? DateTime.UtcNow.Date;
            var startOfDay = targetDate;
            var endOfDay = targetDate.AddDays(1).AddTicks(-1);

            var viewModel = new DailyPerformanceSummaryViewModel
            {
                Date = targetDate,
                DateDisplay = FormatDateInArabic(targetDate),
                FilteredByUnitId = request.UnitId
            };

            // Set unit name if filtering by specific unit
            if (request.UnitId.HasValue)
            {
                var unit = await _unitRepository.Find(u => u.Id == request.UnitId.Value, cancellationToken: cancellationToken);
                viewModel.FilteredByUnitName = unit?.UnitName;
            }

            // Get today's correspondence data
            var todaysCorrespondence = await GetTodaysCorrespondence(startOfDay, endOfDay, request.UnitId);
            var todaysWorkflowSteps = await GetTodaysWorkflowSteps(startOfDay, endOfDay, request.UnitId);
            var completedToday = await GetCompletedToday(startOfDay, endOfDay, request.UnitId);

            // Calculate main metrics
            viewModel.TodaysProcessingCorrespondence = todaysCorrespondence.Count;
            viewModel.CompletionRate = CalculateCompletionRate(todaysCorrespondence, completedToday);
            viewModel.AverageProcessingTimeHours = CalculateAverageProcessingTimeHours(completedToday);

            // Get active units
            var activeUnits = await GetActiveUnits(startOfDay, endOfDay, request.UnitId);
            viewModel.ActiveUnitsCount = activeUnits.Count;
            viewModel.ActiveUnits = activeUnits;

            // Calculate detailed breakdown
            viewModel.Breakdown = await CalculateDailyBreakdown(todaysCorrespondence, todaysWorkflowSteps, completedToday, targetDate);

            return Response<DailyPerformanceSummaryViewModel>.Success(viewModel);
        }
        catch (Exception ex)
        {
            return Response<DailyPerformanceSummaryViewModel>.Fail(
                new List<object>() { ex.Message },
                new MessageResponse() { Code = "Error2000", Message = "خطأ في تحميل ملخص الأداء اليومي" }
            );
        }
    }

    private async Task<List<Correspondence>> GetTodaysCorrespondence(DateTime startOfDay, DateTime endOfDay, Guid? unitId)
    {
        Expression<Func<Correspondence, bool>> filter = c =>
            (c.CreateAt >= startOfDay && c.CreateAt <= endOfDay) ||
            (c.LastUpdateAt.HasValue && c.LastUpdateAt.Value >= startOfDay && c.LastUpdateAt.Value <= endOfDay);

        if (unitId.HasValue)
        {
            var unitIdValue = unitId.Value;
            filter = c => ((c.CreateAt >= startOfDay && c.CreateAt <= endOfDay) ||
                          (c.LastUpdateAt.HasValue && c.LastUpdateAt.Value >= startOfDay && c.LastUpdateAt.Value <= endOfDay)) &&
                         (c.WorkflowSteps.Any(ws => ws.FromUnitId == unitIdValue) ||
                          c.CreateByUser!.OrganizationalUnitId == unitIdValue);
        }

        var correspondences = await _correspondenceRepository.GetAsync(
            filter: filter,
            include: c => c.Include(x => x.WorkflowSteps)
                          .Include(x => x.CreateByUser!)
                          .ThenInclude(u => u.OrganizationalUnit!)
        );

        return correspondences.ToList();
    }

    private async Task<List<WorkflowStep>> GetTodaysWorkflowSteps(DateTime startOfDay, DateTime endOfDay, Guid? unitId)
    {
        Expression<Func<WorkflowStep, bool>> filter = ws =>
            (ws.CreateAt >= startOfDay && ws.CreateAt <= endOfDay) ||
            (ws.LastUpdateAt.HasValue && ws.LastUpdateAt.Value >= startOfDay && ws.LastUpdateAt.Value <= endOfDay);

        if (unitId.HasValue)
        {
            var unitIdValue = unitId.Value;
            filter = ws => ((ws.CreateAt >= startOfDay && ws.CreateAt <= endOfDay) ||
                           (ws.LastUpdateAt.HasValue && ws.LastUpdateAt.Value >= startOfDay && ws.LastUpdateAt.Value <= endOfDay)) &&
                          ws.FromUnitId == unitIdValue;
        }

        var workflowSteps = await _workflowStepRepository.GetAsync(
            filter: filter,
            include: ws => ws.Include(x => x.Correspondence)
                          .Include(x => x.FromUnit!)
        );

        return workflowSteps.ToList();
    }

    private async Task<List<Correspondence>> GetCompletedToday(DateTime startOfDay, DateTime endOfDay, Guid? unitId)
    {
        Expression<Func<Correspondence, bool>> filter = c =>
            c.Status == CorrespondenceStatusEnum.Completed &&
            c.FinalizedAt.HasValue &&
            c.FinalizedAt.Value >= startOfDay && c.FinalizedAt.Value <= endOfDay;

        if (unitId.HasValue)
        {
            var unitIdValue = unitId.Value;
            filter = c => c.Status == CorrespondenceStatusEnum.Completed &&
                         c.FinalizedAt.HasValue &&
                         c.FinalizedAt.Value >= startOfDay && c.FinalizedAt.Value <= endOfDay &&
                         (c.WorkflowSteps.Any(ws => ws.FromUnitId == unitIdValue) ||
                          c.CreateByUser!.OrganizationalUnitId == unitIdValue);
        }

        var completed = await _correspondenceRepository.GetAsync(
            filter: filter,
            include: c => c.Include(x => x.WorkflowSteps)
                          .Include(x => x.CreateByUser!)
                          .ThenInclude(u => u.OrganizationalUnit!)
        );

        return completed.ToList();
    }

    private double CalculateCompletionRate(List<Correspondence> todaysCorrespondence, List<Correspondence> completedToday)
    {
        if (!todaysCorrespondence.Any()) return 0;

        var totalProcessing = todaysCorrespondence.Count(c =>
            c.Status != CorrespondenceStatusEnum.Registered &&
            c.Status != CorrespondenceStatusEnum.Cancelled);

        if (totalProcessing == 0) return 0;

        return Math.Round((double)completedToday.Count / totalProcessing * 100, 2);
    }

    private double CalculateAverageProcessingTimeHours(List<Correspondence> completedToday)
    {
        if (!completedToday.Any() || !completedToday.Any(c => c.FinalizedAt.HasValue)) return 0;

        var processingTimes = completedToday
            .Where(c => c.FinalizedAt.HasValue)
            .Select(c => (c.FinalizedAt!.Value - c.CreateAt).TotalHours)
            .ToList();

        return processingTimes.Any() ? Math.Round(processingTimes.Average(), 2) : 0;
    }

    private async Task<List<ActiveUnitSummary>> GetActiveUnits(DateTime startOfDay, DateTime endOfDay, Guid? unitId)
    {
        var units = await _unitRepository.GetAsync();
        var unitsList = units.ToList();

        if (unitId.HasValue)
        {
            unitsList = unitsList.Where(u => u.Id == unitId.Value).ToList();
        }

        var activeUnits = new List<ActiveUnitSummary>();

        foreach (var unit in unitsList)
        {
            // Get unit's today activities
            var unitCorrespondences = await GetTodaysCorrespondence(startOfDay, endOfDay, unit.Id);
            var unitCompleted = await GetCompletedToday(startOfDay, endOfDay, unit.Id);
            var unitWorkflowSteps = await GetTodaysWorkflowSteps(startOfDay, endOfDay, unit.Id);

            if (unitCorrespondences.Any() || unitWorkflowSteps.Any())
            {
                var processingCount = unitCorrespondences.Count;
                var completedCount = unitCompleted.Count;
                var completionRate = processingCount > 0 ? Math.Round((double)completedCount / processingCount * 100, 2) : 0;
                var avgProcessingTime = CalculateAverageProcessingTimeHours(unitCompleted);
                var activeTasksCount = unitWorkflowSteps.Count(ws =>
                    ws.Status == WorkflowStepStatus.Pending || ws.Status == WorkflowStepStatus.InProgress);

                activeUnits.Add(new ActiveUnitSummary
                {
                    UnitId = unit.Id,
                    UnitName = unit.UnitName,
                    UnitCode = unit.UnitCode,
                    ProcessingCount = processingCount,
                    CompletedCount = completedCount,
                    CompletionRate = completionRate,
                    AverageProcessingTimeHours = avgProcessingTime,
                    ActiveTasksCount = activeTasksCount,
                    PerformanceStatus = CalculatePerformanceStatus(completionRate, avgProcessingTime)
                });
            }
        }

        return activeUnits.OrderByDescending(u => u.CompletionRate).ToList();
    }

    private async Task<DailyBreakdown> CalculateDailyBreakdown(
        List<Correspondence> todaysCorrespondence,
        List<WorkflowStep> todaysWorkflowSteps,
        List<Correspondence> completedToday,
        DateTime targetDate)
    {
        var breakdown = new DailyBreakdown
        {
            IncomingCorrespondence = todaysCorrespondence.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.IncomingExternal),
            OutgoingCorrespondence = todaysCorrespondence.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.OutgoingExternal),
            InternalCorrespondence = todaysCorrespondence.Count(c => c.CorrespondenceType == CorrespondenceTypeEnum.IncomingInternal),
            CompletedToday = completedToday.Count,
            StartedToday = todaysCorrespondence.Count(c => c.CreateAt.Date == targetDate),
            OverdueCompleted = completedToday.Count(c =>
                todaysWorkflowSteps.Any(ws => ws.CorrespondenceId == c.Id &&
                                             ws.DueDate.HasValue &&
                                             ws.DueDate.Value < c.FinalizedAt)),
            OnTimeCompleted = completedToday.Count(c =>
                !todaysWorkflowSteps.Any(ws => ws.CorrespondenceId == c.Id &&
                                              ws.DueDate.HasValue &&
                                              ws.DueDate.Value < c.FinalizedAt))
        };

        breakdown.Velocity = await CalculateVelocity(todaysCorrespondence, completedToday, targetDate);

        return breakdown;
    }

    private async Task<CorrespondenceVelocity> CalculateVelocity(
        List<Correspondence> todaysCorrespondence,
        List<Correspondence> completedToday,
        DateTime targetDate)
    {
        var velocity = new CorrespondenceVelocity
        {
            ItemsPerDay = completedToday.Count,
            ItemsPerHour = completedToday.Count / 24.0
        };

        // Calculate peak processing time
        if (completedToday.Any(c => c.FinalizedAt.HasValue))
        {
            var completionHours = completedToday
                .Where(c => c.FinalizedAt.HasValue)
                .GroupBy(c => c.FinalizedAt!.Value.Hour)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault();

            if (completionHours != null)
            {
                velocity.PeakProcessingTime = new TimeSpan(completionHours.Key, 0, 0);
            }
        }

        // Calculate trend (compare with yesterday)
        var yesterday = targetDate.AddDays(-1);
        var yesterdayCompleted = await GetCompletedToday(yesterday, yesterday.AddDays(1).AddTicks(-1), null);

        if (yesterdayCompleted.Any())
        {
            var todayCount = completedToday.Count;
            var yesterdayCount = yesterdayCompleted.Count;

            if (yesterdayCount > 0)
            {
                var change = ((double)(todayCount - yesterdayCount) / yesterdayCount) * 100;
                velocity.TrendPercentage = Math.Round(Math.Abs(change), 2);

                if (change > 5)
                    velocity.TrendDirection = "Up";
                else if (change < -5)
                    velocity.TrendDirection = "Down";
                else
                    velocity.TrendDirection = "Stable";
            }
        }

        return velocity;
    }

    private string CalculatePerformanceStatus(double completionRate, double avgProcessingTimeHours)
    {
        // Performance scoring based on completion rate and processing time
        if (completionRate >= 90 && avgProcessingTimeHours <= 24)
            return "ممتاز"; // Excellent
        else if (completionRate >= 70 && avgProcessingTimeHours <= 48)
            return "جيد"; // Good
        else if (completionRate >= 50 && avgProcessingTimeHours <= 72)
            return "متوسط"; // Average
        else
            return "ضعيف"; // Poor
    }

    private string FormatDateInArabic(DateTime date)
    {
        var culture = new CultureInfo("ar-SA");
        var dayName = culture.DateTimeFormat.GetDayName(date.DayOfWeek);
        var monthName = GetMonthNameArabic(date.Month);

        return $"{dayName}، {date.Day} {monthName} {date.Year}";
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
