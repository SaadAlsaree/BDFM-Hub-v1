namespace BDFM.Application.Features.Correspondences.Queries.GetPending;

using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

public class GetPendingQuery : IRequest<Response<PagedResult<PendingItemVm>>>, IPaginationQuery
{
    // Pagination parameters
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
}

public static class GetPendingQueryExtensions
{
    public static IQueryable<Correspondence> ApplyFilter(this IQueryable<Correspondence> query, GetPendingQuery request, Guid currentUserId)
    {
        // Pending correspondences are those not deleted, not draft and with active statuses
        var filteredQuery = query.Where(x => !x.IsDeleted && x.IsDraft == false && (x.Status == CorrespondenceStatusEnum.PendingReferral));

        return filteredQuery;
    }
}
