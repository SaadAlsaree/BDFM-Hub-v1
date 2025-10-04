namespace BDFM.Application.Features.MailFiles.Queries.SearchMailFIles
{
    public class SearchMailFilesQuery : IRequest<Response<IEnumerable<SearchMailFilesVm>>>
    {
        public string SearchTerm { get; set; } = string.Empty;
    }
}
