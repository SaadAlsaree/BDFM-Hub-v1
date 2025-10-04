namespace BDFM.Application.Features.Security.Permissions.Queries.GetPermissionById;

public class GetPermissionByIdQuery : IRequest<Response<PermissionViewModel>>
{
    public Guid Id { get; set; }
}
