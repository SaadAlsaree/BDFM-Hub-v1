namespace BDFM.Application.Features.Utility.BaseUtility.Command.Update;

public abstract class UpdateHandler<TEntity, TCommand> where TCommand : IRequest<Response<bool>>
{
    protected readonly IBaseRepository<TEntity> _repository;

    protected UpdateHandler(IBaseRepository<TEntity> repository)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    public abstract Expression<Func<TEntity, bool>> EntityPredicate(TCommand request);

    public async Task<Response<bool>> HandleBase(TCommand request, CancellationToken cancellationToken)
    {
        var resp = await _repository.UpdateEntity(EntityPredicate(request), request, cancellationToken);

        return !resp ? ErrorsMessage.FailOnUpdate.ToErrorMessage(false) : SuccessMessage.Update.ToSuccessMessage(true);
    }
}
