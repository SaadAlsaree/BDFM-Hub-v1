namespace BDFM.Application.Features.Users.Queries.GetUserById;

public class GetUserByIdQuery : IRequest<Response<UserViewModel>>
{
    public Guid Id { get; set; }
}
