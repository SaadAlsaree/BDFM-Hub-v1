using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Security;

namespace BDFM.Application.Features.Security.Permissions.Queries.GetPermissionList;

public class GetPermissionListQueryHandler :
    GetAllWithCountHandler<Permission, PermissionListViewModel, GetPermissionListQuery>,
    IRequestHandler<GetPermissionListQuery, Response<PagedResult<PermissionListViewModel>>>
{
    public GetPermissionListQueryHandler(IBaseRepository<Permission> repository) : base(repository)
    {
    }

    public override Expression<Func<Permission, PermissionListViewModel>> Selector => p => new PermissionListViewModel
    {
        Id = p.Id,
        Name = p.Name,
        Value = p.Value,
        Description = p.Description,
        Status = (int)p.StatusId
    };

    public override Func<IQueryable<Permission>, IOrderedQueryable<Permission>> OrderBy =>
        q => q.OrderByDescending(p => p.CreateAt);

    public async Task<Response<PagedResult<PermissionListViewModel>>> Handle(
        GetPermissionListQuery request,
        CancellationToken cancellationToken)
    {
        var query = _repository.Query();

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            query = query.Where(p =>
                p.Name.Contains(request.SearchTerm) ||
                p.Value.Contains(request.SearchTerm) ||
                (p.Description != null && p.Description.Contains(request.SearchTerm)));
        }

        if (request.Status.HasValue)
        {
            query = query.Where(p => (int)p.StatusId == request.Status.Value);
        }

        return await HandleBase(request, cancellationToken);
    }
}
