using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Correspondences.Queries.SearchCorrespondences
{
    public class SearchCorrespondencesQuery : IRequest<Response<List<SearchCorrespondencesVm>>>
    {

        public string? SearchTerm { get; set; } // e.g., "500-2025"

    }

    public static class SearchCorrespondencesQueryExtensions
    {
        public static IQueryable<Correspondence> ApplyFilter(this IQueryable<Correspondence> query, SearchCorrespondencesQuery request)
        {
            var filteredQuery = query.Where(x => !x.IsDeleted);

            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                filteredQuery = filteredQuery.Where(x => x.MailNum.Contains(request.SearchTerm) || x.Subject.Contains(request.SearchTerm));
            }

            return filteredQuery;
        }
    }
}
