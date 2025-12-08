using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetForwardedCorrespondence;

public class GetForwardedCorrespondenceQuery : IRequest<Response<PagedResult<GetForwardedCorrespondenceVm>>>, IPaginationQuery
{
    // Pagination parameters
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
    
    // Filtering parameters
    public string MailNum { get; set; } = string.Empty;
    public DateTime? ReceivedDate { get; set; }
    public DateTime? DueDate { get; set; }
    public PriorityLevelEnum? PriorityLevel { get; set; }
    public SecrecyLevelEnum? SecrecyLevel { get; set; }
    public string? FileNumber { get; set; }
    public string? SearchTerm { get; set; }
    public WorkflowStepStatus? WorkflowStepStatus { get; set; }
    public CorrespondenceStatusEnum? CorrespondenceStatus { get; set; }
    public CorrespondenceTypeEnum? CorrespondenceType { get; set; }
}

public static class GetForwardedCorrespondenceQueryExtension
{
    public static IQueryable<Correspondence> ApplyFilterForwardedCorrespondence(this IQueryable<Correspondence> query, GetForwardedCorrespondenceQuery request, bool applyIsDeletedFilter = true)
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

        // Apply CorrespondenceStatus filter
        if (request.CorrespondenceStatus.HasValue)
        {
            filteredQuery = filteredQuery.Where(x => x.Status == request.CorrespondenceStatus.Value);
        }

        // Apply ReceivedDate filter
        if (request.ReceivedDate.HasValue)
        {
            filteredQuery = filteredQuery.Where(x => x.LastUpdateAt >= request.ReceivedDate.Value);
        }

        // Apply DueDate filter
        if (request.DueDate.HasValue)
        {
            filteredQuery = filteredQuery.Where(x => x.WorkflowSteps.Any(y => y.DueDate.HasValue && y.DueDate.Value >= request.DueDate.Value));
        }

        // Apply PriorityLevel filter
        if (request.PriorityLevel.HasValue)
        {
            filteredQuery = filteredQuery.Where(x => x.PriorityLevel == request.PriorityLevel.Value);
        }

        // Apply SecrecyLevel filter
        if (request.SecrecyLevel.HasValue)
        {
            filteredQuery = filteredQuery.Where(x => x.SecrecyLevel == request.SecrecyLevel.Value);
        }

        // Apply FileNumber filter
        if (!string.IsNullOrEmpty(request.FileNumber))
        {
            filteredQuery = filteredQuery.Where(x => x.MailFile != null && x.MailFile.FileNumber == request.FileNumber);
        }

        // Apply SearchTerm filter
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            filteredQuery = filteredQuery.Where(x => x.Subject.Contains(request.SearchTerm) || (x.BodyText != null && x.BodyText.Contains(request.SearchTerm)));
        }

        // Apply WorkflowStepStatus filter
        if (request.WorkflowStepStatus.HasValue)
        {
            filteredQuery = filteredQuery.Where(x => x.WorkflowSteps.Any(y => y.Status == request.WorkflowStepStatus.Value));
        }

        return filteredQuery;
    }
}

