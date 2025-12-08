using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceNotCompleted
{
    public class GetCorrespondenceNotCompletedQuery : IRequest<Response<PagedResult<CorrespondenceNotCompletedVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
        public DateOnly? MailDate { get; set; }
        public string? SearchTerm { get; set; }
        public string? MailNum { get; set; }
    }

    // Extension method for filtering
    public static class GetCorrespondenceNotCompletedQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilterCorrespondenceNotCompleted(this IQueryable<Correspondence> query, GetCorrespondenceNotCompletedQuery request)
        {
            var filteredQuery = query.Where(x => x.IsDeleted == false && 
                (x.Status == CorrespondenceStatusEnum.PendingReferral || x.Status == CorrespondenceStatusEnum.UnderProcessing));

            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                filteredQuery = filteredQuery.Where(x => x.Subject.Contains(request.SearchTerm) || x.BodyText!.Contains(request.SearchTerm));
            }

            // Apply MailNumber filter
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
