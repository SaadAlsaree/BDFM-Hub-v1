using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetLateBooks
{
    public class GetLateBooksQuery : IRequest<Response<PagedResult<GetLateBooksVm>>>, IPaginationQuery
    {
        // Pagination parameters
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;

    }

    // Extension method for filtering
    public static class GetLateBooksQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilter(this IQueryable<Correspondence> query, GetLateBooksQuery request)
        {
            var filteredQuery = query.Where(x =>
                !x.IsDeleted && x.WorkflowSteps.Any(y =>
                y.DueDate < DateTime.UtcNow && (y.Status == WorkflowStepStatus.Pending || y.Status == WorkflowStepStatus.InProgress)));

            return filteredQuery;
        }
    }
}
