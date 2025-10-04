

namespace BDFM.Application.Extensions;

public static class Pagination
{
    public static IQueryable<T> ApplyPagination<T>(this IQueryable<T> query, IPaginationQuery queryObj)
    {
        if (queryObj.Page <= 0)
            queryObj.Page = 1;
        if (queryObj.PageSize <= 1)
            queryObj.PageSize = 10;
        return query.Skip((queryObj.Page - 1) * queryObj.PageSize).Take(queryObj.PageSize);
    }
}
