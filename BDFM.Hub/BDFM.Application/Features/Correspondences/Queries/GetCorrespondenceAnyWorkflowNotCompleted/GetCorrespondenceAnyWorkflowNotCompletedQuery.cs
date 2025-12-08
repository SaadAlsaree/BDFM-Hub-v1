using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceAnyWorkflowNotCompleted
{
    public class GetCorrespondenceAnyWorkflowNotCompletedQuery : IRequest<Response<PagedResult<CorrespondenceWorkflowNotCompletedVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
        public DateOnly? MailDate { get; set; }
        public string? SearchTerm { get; set; }

        public string? MailNum { get; set; }
    }

    // Extension method for filtering
    public static class GetCorrespondenceAnyWorkflowNotCompletedQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilterCorrespondenceAnyWorkflowNotCompleted(this IQueryable<Correspondence> query, GetCorrespondenceAnyWorkflowNotCompletedQuery request)
        {
            var filteredQuery = query.Where(x => x.IsDeleted == false && 
                x.WorkflowSteps.Any(ws => ws.Status == WorkflowStepStatus.Pending || ws.Status == WorkflowStepStatus.InProgress));

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
