using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetOutgoingInternal;

public class GetOutgoingInternalQuery : IRequest<Response<PagedResult<OutgoingInternalVm>>>, IPaginationQuery
{
    public int Page { get; set; } = 1;
    public byte PageSize { get; set; } = 10;
}

public static class GetOutgoingInternalQueryExtensions
{
    public static IQueryable<Correspondence> ApplyFilter(this IQueryable<Correspondence> query)
    {
        var filteredQuery = query.Where(x => !x.IsDeleted && x.CorrespondenceType == CorrespondenceTypeEnum.OutgoingInternal);

        return filteredQuery;
    }
}
