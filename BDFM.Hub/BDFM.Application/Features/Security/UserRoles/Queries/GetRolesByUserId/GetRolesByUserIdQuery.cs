using MediatR;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Application.Helper.Pagination;
using System;

namespace BDFM.Application.Features.Security.UserRoles.Queries.GetRolesByUserId;

public class GetRolesByUserIdQuery : IRequest<Response<PagedResult<RolesByUserViewModel>>>, IPaginationQuery
{
    public Guid UserId { get; set; }
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
}
