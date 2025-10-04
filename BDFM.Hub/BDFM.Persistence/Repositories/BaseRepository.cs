

namespace BDFM.Persistence.Repositories;
public class BaseRepository<TEntity> : IDisposable, IBaseRepository<TEntity> where TEntity : class
{
    public BDFMDbContext DbContext;
    internal DbSet<TEntity> dbSet;
    #region IDisposable Support
    private bool _disposedValue;

    protected virtual void Dispose(bool disposing)
    {
        if (_disposedValue) return;
        if (disposing)
        {
        }
        _disposedValue = true;
    }

    ~BaseRepository()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    public void Dispose()
    {
        Dispose(true);
        DbContext.Dispose();
        GC.SuppressFinalize(this);
    }


    #endregion
    public BaseRepository(BDFMDbContext context)
    {
        DbContext = context;
        dbSet = context.Set<TEntity>();
    }
    public IQueryable<TEntity> GetQueryable()
    {
        return dbSet.AsQueryable();
    }
    public async Task<TEntity> Create(TEntity entity, CancellationToken cancellationToken = default)
    {
        var result = await dbSet.AddAsync(entity, cancellationToken);
        DbContext.SaveChanges();
        return result.Entity;
    }
    public async Task<bool> CreateRange(List<TEntity> entities, int batchSize = 100, CancellationToken cancellationToken = default)
    {
        dbSet.AddRange(entities);
        return (await DbContext.SaveChangesAsync(cancellationToken)) > 0;
    }

    public virtual IEnumerable<TEntity> GetWithRawSql(string query, params object[] parameters)
    {
        return dbSet.FromSqlRaw(query, parameters).ToList();
    }
    public virtual async Task<IEnumerable<TEntity>> GetWithRawSqlAsync(string query, CancellationToken cancellationToken = default, params object[] parameters)
    {
        return await dbSet.FromSqlRaw(query, parameters).ToListAsync(cancellationToken: cancellationToken);
    }
    public virtual bool Update(TEntity entity)
    {
        dbSet.Attach(entity);
        DbContext.Entry(entity).State = EntityState.Modified;
        var result = DbContext.SaveChanges();
        return result > 0;
    }
    public virtual async Task<TEntity> Find(Expression<Func<TEntity, bool>> filter = null!, Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null!, Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!, CancellationToken cancellationToken = default)
    {
        IQueryable<TEntity> query = dbSet;
        if (filter != null)
        {
            query = query.Where(filter);
        }
        if (include != null)
        {
            query = include(query);
        }
        if (orderBy != null)
        {
            return await orderBy(query).FirstOrDefaultAsync(cancellationToken: cancellationToken);
        }
        else
        {
            return await query.FirstOrDefaultAsync(cancellationToken: cancellationToken);
        }
    }
    public async Task<int> CountAsync(Expression<Func<TEntity, bool>> filter = null!, Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!, CancellationToken cancellationToken = default)
    {
        IQueryable<TEntity> query = dbSet;
        if (filter != null)
        {
            query = query.Where(filter);
        }
        if (include != null)
        {

            query = include(query);
        }
        return await query.CountAsync(cancellationToken: cancellationToken);
    }

    public virtual IEnumerable<TEntity> Get(Expression<Func<TEntity, bool>> filter, Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy, Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include, int take, int skip)
    {
        IQueryable<TEntity> query = dbSet;
        //string tableName, string columnName, string searchTerm,
        //if (!string.IsNullOrEmpty(tableName) && !string.IsNullOrEmpty(columnName) && !string.IsNullOrEmpty(searchTerm))
        //{
        //    var entityType = DbContext.Model.FindEntityType("HRM.Hub.Domain.Entities.Main." + tableName);
        //    entityType ??= DbContext.Model.FindEntityType("HRM.Hub.Domain.Entities.Public." + tableName);
        //    if (entityType == null)
        //        throw new ArgumentException($"Table '{tableName}' not found.");

        //    var parameter = Expression.Parameter(entityType.ClrType, "x");
        //    var property = Expression.Property(parameter, columnName);
        //    var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });
        //    var searchTermExpression = Expression.Constant(searchTerm, typeof(string));
        //    var containsExpression = Expression.Call(property, containsMethod, searchTermExpression);
        //    var lambda = Expression.Lambda<Func<TEntity, bool>>(containsExpression, parameter);
        //    query = query.Where(lambda);
        //}
        if (filter != null)
        {
            query = query.Where(filter);
        }
        if (include != null)
        {

            query = include(query);
        }
        if (orderBy != null)
        {

            if (take == -1 && skip == -1)
            {
                return orderBy(query).ToList();
            }
            else if (take == -1)
            {
                return orderBy(query).Skip(skip).ToList();
            }
            else if (skip == -1)
            {
                return orderBy(query).Take(take).ToList();
            }
            else
            {
                return (query).Skip(skip).Take(take).ToList();
            }
        }
        else
        {
            if (take == -1 && skip == -1)
            {
                return query.ToList();
            }
            else if (take == -1)
            {
                return query.Skip(skip).ToList();
            }
            else if (skip == -1)
            {
                return query.Take(take).ToList();
            }
            else
            {
                return query.Skip(skip).Take(take).ToList();
            }
        }
    }

    public virtual (IEnumerable<TResult>, int) Get<TResult>(Expression<Func<TEntity, bool>> filter = null!, Expression<Func<TEntity, TResult>> selector = null!, Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null!, Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!, int take = -1, int skip = -1)
    {
        IQueryable<TEntity> query = dbSet;
        if (filter != null)
        {
            query = query.Where(filter);
        }
        if (include != null)
        {
            query = include(query);
        }
        if (orderBy != null)
        {

            if (take == -1 && skip == -1)
            {
                return (orderBy(query).AsNoTracking().Select(selector).ToList(), query.Count());
            }
            else if (take == -1)
            {
                return (orderBy(query).Skip(skip).AsNoTracking().Select(selector).ToList(), query.Count());
            }
            else if (skip == -1)
            {
                return (orderBy(query).Take(take).AsNoTracking().Select(selector).ToList(), query.Count());
            }
            else
            {
                return ((query).Skip(skip).Take(take).AsNoTracking().Select(selector).ToList(), query.Count());
            }
        }
        else
        {
            if (take == -1 && skip == -1)
            {
                return (query.AsNoTracking().Select(selector).ToList(), query.Count());
            }
            else if (take == -1)
            {
                return (query.Skip(skip).AsNoTracking().Select(selector).ToList(), query.Count());
            }
            else if (skip == -1)
            {
                return (query.Take(take).AsNoTracking().Select(selector).ToList(), query.Count());
            }
            else
            {
                return (query.Skip(skip).Take(take).AsNoTracking().Select(selector).ToList(), query.Count());
            }
        }
    }

    public async Task<(IEnumerable<TResult>, int)> GetAsync<TResult>(Expression<Func<TEntity, bool>> filter = null!, Expression<Func<TEntity, TResult>> selector = null!, Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null!, Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!, int take = -1, int skip = -1, CancellationToken cancellationToken = default)
    {
        IQueryable<TEntity> query = dbSet;
        if (filter != null)
        {
            query = query.Where(filter);
        }
        if (include != null)
        {
            query = include(query);
        }
        if (orderBy != null)
        {

            if (take == -1 && skip == -1)
            {
                return (await orderBy(query).AsNoTracking().Select(selector).ToListAsync(cancellationToken: cancellationToken), await query.CountAsync(cancellationToken: cancellationToken));
            }
            else if (take == -1)
            {
                return (await orderBy(query).Skip(skip).AsNoTracking().Select(selector).ToListAsync(cancellationToken: cancellationToken), await query.CountAsync(cancellationToken: cancellationToken));
            }
            else if (skip == -1)
            {
                return (await orderBy(query).Take(take).AsNoTracking().Select(selector).ToListAsync(cancellationToken: cancellationToken), await query.CountAsync(cancellationToken: cancellationToken));
            }
            else
            {
                return (await orderBy(query).Skip(skip).Take(take).AsNoTracking().Select(selector).ToListAsync(cancellationToken: cancellationToken), await query.CountAsync(cancellationToken: cancellationToken));
            }
        }
        else
        {
            if (take == -1 && skip == -1)
            {
                return (await query.AsNoTracking().Select(selector).ToListAsync(cancellationToken: cancellationToken), await query.CountAsync(cancellationToken: cancellationToken));
            }
            else if (take == -1)
            {
                return (await query.Skip(skip).AsNoTracking().Select(selector).ToListAsync(cancellationToken: cancellationToken), await query.CountAsync(cancellationToken: cancellationToken));
            }
            else if (skip == -1)
            {
                return (await query.Take(take).AsNoTracking().Select(selector).ToListAsync(cancellationToken: cancellationToken), await query.CountAsync(cancellationToken: cancellationToken));
            }
            else
            {
                return (await query.Skip(skip).Take(take).AsNoTracking().Select(selector).ToListAsync(cancellationToken: cancellationToken), await query.CountAsync(cancellationToken: cancellationToken));
            }
        }
    }

    public IQueryable<TEntity> Query(Expression<Func<TEntity, bool>> filter = null!, Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!)
    {
        IQueryable<TEntity> query = dbSet;
        if (filter != null)
        {
            query = query.Where(filter);
        }
        if (include != null)
        {
            query = include(query);
        }
        return query;
    }

    public async Task<bool> UpdateRange(IEnumerable<TEntity> entities, int batchSize = 100, CancellationToken cancellationToken = default)
    {
        dbSet.UpdateRange(entities);
        await DbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> UpdateEntity(Expression<Func<TEntity, bool>> filter, object updatedProperties, CancellationToken cancellationToken = default)
    {
        if (filter == null)
            return false;

        var entityToUpdate = await dbSet.Where(filter).FirstOrDefaultAsync();

        if (entityToUpdate != null)
        {
            var propertiesToUpdate = updatedProperties.GetType().GetProperties();

            foreach (var propertyInfo in propertiesToUpdate)
            {
                var entityProperty = entityToUpdate.GetType().GetProperty(propertyInfo.Name);
                if (entityProperty != null && entityProperty.CanWrite)
                {
                    var newValue = propertyInfo.GetValue(updatedProperties, null);
                    entityProperty.SetValue(entityToUpdate, newValue);
                }
            }
            try
            {
                dbSet.Entry(entityToUpdate).State = EntityState.Modified;
                await DbContext.SaveChangesAsync(cancellationToken);
                return true;
            }
            catch (Exception)
            {

                return false;
            }
        }
        return false;
    }

    public async Task<bool> CreateEntity(object entityToCreate, CancellationToken cancellationToken = default)
    {
        if (entityToCreate == null)
            return false;

        var entityType = typeof(TEntity);
        var entity = Activator.CreateInstance(entityType);

        var propertiesToSet = entityToCreate.GetType().GetProperties();
        foreach (var propertyInfo in propertiesToSet)
        {
            var entityProperty = entityType.GetProperty(propertyInfo.Name);
            if (entityProperty != null && entityProperty.CanWrite)
            {
                var newValue = propertyInfo.GetValue(entityToCreate, null);
                entityProperty.SetValue(entity, newValue);
            }
        }
        try
        {
            await dbSet.AddAsync((TEntity)entity!, cancellationToken);
            await DbContext.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<IEnumerable<TEntity>> GetAsync(Expression<Func<TEntity, bool>> filter = null!, Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null!, Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> include = null!, int take = -1, int skip = -1)
    {
        IQueryable<TEntity> query = dbSet;
        if (filter != null)
        {
            query = query.Where(filter);
        }
        if (include != null)
        {

            query = include(query);
        }
        if (orderBy != null)
        {

            if (take == -1 && skip == -1)
            {
                return await orderBy(query).ToListAsync();
            }
            else if (take == -1)
            {
                return await orderBy(query).Skip(skip).ToListAsync();
            }
            else if (skip == -1)
            {
                return await orderBy(query).Take(take).ToListAsync();
            }
            else
            {
                return await (query).Skip(skip).Take(take).ToListAsync();
            }
        }
        else
        {
            if (take == -1 && skip == -1)
            {
                return query.ToList();
            }
            else if (take == -1)
            {
                return await query.Skip(skip).ToListAsync();
            }
            else if (skip == -1)
            {
                return await query.Take(take).ToListAsync();
            }
            else
            {
                return await query.Skip(skip).Take(take).ToListAsync();
            }
        }
    }

    public async Task<bool> Delete(TEntity entity, CancellationToken cancellationToken = default)
    {
        dbSet.Remove(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteRange(IEnumerable<TEntity> entities, int batchSize = 100, CancellationToken cancellationToken = default)
    {
        dbSet.RemoveRange(entities);
        await DbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteEntity(Expression<Func<TEntity, bool>> filter, CancellationToken cancellationToken = default)
    {
        var entity = await dbSet.Where(filter).FirstOrDefaultAsync();
        if (entity != null)
        {
            dbSet.Remove(entity);
            await DbContext.SaveChangesAsync(cancellationToken);
            return true;
        }
        return false;
    }
}

