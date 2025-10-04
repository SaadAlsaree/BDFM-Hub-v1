namespace BDFM.Application.Helper.Pagination;

public interface IPaginationQuery
{
    int Page { get; set; }
    byte PageSize { get; set; }
}
