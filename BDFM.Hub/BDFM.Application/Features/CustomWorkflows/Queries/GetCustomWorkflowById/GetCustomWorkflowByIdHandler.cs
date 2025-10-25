using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.CustomWorkflows.Queries.GetCustomWorkflowById;

internal class GetCustomWorkflowByIdHandler : GetByIdHandler<CustomWorkflow, GetCustomWorkflowByIdVm, GetCustomWorkflowByIdQuery>,
                        IRequestHandler<GetCustomWorkflowByIdQuery, Response<GetCustomWorkflowByIdVm>>
{
    private readonly IBaseRepository<User> _userRepository;
    private readonly IBaseRepository<OrganizationalUnit> _unitRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetCustomWorkflowByIdHandler(
        IBaseRepository<CustomWorkflow> repository,
        IBaseRepository<User> userRepository,
        IBaseRepository<OrganizationalUnit> unitRepository,
        ICurrentUserService currentUserService) : base(repository)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _unit_repository_check(unitRepository);
        _unitRepository = unitRepository ?? throw new ArgumentNullException(nameof(unitRepository));
        _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
    }

    // Small helper to keep a clearer exception message when unit repository missing
    private static void _unit_repository_check(IBaseRepository<OrganizationalUnit>? repo)
    {
        if (repo == null) throw new ArgumentNullException(nameof(repo));
    }

    public override Expression<Func<CustomWorkflow, bool>> IdPredicate(GetCustomWorkflowByIdQuery request)
    {
        // Check if user is Admin or SuAdmin - they can access all workflows
        var isAdmin = _currentUserService.HasRole("Admin") || _currentUserService.HasRole("SuAdmin");

        if (isAdmin)
        {
            // Admin and SuAdmin can access all workflows
            return x => x.Id == request.Id && !x.IsDeleted;
        }

        // Regular users can only access workflows from their organizational unit
        var userUnitId = _currentUserService.OrganizationalUnitId;

        if (userUnitId.HasValue)
        {
            return x => x.Id == request.Id &&
                       !x.IsDeleted &&
                       x.TriggeringUnitId == userUnitId.Value;
        }

        // If user has no organizational unit, they cannot access any workflows
        return x => false;
    }

    public override Expression<Func<CustomWorkflow, GetCustomWorkflowByIdVm>> Selector =>
        e => new GetCustomWorkflowByIdVm
        {
            Id = e.Id,
            WorkflowName = e.WorkflowName,
            TriggeringUnitId = e.TriggeringUnitId,
            TriggeringUnitName = e.TriggeringUnit!.UnitName,
            TriggeringCorrespondenceType = e.TriggeringCorrespondenceType,
            TriggeringCorrespondenceTypeName = e.TriggeringCorrespondenceType.HasValue ? e.TriggeringCorrespondenceType.Value.GetDisplayName() : string.Empty,
            Description = e.Description,
            IsEnabled = e.IsEnabled,
            CreateAt = e.CreateAt,
            LastUpdateAt = e.LastUpdateAt,
            CreateBy = e.CreateBy.ToString(),
            Status = (int)e.StatusId,
            StatusName = ((Status)e.StatusId).GetDisplayName(),
            LastUpdateBy = e.LastUpdateBy.ToString(),
            Steps = e.Steps.Select(s => new CustomWorkflowStepDto
            {
                Id = s.Id,
                WorkflowId = s.WorkflowId,
                StepOrder = s.StepOrder,
                ActionType = s.ActionType,
                ActionTypeName = s.ActionType.GetDisplayName(),
                TargetType = s.TargetType,
                TargetTypeName = s.TargetType.GetDisplayName(),
                TargetIdentifier = s.TargetIdentifier,
                // cannot reliably navigate related User/Unit inside projection here, will resolve after projection
                TargetIdentifierName = string.Empty,
                DefaultInstructionText = s.DefaultInstructionText,
                DefaultDueDateOffsetDays = s.DefaultDueDateOffsetDays,
                Sequence = s.Sequence,
                IsActive = s.IsActive
            }).ToList()
        };

    public async Task<Response<GetCustomWorkflowByIdVm>> Handle(GetCustomWorkflowByIdQuery request, CancellationToken cancellationToken)
    {
        // Get projected VM (this avoids tracking and brings minimal data)
        var vm = await _repository
            .Query(IdPredicate(request))
            .Select(Selector)
            .FirstOrDefaultAsync(cancellationToken: cancellationToken);

        if (vm == null)
            return SuccessMessage.Get.ToSuccessMessage<GetCustomWorkflowByIdVm>(null!);

        // Helper local function to check properties (we can't access base.HasProperty)
        static bool HasProperty(object obj, string propertyName) => obj.GetType().GetProperty(propertyName) != null;

        // Resolve TargetIdentifierName for each step based on TargetType
        foreach (var step in vm.Steps)
        {
            if (string.IsNullOrWhiteSpace(step.TargetIdentifier))
            {
                step.TargetIdentifierName = string.Empty;
                continue;
            }

            try
            {
                switch (step.TargetType)
                {
                    case CustomWorkflowTargetTypeEnum.SpecificUser:
                        if (Guid.TryParse(step.TargetIdentifier, out var userId))
                        {
                            var user = await _userRepository.Find(u => u.Id == userId, include: null!, cancellationToken: cancellationToken);
                            step.TargetIdentifierName = user != null
                                ? (!string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : user.Username)
                                : step.TargetIdentifier;
                        }
                        else
                        {
                            step.TargetIdentifierName = step.TargetIdentifier;
                        }
                        break;

                    case CustomWorkflowTargetTypeEnum.SpecificUnit:
                        if (Guid.TryParse(step.TargetIdentifier, out var unitId))
                        {
                            var unit = await _unitRepository.Find(u => u.Id == unitId, include: null!, cancellationToken: cancellationToken);
                            step.TargetIdentifierName = unit != null ? unit.UnitName : step.TargetIdentifier;
                        }
                        else
                        {
                            step.TargetIdentifierName = step.TargetIdentifier;
                        }
                        break;

                    case CustomWorkflowTargetTypeEnum.ManagerOfUnit:
                        // TargetIdentifier is expected to be UnitId. We don't store manager user here so provide a label
                        if (Guid.TryParse(step.TargetIdentifier, out var unitId2))
                        {
                            var unit = await _unitRepository.Find(u => u.Id == unitId2, include: null!, cancellationToken: cancellationToken);
                            step.TargetIdentifierName = unit != null ? $"مدير الوحدة - {unit.UnitName}" : step.TargetIdentifier;
                        }
                        else
                        {
                            step.TargetIdentifierName = step.TargetIdentifier;
                        }
                        break;

                    case CustomWorkflowTargetTypeEnum.HeadOfDevice:
                        if (Guid.TryParse(step.TargetIdentifier, out var unitId3))
                        {
                            var unit = await _unitRepository.Find(u => u.Id == unitId3, include: null!, cancellationToken: cancellationToken);
                            step.TargetIdentifierName = unit != null ? $"رئيس الجهاز - {unit.UnitName}" : step.TargetIdentifier;
                        }
                        else
                        {
                            step.TargetIdentifierName = step.TargetIdentifier;
                        }
                        break;

                    case CustomWorkflowTargetTypeEnum.RoleInUnit:
                    default:
                        // For roles or unknowns, show identifier as-is (usually a role name or code)
                        step.TargetIdentifierName = step.TargetIdentifier;
                        break;
                }
            }
            catch
            {
                step.TargetIdentifierName = step.TargetIdentifier;
            }
        }

        // Ensure StatusName is set (similar to base handler behavior)
        try
        {
            if (HasProperty(vm, "StatusId") && HasProperty(vm, "StatusName"))
            {
                var statusProp = vm.GetType().GetProperty("StatusId");
                var statusVal = statusProp?.GetValue(vm);
                if (statusVal != null && int.TryParse(statusVal.ToString(), out var statusInt))
                {
                    vm.StatusName = ((Status)statusInt).GetDisplayName();
                }
            }
        }
        catch
        {
            // ignore
        }

        return SuccessMessage.Get.ToSuccessMessage(vm);
    }

}
