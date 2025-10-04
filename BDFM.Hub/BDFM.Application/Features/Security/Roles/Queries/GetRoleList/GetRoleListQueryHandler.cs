using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.Security.Roles.Queries.GetRoleList;

public class GetRoleListQueryHandler :
    GetAllWithCountHandler<BDFM.Domain.Entities.Security.Role, RoleListViewModel, GetRoleListQuery>,
    IRequestHandler<GetRoleListQuery, Response<PagedResult<RoleListViewModel>>>
{
    public GetRoleListQueryHandler(IBaseRepository<BDFM.Domain.Entities.Security.Role> repository)
        : base(repository)
    {
    }

    public override Expression<Func<BDFM.Domain.Entities.Security.Role, RoleListViewModel>> Selector => r => new RoleListViewModel
    {
        Id = r.Id,
        Name = r.Name,
        Value = r.Value,
        Description = r.Description,
        StatusId = (int)r.StatusId,
        StatusName = r.StatusId.GetDisplayName(),
        CreatedDate = r.CreateAt,
        UserCount = r.UserRoles.Count
    };

    public override Func<IQueryable<BDFM.Domain.Entities.Security.Role>, IOrderedQueryable<BDFM.Domain.Entities.Security.Role>> OrderBy =>
        query => query.OrderBy(r => r.Name);

    public async Task<Response<PagedResult<RoleListViewModel>>> Handle(GetRoleListQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.Query();

        // Apply filters
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(r =>
                r.Name.ToLower().Contains(searchTerm) ||
                r.Value.ToLower().Contains(searchTerm) ||
                (r.Description != null && r.Description.ToLower().Contains(searchTerm)));
        }

        if (request.StatusId.HasValue)
        {
            query = query.Where(r => (int)r.StatusId == request.StatusId.Value);
        }

        // Include UserRoles for counting

        query = query.Include(r => r.UserRoles);

        // Apply pagination and get results
        var result = await query
            .OrderBy(r => r.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(Selector)
            .ToListAsync(cancellationToken);

        var count = await query.CountAsync(cancellationToken);

        if (!result.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<RoleListViewModel>>(null!);

        // Set StatusName for each role
        result.ForEach(r => r.StatusName = ((Status)r.StatusId).ToString());

        var pagedResult = new PagedResult<RoleListViewModel>
        {
            Items = result,
            TotalCount = count
        };

        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }
}
