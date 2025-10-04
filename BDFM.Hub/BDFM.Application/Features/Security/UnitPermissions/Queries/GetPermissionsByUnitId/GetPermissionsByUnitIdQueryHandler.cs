using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.UnitPermissions.Queries.GetPermissionsByUnitId;

public class GetPermissionsByUnitIdQueryHandler : GetAllWithCountHandler<UnitPermission, PermissionsByUnitViewModel, GetPermissionsByUnitIdQuery>, IRequestHandler<GetPermissionsByUnitIdQuery, Response<PagedResult<PermissionsByUnitViewModel>>>
{
    public GetPermissionsByUnitIdQueryHandler(IBaseRepository<UnitPermission> repository) : base(repository)
    {
    }

    public override Expression<Func<UnitPermission, PermissionsByUnitViewModel>> Selector => x => new PermissionsByUnitViewModel
    {
        Id = x.Id,
        PermissionId = x.PermissionId,
        PermissionName = x.Permission.Name,
        PermissionValue = x.Permission.Value,
        PermissionDescription = x.Permission.Description,
        GrantedBySystemAdmin = x.GrantedBySystemAdmin,
        CreateAt = x.CreateAt,

    };


    public override Func<IQueryable<UnitPermission>, IOrderedQueryable<UnitPermission>> OrderBy => throw new NotImplementedException();

    public Task<Response<PagedResult<PermissionsByUnitViewModel>>> Handle(GetPermissionsByUnitIdQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
