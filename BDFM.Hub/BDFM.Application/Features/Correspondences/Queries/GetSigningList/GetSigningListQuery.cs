using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetSigningList
{
    public class GetSigningListQuery : IRequest<Response<PagedResult<GetSigningListVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
    }

    public static class GetSigningListQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilter(this IQueryable<Correspondence> query, GetSigningListQuery request)
        {
            return query.Where(x => x.Status == CorrespondenceStatusEnum.UnderProcessing);
        }
    }
}
