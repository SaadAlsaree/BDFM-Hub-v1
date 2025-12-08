using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetStarredCorrespondences
{
    public class GetUserIsStarredQuery : IRequest<Response<PagedResult<StarredItemVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
        public DateOnly? MailDate { get; set; }
        public string? SearchTerm { get; set; }
        public string? MailNum { get; set; }
    }


    // Extension method for filtering
    public static class GetUserIsStarredQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilterUserIsStarred(this IQueryable<Correspondence> query, GetUserIsStarredQuery request, Guid currentUserId)
        {
            var filteredQuery = query.Where(x => !x.IsDeleted && x.UserCorrespondenceInteractions.Any(uci => uci.UserId == currentUserId && uci.IsStarred == true));

            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                filteredQuery = filteredQuery.Where(x => x.Subject.Contains(request.SearchTerm) || x.BodyText!.Contains(request.SearchTerm));
            }

            if (!string.IsNullOrEmpty(request.MailNum))
            {
                filteredQuery = filteredQuery.Where(x => x.MailNum.Contains(request.MailNum));
            }

            if (request.MailDate.HasValue)
            {
                filteredQuery = filteredQuery.Where(x => x.MailDate >= request.MailDate.Value);
            }

            return filteredQuery;
        }
    }
}
