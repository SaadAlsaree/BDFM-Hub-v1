namespace BDFM.Application.Contracts.Persistence;
public interface IBaseRepository<TEntity> : IDisposable
{

    IQueryable<TEntity> GetQueryable();
    Task<TEntity> Create(TEntity entity, CancellationToken cancellationToken = default);
    Task<bool> CreateRange(List<TEntity> entities, int batchSize = 100, CancellationToken cancellationToken = default);
    IEnumerable<TEntity> GetWithRawSql(string query, params object[] parameters);
    Task<IEnumerable<TEntity>> GetWithRawSqlAsync(string query, CancellationToken cancellationToken = default, params object[] parameters);
    IEnumerable<TEntity> Get(
        Expression<Func<TEntity, bool>> filter = null!,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null!,
        Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!,
        int take = -1,
        int skip = -1);
    Task<IEnumerable<TEntity>> GetAsync(
        Expression<Func<TEntity, bool>> filter = null!,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null!,
        Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!,
        int take = -1,
        int skip = -1);
    (IEnumerable<TResult>, int) Get<TResult>(
    Expression<Func<TEntity, bool>> filter = null!,
    Expression<Func<TEntity, TResult>> selector = null!,
    Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null!,
    Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!,
    int take = -1, int skip = -1);


    Task<(IEnumerable<TResult>, int)> GetAsync<TResult>(
    Expression<Func<TEntity, bool>> filter = null!,
    Expression<Func<TEntity, TResult>> selector = null!,
    Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null!,
    Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!,
    int take = -1, int skip = -1, CancellationToken cancellationToken = default);

    IQueryable<TEntity> Query(
    Expression<Func<TEntity, bool>> filter = null!,
    Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!);
    Task<bool> UpdateEntity(Expression<Func<TEntity, bool>> filter, object updatedProperties, CancellationToken cancellationToken = default);
    Task<bool> CreateEntity(object entityToCreate, CancellationToken cancellationToken = default);
    bool Update(TEntity entity);
    Task<bool> UpdateRange(IEnumerable<TEntity> entities, int batchSize = 100, CancellationToken cancellationToken = default);
    Task<TEntity> Find(Expression<Func<TEntity, bool>> filter = null!,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null!,
        Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!, CancellationToken cancellationToken = default);

    Task<int> CountAsync(Expression<Func<TEntity, bool>> filter = null!,
        Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!, CancellationToken cancellationToken = default);

    Task<bool> Delete(TEntity entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteRange(IEnumerable<TEntity> entities, int batchSize = 100, CancellationToken cancellationToken = default);
    Task<bool> DeleteEntity(Expression<Func<TEntity, bool>> filter, CancellationToken cancellationToken = default);
}
