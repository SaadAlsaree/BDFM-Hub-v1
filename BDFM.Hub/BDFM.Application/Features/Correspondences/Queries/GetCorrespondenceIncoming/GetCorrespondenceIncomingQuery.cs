using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceIncoming
{
    public class GetCorrespondenceIncomingQuery : IRequest<Response<PagedResult<GetCorrespondenceIncomingVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;

        // Optional filter by specific unit ID
    }

    public static class GetCorrespondenceIncomingQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilterIncoming(this IQueryable<Correspondence> query)
        {
            var filteredQuery = query.Where(x => !x.IsDeleted && x.CorrespondenceType == CorrespondenceTypeEnum.IncomingExternal);
            return filteredQuery;
        }
    }
}
