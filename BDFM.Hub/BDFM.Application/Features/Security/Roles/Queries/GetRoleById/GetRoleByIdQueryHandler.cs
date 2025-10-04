using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;

namespace BDFM.Application.Features.Security.Roles.Queries.GetRoleById;

public class GetRoleByIdQueryHandler : GetByIdHandler<BDFM.Domain.Entities.Security.Role, RoleViewModel, GetRoleByIdQuery>,
    IRequestHandler<GetRoleByIdQuery, Response<RoleViewModel>>
{
    public GetRoleByIdQueryHandler(IBaseRepository<BDFM.Domain.Entities.Security.Role> repository) : base(repository)
    {
    }

    public override Expression<Func<BDFM.Domain.Entities.Security.Role, bool>> IdPredicate(GetRoleByIdQuery request)
    {
        return r => r.Id == request.Id;
    }

    public override Expression<Func<BDFM.Domain.Entities.Security.Role, RoleViewModel>> Selector => r => new RoleViewModel
    {
        Id = r.Id,
        Name = r.Name,
        Value = r.Value,
        Description = r.Description,
        StatusId = (int)r.StatusId,
        StatusName = r.StatusId.GetDisplayName(),
        CreateAt = r.CreateAt,
        UserCount = r.UserRoles.Count,
        LastModifiedDate = r.LastUpdateAt,
        Delegations = r.Delegations.Select(d => new DelegationDto
        {
            DelegatorUserId = d.DelegatorUserId,
            DelegateeUserId = d.DelegateeUserId,
            PermissionId = d.PermissionId,
            PermissionName = d.Permission!.Name,
            RoleId = d.RoleId,
            RoleValue = d.Role!.Value,
            StartDate = d.StartDate,
            EndDate = d.EndDate,
            IsActive = d.IsActive
        }).ToList()
    };

    public async Task<Response<RoleViewModel>> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
