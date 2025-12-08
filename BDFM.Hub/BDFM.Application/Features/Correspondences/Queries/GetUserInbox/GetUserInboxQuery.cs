using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.Correspondences.Queries.GetUserInbox
{
    public class GetUserInboxQuery : IRequest<Response<PagedResult<InboxItemVm>>>, IPaginationQuery
    {
        // Pagination parameters
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
        public string MailNum { get; set; } = string.Empty;
        public DateTime? ReceivedDate { get; set; }
        public DateTime? DueDate { get; set; }
        public PriorityLevelEnum? PriorityLevel { get; set; }
        public SecrecyLevelEnum? SecrecyLevel { get; set; }
        public string? FileNumber { get; set; }
        public string? SearchTerm { get; set; }
        public CorrespondenceStatusEnum? CorrespondenceStatus { get; set; }
        public CorrespondenceTypeEnum? CorrespondenceType { get; set; }

    }

    // Extension method for filtering
    public static class GetUserInboxQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilterUserInbox(this IQueryable<Correspondence> query, GetUserInboxQuery request, Guid currentUserId, bool applyIsDeletedFilter = true)
        {
            var filteredQuery = query;

            // Apply IsDeleted filter only if requested (to avoid duplicate filtering)
            if (applyIsDeletedFilter)
            {
                filteredQuery = filteredQuery.Where(x => !x.IsDeleted);
            }

            // Apply MailNumber filter
            if (!string.IsNullOrEmpty(request.MailNum))
            {
                filteredQuery = filteredQuery.Where(x => x.MailNum.Contains(request.MailNum));
            }

            // Apply CorrespondenceType filter
            if (request.CorrespondenceType.HasValue)
            {
                filteredQuery = filteredQuery.Where(x => x.CorrespondenceType == request.CorrespondenceType.Value);
            }

            // Apply IsRead filter only if explicitly specified
            if (request.ReceivedDate.HasValue)
            {
                filteredQuery = filteredQuery.Where(x => x.LastUpdateAt >= request.ReceivedDate.Value);
            }

            if (request.DueDate.HasValue)
            {
                filteredQuery = filteredQuery.Where(x => x.WorkflowSteps.Any(y => y.DueDate.HasValue && y.DueDate.Value >= request.DueDate.Value));
            }

            if (request.PriorityLevel.HasValue)
            {
                filteredQuery = filteredQuery.Where(x => x.PriorityLevel == request.PriorityLevel.Value);
            }

            if (request.SecrecyLevel.HasValue)
            {
                filteredQuery = filteredQuery.Where(x => x.SecrecyLevel == request.SecrecyLevel.Value);
            }

            if (!string.IsNullOrEmpty(request.FileNumber))
            {
                filteredQuery = filteredQuery.Where(x => x.MailFile!.FileNumber == request.FileNumber);
            }

            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                filteredQuery = filteredQuery.Where(x => x.Subject.Contains(request.SearchTerm) || x.BodyText!.Contains(request.SearchTerm));
            }
            return filteredQuery;
        }
    }
}
