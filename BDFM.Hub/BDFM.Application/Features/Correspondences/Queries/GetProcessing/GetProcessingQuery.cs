using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetProcessing
{
    public class GetProcessingQuery : IRequest<Response<PagedResult<ProcessingItemVm>>>, IPaginationQuery
    {
        // Pagination parameters
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
    }

    public static class GetProcessingQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilter(this IQueryable<Correspondence> query, GetProcessingQuery request, Guid currentUserId)
        {
            // Processing correspondences are those actively under processing
            var filteredQuery = query.Where(x => !x.IsDeleted && x.IsDraft == false && x.Status == CorrespondenceStatusEnum.UnderProcessing);

            return filteredQuery;
        }
    }
}
