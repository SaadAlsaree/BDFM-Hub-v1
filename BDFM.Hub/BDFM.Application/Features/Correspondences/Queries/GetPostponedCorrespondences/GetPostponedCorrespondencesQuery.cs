using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetPostponedCorrespondences
{
    public class GetPostponedCorrespondencesQuery : IRequest<Response<PagedResult<GetPostponedCorrespondencesVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
        public DateOnly? MailDate { get; set; }
        public string? SearchTerm { get; set; }
        public string? MailNum { get; set; }
    }


    public static class GetPostponedCorrespondencesQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilterPostponed(this IQueryable<Correspondence> query, Guid currentUserId, GetPostponedCorrespondencesQuery request   )
        {
            var filteredQuery = query.Where(x => !x.IsDeleted
                && x.UserCorrespondenceInteractions.Any(ui => ui.UserId == currentUserId
                    && ui.PostponedUntil.HasValue
                    && ui.PostponedUntil.Value <= DateTime.UtcNow));

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
