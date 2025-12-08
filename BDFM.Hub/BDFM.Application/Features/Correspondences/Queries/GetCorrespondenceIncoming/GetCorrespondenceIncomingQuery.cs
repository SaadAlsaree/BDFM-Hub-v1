using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetCorrespondenceIncoming
{
    public class GetCorrespondenceIncomingQuery : IRequest<Response<PagedResult<GetCorrespondenceIncomingVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
        public DateOnly? MailDate { get; set; }
        public string? SearchTerm { get; set; }
        public string? MailNum { get; set; }
        // Optional filter by specific unit ID
    }

    public static class GetCorrespondenceIncomingQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilterIncoming(this IQueryable<Correspondence> query, GetCorrespondenceIncomingQuery request)
        {
            var filteredQuery = query.Where(x => !x.IsDeleted && x.CorrespondenceType == CorrespondenceTypeEnum.IncomingExternal);

            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                filteredQuery = filteredQuery.Where(x => x.Subject.Contains(request.SearchTerm) || x.BodyText!.Contains(request.SearchTerm));
            }

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
