

namespace BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

// Additional type for encapsulating results and total count
public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = default!;
    public int TotalCount { get; set; }
}

public abstract class GetAllWithCountHandler<TEntity, TViewModel, TQuery>
    where TQuery : class, IRequest<Response<PagedResult<TViewModel>>>, IPaginationQuery where TEntity : class
{
    protected readonly IBaseRepository<TEntity> _repository;

    protected GetAllWithCountHandler(IBaseRepository<TEntity> repository)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    public abstract Expression<Func<TEntity, TViewModel>> Selector { get; }

    public abstract Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> OrderBy { get; }

    public async Task<Response<PagedResult<TViewModel>>> HandleBase(TQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.Query();
        var result = await query
            .ApplyFilter(request)
            .ApplyPagination(request)
            .Select(Selector)
            .ToListAsync(cancellationToken: cancellationToken);
        var count = await query
            .ApplyFilter(request).CountAsync(cancellationToken: cancellationToken);

        if (!result.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<PagedResult<TViewModel>>(null!);

        result.ToList().ForEach(x =>
        {
            (x! as dynamic).StatusName = ((Status)(x as dynamic).Status).GetDisplayName();
        });

        var pagedResult = new PagedResult<TViewModel>
        {
            Items = result,
            TotalCount = count
        };

        return SuccessMessage.Get.ToSuccessMessage(pagedResult);
    }
}
