using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Administration.ExternalEntities.Queries.GetExternalEntityList;

public class GetExternalEntityListQuery : IRequest<Response<PagedResult<ExternalEntityListViewModel>>>, IPaginationQuery
{
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    public string? SearchText { get; set; }
    public EntityType? EntityType { get; set; }
    public Status? Status { get; set; }
}

// Let's use the filter approach by extending the IQueryable directly
public static class ExternalEntityListQueryExtensions
{
    public static IQueryable<ExternalEntity> ApplyFilter(this IQueryable<ExternalEntity> query, GetExternalEntityListQuery request)
    {
        var filteredQuery = query.Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            filteredQuery = filteredQuery.Where(x =>
                x.EntityName.Contains(request.SearchText) ||
                x.EntityCode.Contains(request.SearchText) ||
                (x.ContactInfo != null && x.ContactInfo.Contains(request.SearchText)));
        }

        if (request.EntityType.HasValue)
        {
            filteredQuery = filteredQuery.Where(x => x.EntityType == request.EntityType.Value);
        }

        if (request.Status.HasValue)
        {
            filteredQuery = filteredQuery.Where(x => x.StatusId == request.Status.Value);
        }

        return filteredQuery;
    }
}
