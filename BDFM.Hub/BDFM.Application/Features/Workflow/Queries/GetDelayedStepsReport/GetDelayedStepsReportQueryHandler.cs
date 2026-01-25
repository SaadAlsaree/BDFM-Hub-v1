using BDFM.Application.Contracts.Persistence;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Workflow;
using BDFM.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using BDFM.Domain.Common;

namespace BDFM.Application.Features.Workflow.Queries.GetDelayedStepsReport;

public class GetDelayedStepsReportQueryHandler : IRequestHandler<GetDelayedStepsReportQuery, Response<List<DelayedStepReportDto>>>
{
    private readonly IBaseRepository<WorkflowStep> _workflowStepRepository;
    private readonly IBaseRepository<User> _userRepository;
    private readonly IBaseRepository<OrganizationalUnit> _unitRepository;
    private readonly ILogger<GetDelayedStepsReportQueryHandler> _logger;

    public GetDelayedStepsReportQueryHandler(
        IBaseRepository<WorkflowStep> workflowStepRepository,
        IBaseRepository<User> userRepository,
        IBaseRepository<OrganizationalUnit> unitRepository,
        ILogger<GetDelayedStepsReportQueryHandler> logger)
    {
        _workflowStepRepository = workflowStepRepository;
        _userRepository = userRepository;
        _unitRepository = unitRepository;
        _logger = logger;
    }

    public async Task<Response<List<DelayedStepReportDto>>> Handle(GetDelayedStepsReportQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        // Base query for delayed steps
        var query = _workflowStepRepository.Query()
            .Include(x => x.Correspondence)
            .Where(ws => ws.DueDate.HasValue &&
                         ws.DueDate.Value < now &&
                         (ws.Status == WorkflowStepStatus.Pending || ws.Status == WorkflowStepStatus.InProgress) &&
                         !ws.IsDeleted &&
                         ws.IsActive);

        // Apply filters based on RecipientType
        var delayedSteps = await query.ToListAsync(cancellationToken);

        // Filter in memory for complex logic (or refine query if possible)
        // We need to fetch User and Unit details to group them.

        var result = new List<DelayedStepReportDto>();

        // 1. Process User Recipients
        if (request.IncludeUsers)
        {
            var userStepIds = delayedSteps
                .Where(x => x.ToPrimaryRecipientType == RecipientTypeEnum.User)
                .Select(x => x.ToPrimaryRecipientId)
                .Distinct()
                .ToList();

            if (userStepIds.Any())
            {
                var users = await _userRepository.Query()
                    .Where(u => userStepIds.Contains(u.Id))
                    // If filtering by Unit, check the user's unit
                    .Where(u => !request.OrganizationalUnitId.HasValue || u.OrganizationalUnitId == request.OrganizationalUnitId)
                    .Select(u => new { u.Id, u.FullName })
                    .ToListAsync(cancellationToken);

                foreach (var user in users)
                {
                    var stepsForUser = delayedSteps
                        .Where(x => x.ToPrimaryRecipientType == RecipientTypeEnum.User && x.ToPrimaryRecipientId == user.Id)
                        .ToList();

                    if (stepsForUser.Any())
                    {
                        var dto = new DelayedStepReportDto
                        {
                            AssigneeId = user.Id,
                            AssigneeName = user.FullName,
                            AssigneeType = "User",
                            DelayedStepsCount = stepsForUser.Count,
                            DelayedSteps = stepsForUser.Select(MapToDetail).ToList()
                        };
                        result.Add(dto);
                    }
                }
            }
        }

        // 2. Process Unit Recipients
        if (request.IncludeUnits)
        {
            var unitStepIds = delayedSteps
                .Where(x => x.ToPrimaryRecipientType == RecipientTypeEnum.Unit)
                .Select(x => x.ToPrimaryRecipientId)
                .Distinct()
                .ToList();

            if (unitStepIds.Any())
            {
                var units = await _unitRepository.Query()
                    .Where(u => unitStepIds.Contains(u.Id))
                    // If filtering by Unit, check if this IS the unit (or maybe child units? - adhering to simple filter for now)
                    .Where(u => !request.OrganizationalUnitId.HasValue || u.Id == request.OrganizationalUnitId)
                    .Select(u => new { u.Id, u.UnitName })
                    .ToListAsync(cancellationToken);

                foreach (var unit in units)
                {
                    var stepsForUnit = delayedSteps
                        .Where(x => x.ToPrimaryRecipientType == RecipientTypeEnum.Unit && x.ToPrimaryRecipientId == unit.Id)
                        .ToList();

                    if (stepsForUnit.Any())
                    {
                        var dto = new DelayedStepReportDto
                        {
                            AssigneeId = unit.Id,
                            AssigneeName = unit.UnitName,
                            AssigneeType = "OrganizationalUnit",
                            DelayedStepsCount = stepsForUnit.Count,
                            DelayedSteps = stepsForUnit.Select(MapToDetail).ToList()
                        };
                        result.Add(dto);
                    }
                }
            }
        }

        return Response<List<DelayedStepReportDto>>.Success(result.OrderByDescending(x => x.DelayedStepsCount).ToList());
    }

    private DelayedStepDetailDto MapToDetail(WorkflowStep step)
    {
        var now = DateTime.UtcNow;
        return new DelayedStepDetailDto
        {
            StepId = step.Id,
            StepName = step.InstructionText ?? step.ActionType.ToString(),
            CorrespondenceSubject = step.Correspondence?.Subject ?? "No Subject",
            CorrespondenceNumber = step.Correspondence?.MailNum ?? "No Number",
            DueDate = step.DueDate,
            DaysLate = step.DueDate.HasValue ? (now - step.DueDate.Value).Days : 0,
            Status = step.Status
        };
    }
}
