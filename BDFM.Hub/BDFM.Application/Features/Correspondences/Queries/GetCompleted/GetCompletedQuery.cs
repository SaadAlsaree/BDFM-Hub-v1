using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetCompleted
{
    public class GetCompletedQuery : IRequest<Response<PagedResult<CompletedItemVm>>>, IPaginationQuery
    {
        // Pagination parameters
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
        public DateOnly? MailDate { get; set; }
        public string? SearchTerm { get; set; }
        public string? MailNum { get; set; }
    }

    // Extension method for filtering
    public static class GetCompletedQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilter(this IQueryable<Correspondence> query, GetCompletedQuery request, Guid currentUserId)
        {
            var filteredQuery = query.Where(x => !x.IsDeleted && x.Status == CorrespondenceStatusEnum.Completed && x.IsDraft == false);

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
