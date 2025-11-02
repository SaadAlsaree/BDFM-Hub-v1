using AutoMapper;
using BDFM.Application.Features.Dashboard.Queries.GetDashboardOverview;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;

namespace BDFM.Application.Features.Dashboard.Queries.GetBacklogDetails;

public class GetBacklogDetailsHandler : IRequestHandler<GetBacklogDetailsQuery, Response<BacklogDetailsViewModel>>
{
    private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
    private readonly IBaseRepository<OrganizationalUnit> _unitRepository;
    private readonly IMapper _mapper;

    public GetBacklogDetailsHandler(
        IBaseRepository<WorkflowStep> workflowStepRepository,
        IBaseRepository<OrganizationalUnit> unitRepository,
        IMapper mapper)
    {
        _workflowStepRepository = workflowStepRepository;
        _unitRepository = unitRepository;
        _mapper = mapper;
    }

    public async Task<Response<BacklogDetailsViewModel>> Handle(GetBacklogDetailsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Build filter for backlogged tasks
            Expression<Func<WorkflowStep, bool>> filter = ws =>
                ws.Status == WorkflowStepStatus.Pending || ws.Status == WorkflowStepStatus.InProgress;

            if (request.UnitId.HasValue)
            {
                var unitIdValue = request.UnitId.Value;
                filter = ws => (ws.Status == WorkflowStepStatus.Pending || ws.Status == WorkflowStepStatus.InProgress) &&
                              ws.FromUnitId == unitIdValue;
            }

            if (request.Status.HasValue)
            {
                var statusValue = request.Status.Value;
                filter = ws => (ws.Status == WorkflowStepStatus.Pending || ws.Status == WorkflowStepStatus.InProgress) &&
                              ws.Status == statusValue;
            }

            if (request.DaysOverdue.HasValue)
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-request.DaysOverdue.Value);
                var existingFilter = filter;
                filter = ws => existingFilter.Compile()(ws) &&
                              ws.DueDate.HasValue && ws.DueDate.Value < cutoffDate;
            }

            var workflowSteps = await _workflowStepRepository.GetAsync(
                filter: filter,
                include: ws => ws.Include(x => x.Correspondence)
                              .Include(x => x.FromUnit!)
            );

            var workflowStepsList = workflowSteps.ToList();

            var viewModel = new BacklogDetailsViewModel
            {
                Summary = await CalculateBacklogSummary(workflowStepsList, request.UnitId, cancellationToken)
            };

            if (request.IncludeTaskDetails)
            {
                viewModel.TaskDetails = GetTaskDetails(workflowStepsList);
            }

            if (!request.UnitId.HasValue) // Only show unit breakdown if not filtering by specific unit
            {
                viewModel.UnitBreakdown = await GetUnitBreakdown(workflowStepsList, cancellationToken);
            }

            return Response<BacklogDetailsViewModel>.Success(viewModel);
        }
        catch (Exception ex)
        {
            return Response<BacklogDetailsViewModel>.Fail(
                new List<object>() { ex.Message },
                new MessageResponse() { Code = "Error2000", Message = "خطأ في تحميل بيانات المهام المتأخرة" }
            );
        }
    }

    private async Task<BacklogMetrics> CalculateBacklogSummary(List<WorkflowStep> workflowSteps, Guid? unitId, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var endOfWeek = today.AddDays(7 - (int)now.DayOfWeek);

        var overdueTasks = workflowSteps.Where(ws => ws.DueDate.HasValue && ws.DueDate.Value < now).ToList();
        var tasksDueToday = workflowSteps.Where(ws => ws.DueDate.HasValue && DateOnly.FromDateTime(ws.DueDate.Value) == today).ToList();
        var tasksDueThisWeek = workflowSteps.Where(ws => ws.DueDate.HasValue && DateOnly.FromDateTime(ws.DueDate.Value) <= endOfWeek).ToList();

        var averageAge = workflowSteps.Any()
            ? workflowSteps.Average(ws => (now - ws.CreateAt).TotalDays)
            : 0;

        var unitBacklogs = new List<UnitBacklogSummary>();
        if (!unitId.HasValue)
        {
            var units = await _unitRepository.GetAsync();
            unitBacklogs = units
                .Select(unit => new UnitBacklogSummary
                {
                    UnitId = unit.Id,
                    UnitName = unit.UnitName,
                    BackloggedTasks = workflowSteps.Count(ws => ws.FromUnitId == unit.Id),
                    OverdueTasks = overdueTasks.Count(ws => ws.FromUnitId == unit.Id)
                })
                .Where(ub => ub.BackloggedTasks > 0)
                .OrderByDescending(ub => ub.BackloggedTasks)
                .Take(10)
                .ToList();
        }

        return new BacklogMetrics
        {
            TotalBackloggedTasks = workflowSteps.Count,
            OverdueTasks = overdueTasks.Count,
            TasksDueToday = tasksDueToday.Count,
            TasksDueThisWeek = tasksDueThisWeek.Count,
            AverageTaskAge = Math.Round(averageAge, 1),
            ByUnit = unitBacklogs
        };
    }

    private List<BacklogTaskDetail> GetTaskDetails(List<WorkflowStep> workflowSteps)
    {
        var now = DateTime.UtcNow;

        return workflowSteps
            .Select(ws => new BacklogTaskDetail
            {
                TaskId = ws.Id,
                CorrespondenceId = ws.CorrespondenceId ?? Guid.Empty,
                CorrespondenceSubject = ws.Correspondence?.Subject ?? "N/A",
                MailNum = ws.Correspondence?.MailNum ?? "N/A",
                Status = ws.Status,
                StatusName = ws.Status.GetDisplayName(),
                ActionType = ws.ActionType,
                ActionTypeName = ws.ActionType.GetDisplayName(),
                CreatedDate = ws.CreateAt,
                DueDate = ws.DueDate,
                DaysInBacklog = (int)(now - ws.CreateAt).TotalDays,
                DaysOverdue = ws.DueDate.HasValue && ws.DueDate.Value < now
                    ? (int)(now - ws.DueDate.Value).TotalDays
                    : null,
                FromUnitName = ws.FromUnit?.UnitName ?? "Unknown Unit",
                InstructionText = ws.InstructionText,
                IsTimeSensitive = ws.IsTimeSensitive
            })
            .OrderByDescending(t => t.DaysOverdue ?? 0)
            .ThenByDescending(t => t.DaysInBacklog)
            .ToList();
    }

    private async Task<List<UnitBacklogDetail>> GetUnitBreakdown(List<WorkflowStep> workflowSteps, CancellationToken cancellationToken)
    {
        var units = await _unitRepository.GetAsync();
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var endOfWeek = today.AddDays(7 - (int)now.DayOfWeek);

        return units
            .Select(unit =>
            {
                var unitTasks = workflowSteps.Where(ws => ws.FromUnitId == unit.Id).ToList();
                var unitOverdueTasks = unitTasks.Where(ws => ws.DueDate.HasValue && ws.DueDate.Value < now).ToList();

                return new UnitBacklogDetail
                {
                    UnitId = unit.Id,
                    UnitName = unit.UnitName,
                    BackloggedTasks = unitTasks.Count,
                    OverdueTasks = unitOverdueTasks.Count,
                    AverageTaskAge = unitTasks.Any() ? Math.Round(unitTasks.Average(ws => (now - ws.CreateAt).TotalDays), 1) : 0,
                    TasksDueToday = unitTasks.Count(ws => ws.DueDate.HasValue && DateOnly.FromDateTime(ws.DueDate.Value) == today),
                    TasksDueThisWeek = unitTasks.Count(ws => ws.DueDate.HasValue && DateOnly.FromDateTime(ws.DueDate.Value) <= endOfWeek),
                    TopOverdueTasks = GetTaskDetails(unitOverdueTasks.Take(5).ToList())
                };
            })
            .Where(ub => ub.BackloggedTasks > 0)
            .OrderByDescending(ub => ub.OverdueTasks)
            .ThenByDescending(ub => ub.BackloggedTasks)
            .ToList();
    }
}
