using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetUserDrafts
{
    public class GetUserDraftsQuery : IRequest<Response<PagedResult<DraftItemVm>>>, IPaginationQuery
    {
        // Pagination parameters
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;

    }

    // Extension method for filtering
    public static class GetUserDraftsQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilter(this IQueryable<Correspondence> query, GetUserDraftsQuery request, Guid currentUserId)
        {
            var filteredQuery = query.Where(x => !x.IsDeleted && x.IsDraft == true && x.CorrespondenceType == CorrespondenceTypeEnum.Draft);

            return filteredQuery;
        }
    }
}
