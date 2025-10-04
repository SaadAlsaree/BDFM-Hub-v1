using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetTrashItems
{
    public class GetTrashItemsQuery : IRequest<Response<PagedResult<TrashItemVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;

    }


    // Extension method for filtering
    public static class GetUserInboxQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilter(this IQueryable<Correspondence> query, GetTrashItemsQuery request, Guid currentUserId)
        {
            var filteredQuery = query.Where(x => !x.IsDeleted && x.UserCorrespondenceInteractions.Any(uci => uci.IsInTrash == true && uci.UserId == currentUserId));

            return filteredQuery;
        }
    }
}
