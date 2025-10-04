using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Administration.Templates.Queries.GetCorrespondenceTemplateList;

public class GetCorrespondenceTemplateListQuery : IRequest<Response<PagedResult<CorrespondenceTemplateListViewModel>>>, IPaginationQuery
{
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    public string? SearchText { get; set; }
    // CorrespondenceTemplate no longer has a CorrespondenceType field; removed from query filters.
    public Guid? OrganizationalUnitId { get; set; }
    public Status? Status { get; set; }
}

// Extension method for filtering
public static class CorrespondenceTemplateListQueryExtensions
{
    public static IQueryable<CorrespondenceTemplate> ApplyFilter(this IQueryable<CorrespondenceTemplate> query, GetCorrespondenceTemplateListQuery request)
    {
        var filteredQuery = query.Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            filteredQuery = filteredQuery.Where(x =>
                x.TemplateName.Contains(request.SearchText) ||
                (x.Subject != null && x.Subject.Contains(request.SearchText))
        );
        }
        if (request.OrganizationalUnitId.HasValue)
        {
            filteredQuery = filteredQuery.Where(x => x.OrganizationalUnitId == request.OrganizationalUnitId.Value);
        }

        if (request.Status.HasValue)
        {
            filteredQuery = filteredQuery.Where(x => x.StatusId == request.Status.Value);
        }

        return filteredQuery;
    }
}
