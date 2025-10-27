using BDFM.Application.Contracts.Identity;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.CustomWorkflows.Queries.GetCustomWorkflowList;

internal class GetCustomWorkflowListHandler : GetAllWithCountHandler<CustomWorkflow, GetCustomWorkflowListVm, GetCustomWorkflowListQuery>,
                        IRequestHandler<GetCustomWorkflowListQuery, Response<PagedResult<GetCustomWorkflowListVm>>>

{
    private readonly IBaseRepository<User> _userRepository;
    private readonly IBaseRepository<OrganizationalUnit> _unitRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetCustomWorkflowListHandler(IBaseRepository<CustomWorkflow> repository,
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

    public override Expression<Func<CustomWorkflow, GetCustomWorkflowListVm>> Selector =>
        e => new GetCustomWorkflowListVm
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

    public override Func<IQueryable<CustomWorkflow>, IOrderedQueryable<CustomWorkflow>> OrderBy =>
        query => query.OrderByDescending(x => x.CreateAt);

    public async Task<Response<PagedResult<GetCustomWorkflowListVm>>> Handle(GetCustomWorkflowListQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.Query();

        // Apply unit-based filtering
        var isAdmin = _currentUserService.HasRole("Admin") || _currentUserService.HasRole("SuAdmin");

        if (!isAdmin)
        {
            // Regular users can only access workflows from their organizational unit
            var userUnitId = _currentUserService.OrganizationalUnitId;

            if (userUnitId.HasValue)
            {
                query = query.Where(x => x.TriggeringUnitId == userUnitId.Value);
            }
            else
            {
                // If user has no organizational unit, they cannot access any workflows
                query = query.Where(x => false);
            }
        }
        // Admin and SuAdmin can access all workflows (no additional filtering needed)

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(u =>
                u.WorkflowName.ToLower().Contains(searchTerm) ||
                (u.Description != null && u.Description.ToLower().Contains(searchTerm))
            );
        }

        // Apply pagination and get results
        var result = await query
            .OrderBy(x => x.CreateAt)
            .ApplyPagination(request)
            .Select(Selector)
            .ToListAsync(cancellationToken: cancellationToken);

        var count = await query
            .CountAsync(cancellationToken: cancellationToken);

        if (!result.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<GetCustomWorkflowListVm>>(null!);

        var pagedResult = new PagedResult<GetCustomWorkflowListVm>
        {
            Items = result,
            TotalCount = count
        };
        // Resolve TargetIdentifierName for each step similarly to GetCustomWorkflowByIdHandler
        foreach (var vmItem in pagedResult.Items)
        {
            foreach (var step in vmItem.Steps)
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
                            if (Guid.TryParse(step.TargetIdentifier, out var unitId2))
                            {
                                var unit = await _unit_repository_check_and_find(_unitRepository, unitId2, cancellationToken);
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
                                var unit = await _unit_repository_check_and_find(_unitRepository, unitId3, cancellationToken);
                                step.TargetIdentifierName = unit != null ? $"رئيس الجهاز - {unit.UnitName}" : step.TargetIdentifier;
                            }
                            else
                            {
                                step.TargetIdentifierName = step.TargetIdentifier;
                            }
                            break;

                        case CustomWorkflowTargetTypeEnum.RoleInUnit:
                        default:
                            step.TargetIdentifierName = step.TargetIdentifier;
                            break;
                    }
                }
                catch
                {
                    step.TargetIdentifierName = step.TargetIdentifier;
                }
            }
        }

        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }

    // small helper used above to avoid duplicating try/catch logic for unit find
    private static async Task<OrganizationalUnit?> _unit_repository_check_and_find(IBaseRepository<OrganizationalUnit> repo, Guid id, CancellationToken cancellationToken)
    {
        if (repo == null) return null;
        try
        {
            return await repo.Find(u => u.Id == id, include: null!, cancellationToken: cancellationToken);
        }
        catch
        {
            return null;
        }
    }
}
