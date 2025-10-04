using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Users.Queries.GetAllUsers;

public class GetAllUsersQueryHandler : GetAllWithCountHandler<User, UserListViewModel, GetAllUsersQuery>,
    IRequestHandler<GetAllUsersQuery, Response<PagedResult<UserListViewModel>>>
{
    public GetAllUsersQueryHandler(IBaseRepository<User> repository)
        : base(repository)
    {
    }

    public override Expression<Func<User, UserListViewModel>> Selector => u => new UserListViewModel
    {
        Id = u.Id,
        Username = u.Username,
        UserLogin = u.UserLogin,
        FullName = u.FullName,
        Email = u.Email,
        OrganizationalUnitId = u.OrganizationalUnitId,
        OrganizationalUnitName = u.OrganizationalUnit != null ? u.OrganizationalUnit.UnitName : null,
        PositionTitle = u.PositionTitle,
        IsActive = u.IsActive,
        CreateAt = u.CreateAt,
        Status = (int)u.StatusId
    };

    public override Func<IQueryable<User>, IOrderedQueryable<User>> OrderBy => query => query.OrderBy(u => u.Username);

    public async Task<Response<PagedResult<UserListViewModel>>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.Query();

        // Apply filters
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(searchTerm) ||
                u.UserLogin.ToLower().Contains(searchTerm) ||
                u.FullName.ToLower().Contains(searchTerm) ||
                (u.Email != null && u.Email.ToLower().Contains(searchTerm)));
        }

        if (request.OrganizationalUnitId.HasValue)
        {
            query = query.Where(u => u.OrganizationalUnitId == request.OrganizationalUnitId.Value);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == request.IsActive.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(u => (int)u.StatusId == request.Status.Value);
        }

        // Include related entities
        query = query.Include(u => u.OrganizationalUnit);

        // Apply pagination and get results
        var result = await query
            .OrderBy(u => u.Username)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(Selector)
            .ToListAsync(cancellationToken);

        var count = await query.CountAsync(cancellationToken);

        if (!result.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<UserListViewModel>>(null!);

        // Set StatusName for each user
        result.ForEach(u => u.StatusName = ((Status)u.Status).GetDisplayName());

        var pagedResult = new PagedResult<UserListViewModel>
        {
            Items = result,
            TotalCount = count
        };

        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }
}
