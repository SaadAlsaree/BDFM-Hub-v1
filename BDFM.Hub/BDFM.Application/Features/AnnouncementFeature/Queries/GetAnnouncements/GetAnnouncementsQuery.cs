using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.AnnouncementFeature.Queries.GetAnnouncements
{
    public class GetAnnouncementsQuery : PaginationQuery, IRequest<Response<PagedResult<AnnouncementVm>>>
    {
        public bool? IsActive { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? SearchTerm { get; set; }
    }

    public static class GetAnnouncementsQueryExtensions
    {
        public static IQueryable<Announcement> ApplyFilter(this IQueryable<Announcement> query, GetAnnouncementsQuery request)
        {
            if (request.IsActive.HasValue)
            {
                query = query.Where(a => a.IsActive == request.IsActive.Value);
            }

            if (request.FromDate.HasValue)
            {
                query = query.Where(a => a.StartDate >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                query = query.Where(a => a.EndDate <= request.ToDate.Value);
            }

            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                query = query.Where(a => a.Title.Contains(request.SearchTerm) || a.Description.Contains(request.SearchTerm));
            }

            return query;
        }
    }
}
