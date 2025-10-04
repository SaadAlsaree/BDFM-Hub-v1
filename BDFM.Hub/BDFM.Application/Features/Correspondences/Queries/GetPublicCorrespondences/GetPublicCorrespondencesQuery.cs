using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetPublicCorrespondences
{
    public class GetPublicCorrespondencesQuery : IRequest<Response<PagedResult<GetPublicCorrespondencesVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;

        // Date filtering options
        public DateTime? CreatedDate { get; set; }
        public DateOnly? MailDate { get; set; }

        // Optional filter by specific unit ID
    }

    public static class GetPublicCorrespondencesQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilterPublic(this IQueryable<Correspondence> query)
        {
            var filteredQuery = query.Where(x => !x.IsDeleted && x.CorrespondenceType == CorrespondenceTypeEnum.Public);
            return filteredQuery;
        }
    }
}
