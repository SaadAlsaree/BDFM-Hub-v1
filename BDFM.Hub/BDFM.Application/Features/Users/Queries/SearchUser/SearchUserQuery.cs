namespace BDFM.Application.Features.Users.Queries.SearchUser
{
    public class SearchUserQuery : IRequest<Response<IEnumerable<SearchUserVm>>>
    {
        public string User { get; set; } = string.Empty;

    }
}
