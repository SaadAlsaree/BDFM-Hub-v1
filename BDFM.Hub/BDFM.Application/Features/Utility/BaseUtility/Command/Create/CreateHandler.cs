namespace BDFM.Application.Features.Utility.BaseUtility.Command.Create;

public abstract class CreateHandler<TEntity, TCommand> where TCommand : IRequest<Response<bool>>
{
    private readonly IBaseRepository<TEntity> _repository;

    protected CreateHandler(IBaseRepository<TEntity> repository)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    protected abstract Expression<Func<TEntity, bool>> ExistencePredicate(TCommand request);

    protected abstract TEntity MapToEntity(TCommand request);

    protected async Task<Response<bool>> HandleBase(TCommand request, CancellationToken cancellationToken)
    {
        if (ExistencePredicate(request) != null)
        {
            var checkIfExist = await _repository.Find(ExistencePredicate(request), cancellationToken: cancellationToken);

            if (checkIfExist != null)
                return ErrorsMessage.ExistOnCreate.ToErrorMessage(false);
        }
        var entity = MapToEntity(request);
        (entity! as dynamic).StatusId = Status.Unverified;
        var resp = await _repository.Create(entity, cancellationToken);

        return resp == null ? ErrorsMessage.FailOnCreate.ToErrorMessage(false) : SuccessMessage.Create.ToSuccessMessage(true);
    }
}
