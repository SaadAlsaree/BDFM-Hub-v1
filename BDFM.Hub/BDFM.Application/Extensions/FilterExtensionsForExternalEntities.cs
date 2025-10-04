using BDFM.Application.Features.Administration.ExternalEntities.Queries.GetExternalEntityList;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Application.Extensions;

public static class FilterExtensionsForExternalEntities
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
