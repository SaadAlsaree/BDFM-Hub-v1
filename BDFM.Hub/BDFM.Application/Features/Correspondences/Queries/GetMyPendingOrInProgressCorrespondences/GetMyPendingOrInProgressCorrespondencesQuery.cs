using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.GetMyPendingOrInProgressCorrespondences
{
    public class GetMyPendingOrInProgressCorrespondencesQuery : IRequest<Response<PagedResult<MyPendingOrInProgressCorrespondencesVm>>>, IPaginationQuery
    {
        public int Page { get; set; } = 1;
        public byte PageSize { get; set; } = 10;
        public DateOnly? MailDate { get; set; }
        public string? SearchTerm { get; set; }
        public string? MailNum { get; set; }
    }

    // Extension method for filtering
    public static class GetMyPendingOrInProgressCorrespondencesQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilterMyPendingOrInProgressCorrespondences(this IQueryable<Correspondence> query, GetMyPendingOrInProgressCorrespondencesQuery request)
        {
            var filteredQuery = query.Where(x => x.IsDeleted == false);

            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                filteredQuery = filteredQuery.Where(x => x.Subject.Contains(request.SearchTerm) || x.BodyText!.Contains(request.SearchTerm));
            }

            // Apply MailNumber filter
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

