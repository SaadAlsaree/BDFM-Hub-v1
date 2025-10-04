namespace BDFM.Application.Helper.Pagination;

public class PaginationQuery : IPaginationQuery
{
    public int Page { get; set; }
    public byte PageSize { get; set; }
}
