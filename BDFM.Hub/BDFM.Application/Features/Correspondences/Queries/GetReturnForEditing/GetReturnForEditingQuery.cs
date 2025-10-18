using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetReturnForEditing
{
    public class GetReturnForEditingQuery : IRequest<Response<PagedResult<ReturnForEditingItemVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
    }

    public static class GetReturnForEditingQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilter(this IQueryable<Correspondence> query, GetReturnForEditingQuery request, Guid currentUserId)
        {
            var filteredQuery = query.Where(x => !x.IsDeleted && x.IsDraft == false && x.Status == CorrespondenceStatusEnum.ReturnedForModification);

            return filteredQuery;
        }
    }
}

