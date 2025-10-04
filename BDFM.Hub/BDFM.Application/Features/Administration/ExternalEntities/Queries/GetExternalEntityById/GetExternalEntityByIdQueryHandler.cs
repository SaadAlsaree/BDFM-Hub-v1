using BDFM.Application.Features.Utility.BaseUtility.Query.GetById;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Administration.ExternalEntities.Queries.GetExternalEntityById;

public class GetExternalEntityByIdQueryHandler : GetByIdHandler<ExternalEntity, ExternalEntityViewModel, GetExternalEntityByIdQuery>,
    IRequestHandler<GetExternalEntityByIdQuery, Response<ExternalEntityViewModel>>
{
    public GetExternalEntityByIdQueryHandler(IBaseRepository<ExternalEntity> repository)
        : base(repository)
    {
    }

    public override Expression<Func<ExternalEntity, bool>> IdPredicate(GetExternalEntityByIdQuery request)
    {
        return entity => entity.Id == request.Id && !entity.IsDeleted;
    }

    public override Expression<Func<ExternalEntity, ExternalEntityViewModel>> Selector => entity => new ExternalEntityViewModel
    {
        Id = entity.Id,
        EntityName = entity.EntityName,
        EntityCode = entity.EntityCode,
        EntityType = entity.EntityType,
        EntityTypeName = entity.EntityType.HasValue ? entity.EntityType.Value.GetDisplayName() : string.Empty,
        ContactInfo = entity.ContactInfo,
        Status = entity.StatusId,
        CreateAt = entity.CreateAt,
        CreateBy = entity.CreateBy,
        LastUpdateAt = entity.LastUpdateAt,
        LastUpdateBy = entity.LastUpdateBy
    };

    public async Task<Response<ExternalEntityViewModel>> Handle(GetExternalEntityByIdQuery request, CancellationToken cancellationToken)
    {
        return await HandleBase(request, cancellationToken);
    }
}
