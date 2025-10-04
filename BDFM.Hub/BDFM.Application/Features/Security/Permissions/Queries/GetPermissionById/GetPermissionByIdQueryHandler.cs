using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.Permissions.Queries.GetPermissionById;

public class GetPermissionByIdQueryHandler :
    GetByIdHandler<Permission, PermissionViewModel, GetPermissionByIdQuery>,
    IRequestHandler<GetPermissionByIdQuery, Response<PermissionViewModel>>
{
    public GetPermissionByIdQueryHandler(IBaseRepository<Permission> repository) : base(repository)
    {
    }

    public override Expression<Func<Permission, PermissionViewModel>> Selector => p => new PermissionViewModel
    {
        Id = p.Id,
        Name = p.Name,
        Value = p.Value,
        Description = p.Description,
        Status = (int)p.StatusId
    };

    public override Expression<Func<Permission, bool>> IdPredicate(GetPermissionByIdQuery request)
    {
        return e => e.Id == request.Id;
    }

    public async Task<Response<PermissionViewModel>> Handle(
        GetPermissionByIdQuery request,
        CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
