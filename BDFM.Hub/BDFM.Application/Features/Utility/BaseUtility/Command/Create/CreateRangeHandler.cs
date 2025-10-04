namespace BDFM.Application.Features.Utility.BaseUtility.Command.Create;

public abstract class CreateRangeHandler<TEntity, TCommand> where TCommand : IRequest<Response<bool>>
{
    private readonly IBaseRepository<TEntity> _repository;

    protected CreateRangeHandler(IBaseRepository<TEntity> repository)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    protected abstract Expression<Func<TEntity, bool>> ExistencePredicate(TCommand request);

    protected abstract IEnumerable<TEntity> MapToEntity(TCommand request);

    protected async Task<Response<bool>> HandleBase(TCommand request, CancellationToken cancellationToken)
    {
        if (ExistencePredicate(request) != null)
        {
            var checkIfExist = await _repository.Find(ExistencePredicate(request), cancellationToken: cancellationToken);

            if (checkIfExist != null)
                return ErrorsMessage.ExistOnCreate.ToErrorMessage(false);
        }

        var entity = MapToEntity(request);
        entity.ToList().ForEach(z =>
        {
            (z! as dynamic).StatusId = Status.Unverified;
        });
        var resp = await _repository.CreateRange(entity.ToList(), cancellationToken: cancellationToken);
        return resp ? SuccessMessage.Create.ToSuccessMessage(true) : ErrorsMessage.FailOnCreate.ToErrorMessage(false);
    }
}
