namespace BDFM.Application.Features.Utility.BaseUtility.Query.GetById;

public abstract class GetByIdHandler<TEntity, TViewModel, TQuery>
    where TQuery : IRequest<Response<TViewModel>>
{
    protected readonly IBaseRepository<TEntity> _repository;

    protected GetByIdHandler(IBaseRepository<TEntity> repository)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    public abstract Expression<Func<TEntity, bool>> IdPredicate(TQuery request);

    public abstract Expression<Func<TEntity, TViewModel>> Selector { get; }

    public async Task<Response<TViewModel>> HandleBase(TQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository
            .Query(IdPredicate(request))
            .Select(Selector)
            .FirstOrDefaultAsync(cancellationToken: cancellationToken);

        // Check if the entity has StatusId property and set StatusName accordingly
        // This avoids issues with models that don't have Status property
        if (entity != null)
        {
            dynamic dynamicEntity = entity;
            if (HasProperty(entity, "StatusId") && HasProperty(entity, "StatusName"))
            {
                dynamicEntity.StatusName = ((Status)dynamicEntity.StatusId).GetDisplayName();
            }
        }

        return SuccessMessage.Get.ToSuccessMessage(entity);
    }

    // Helper method to check if an object has a specific property
    private static bool HasProperty(object obj, string propertyName)
    {
        return obj.GetType().GetProperty(propertyName) != null;
    }
}
