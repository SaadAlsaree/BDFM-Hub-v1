using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.Users.Queries.GetAllUsers;

public class GetAllUsersQuery : PaginationQuery, IRequest<Response<PagedResult<UserListViewModel>>>
{
    public string? SearchTerm { get; set; }
    public Guid? OrganizationalUnitId { get; set; }
    public bool? IsActive { get; set; }
    public int? Status { get; set; }
}
