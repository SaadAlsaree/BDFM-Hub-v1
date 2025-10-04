using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Common; // Add this for EnumExtensions

namespace BDFM.Application.Features.Administration.ExternalEntities.Queries.GetExternalEntityList;

public class GetExternalEntityListQueryHandler : GetAllWithCountHandler<ExternalEntity, ExternalEntityListViewModel, GetExternalEntityListQuery>,
    IRequestHandler<GetExternalEntityListQuery, Response<PagedResult<ExternalEntityListViewModel>>>
{
    public GetExternalEntityListQueryHandler(IBaseRepository<ExternalEntity> repository)
        : base(repository)
    {
    }

    public override Expression<Func<ExternalEntity, ExternalEntityListViewModel>> Selector => entity => new ExternalEntityListViewModel
    {
        Id = entity.Id,
        EntityName = entity.EntityName,
        EntityCode = entity.EntityCode,
        EntityType = entity.EntityType,
        // EntityTypeName will be set after materialization
        Status = entity.StatusId,
        CreateAt = entity.CreateAt
    };

    public override Func<IQueryable<ExternalEntity>, IOrderedQueryable<ExternalEntity>> OrderBy => query => query.OrderByDescending(x => x.CreateAt);

    public async Task<Response<PagedResult<ExternalEntityListViewModel>>> Handle(GetExternalEntityListQuery request, CancellationToken cancellationToken)
    {
        var result = await HandleBase(request, cancellationToken);

        // Check if the result is successful and has data
        if (result.Succeeded && result.Data != null && result.Data.Items != null)
        {
            // Set EntityTypeName in memory after EF query
            foreach (var item in result.Data.Items)
            {
                item.EntityTypeName = item.EntityType.HasValue ? item.EntityType.Value.GetDisplayNameSafe() : string.Empty;
            }
        }

        return result;
    }
}
