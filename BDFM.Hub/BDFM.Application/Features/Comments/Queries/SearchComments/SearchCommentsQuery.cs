namespace BDFM.Application.Features.Comments.Queries.SearchComments;

public class SearchCommentsQuery : IRequest<Response<IEnumerable<SearchCommentsViewModel>>>
{
    public string SearchTerm { get; set; } = string.Empty;
    public Guid? CorrespondenceId { get; set; }
}
