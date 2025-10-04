using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetPostponedCorrespondences
{
    public class GetPostponedCorrespondencesQuery : IRequest<Response<PagedResult<GetPostponedCorrespondencesVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
    }


    public static class GetPostponedCorrespondencesQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilterPostponed(this IQueryable<Correspondence> query, Guid currentUserId)
        {
            var filteredQuery = query.Where(x => !x.IsDeleted
                && x.UserCorrespondenceInteractions.Any(ui => ui.UserId == currentUserId
                    && ui.PostponedUntil.HasValue
                    && ui.PostponedUntil.Value <= DateTime.UtcNow));

            return filteredQuery;
        }
    }

}
