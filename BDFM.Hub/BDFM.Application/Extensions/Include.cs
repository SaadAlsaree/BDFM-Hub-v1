namespace BDFM.Application.Extensions;

public static class IncludeExtensions
{
    public static IQueryable<TEntity> ApplyIncludes<TEntity>(this IQueryable<TEntity> query, Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include)
        where TEntity : class
    {
        if (include != null)
        {
            query = include(query);
        }

        return query;
    }
}
