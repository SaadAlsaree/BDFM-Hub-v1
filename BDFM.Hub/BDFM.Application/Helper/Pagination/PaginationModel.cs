namespace BDFM.Application.Helper.Pagination;

public class PaginationModel : IPaginationQuery
{
    public int Page { get; set; }
    public byte PageSize { get; set; }
}
