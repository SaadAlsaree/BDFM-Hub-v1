using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceOutgoing
{
    public class GetCorrespondenceOutgoingQuery : IRequest<Response<PagedResult<GetCorrespondenceOutgoingVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
    }


    public static class GetCorrespondenceOutgoingQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilterOutgoing(this IQueryable<Correspondence> query)
        {
            var filteredQuery = query.Where(x => !x.IsDeleted && x.CorrespondenceType == CorrespondenceTypeEnum.OutgoingExternal);

            return filteredQuery;
        }
    }

}
