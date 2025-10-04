namespace BDFM.Application.Features.Security.Roles.Queries.GetRoleById;

public class GetRoleByIdQuery : IRequest<Response<RoleViewModel>>
{
    public Guid Id { get; set; }
}
