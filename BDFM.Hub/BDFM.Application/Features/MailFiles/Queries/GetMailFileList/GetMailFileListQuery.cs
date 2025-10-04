using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.MailFiles.Queries.GetMailFileList;

public class GetMailFileListQuery : IRequest<Response<PagedResult<MailFileListViewModel>>>, IPaginationQuery
{
    // IPaginationQuery implementation
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    public string? SortField { get; set; }
    public string? SortDirection { get; set; }

    // Filter properties
    public string? SearchTerm { get; set; }
    public int? StatusId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}
