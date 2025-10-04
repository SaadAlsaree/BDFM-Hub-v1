using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetUrgentBooks
{
    public class GetUrgentBooksQuery : IRequest<Response<PagedResult<UrgentBooksVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
    }


    // Extension method for filtering
    public static class GetUrgentBooksQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilter(this IQueryable<Correspondence> query, GetUrgentBooksQuery request)
        {
            var filteredQuery = query.Where(x => x.IsDeleted == false && (x.PriorityLevel == PriorityLevelEnum.VeryUrgent || x.PriorityLevel == PriorityLevelEnum.Urgent));

            return filteredQuery;
        }
    }
}
