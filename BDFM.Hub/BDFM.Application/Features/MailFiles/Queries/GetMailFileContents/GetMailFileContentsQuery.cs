namespace BDFM.Application.Features.MailFiles.Queries.GetMailFileContents;

public class GetMailFileContentsQuery : IRequest<Response<MailFileWithContentsViewModel>>, IPaginationQuery
{
    public Guid MailFileId { get; set; }

    // IPaginationQuery implementation for correspondence paging
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    public string? SortField { get; set; }
    public string? SortDirection { get; set; }

    // Filter properties for correspondences
    public string? SearchTerm { get; set; }
    public int? StatusId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
