namespace BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

public abstract class GetAllHandler<TEntity, TViewModel, TQuery>
    where TQuery : IRequest<Response<IEnumerable<TViewModel>>>
{
    protected readonly IBaseRepository<TEntity> _repository;

    protected GetAllHandler(IBaseRepository<TEntity> repository)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    public abstract Expression<Func<TEntity, TViewModel>> Selector { get; }

    public abstract Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> OrderBy { get; }

    public async Task<Response<IEnumerable<TViewModel>>> HandleBase(TQuery request, CancellationToken cancellationToken)
    {
        var (result, count) = await _repository.GetAsync(
            selector: Selector,
            orderBy: OrderBy,
            cancellationToken: cancellationToken
        );

        if (!result.Any())
            return ErrorsMessage.NotFoundData.ToErrorMessage<IEnumerable<TViewModel>>(null!);

        return SuccessMessage.Get.ToSuccessMessage(result);
    }
}
