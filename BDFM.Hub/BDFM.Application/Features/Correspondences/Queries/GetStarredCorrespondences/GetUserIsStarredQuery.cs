using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetStarredCorrespondences
{
    public class GetUserIsStarredQuery : IRequest<Response<PagedResult<StarredItemVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;

    }


    // Extension method for filtering
    public static class GetUserIsStarredQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilter(this IQueryable<Correspondence> query, GetUserIsStarredQuery request, Guid currentUserId)
        {
            var filteredQuery = query.Where(x => !x.IsDeleted && x.UserCorrespondenceInteractions.Any(uci => uci.UserId == currentUserId && uci.IsStarred == true));

            return filteredQuery;
        }
    }
}
