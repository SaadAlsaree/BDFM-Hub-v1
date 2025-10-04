using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.Delegations.Queries.GetDelegationById;

public class GetDelegationByIdQueryHandler : GetByIdHandler<Delegation, DelegationViewModel, GetDelegationByIdQuery>,
    IRequestHandler<GetDelegationByIdQuery, Response<DelegationViewModel>>
{
    public GetDelegationByIdQueryHandler(IBaseRepository<Delegation> repository) : base(repository)
    {
    }

    public override Expression<Func<Delegation, bool>> IdPredicate(GetDelegationByIdQuery request)
    {
        return d => d.Id == request.Id;
    }

    public override Expression<Func<Delegation, DelegationViewModel>> Selector => d => new DelegationViewModel
    {
        Id = d.Id,
        DelegatorUserId = d.DelegatorUserId,
        DelegatorUserName = d.DelegatorUser != null ? d.DelegatorUser.FullName : string.Empty,
        DelegateeUserId = d.DelegateeUserId,
        DelegateeUserName = d.DelegateeUser != null ? d.DelegateeUser.FullName : string.Empty,
        PermissionId = d.PermissionId,
        PermissionName = d.Permission != null ? d.Permission.Name : null,
        RoleId = d.RoleId,
        RoleName = d.Role != null ? d.Role.Name : null,
        StartDate = d.StartDate,
        EndDate = d.EndDate,
        IsActive = d.IsActive,
        StatusId = (int)d.StatusId,
        StatusName = d.StatusId.GetDisplayName(),
        CreatedDate = d.CreateAt,
        LastModifiedDate = d.LastUpdateAt
    };

    public async Task<Response<DelegationViewModel>> Handle(GetDelegationByIdQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
