using BDFM.Application.Features.AnnouncementFeature.Queries.GetAnnouncements;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;

namespace BDFM.Application.Features.AnnouncementFeature.Queries.GetActiveAnnouncements
{
    public class GetActiveAnnouncementsQuery : PaginationQuery, IRequest<Response<PagedResult<AnnouncementVm>>>
    {
    }
}
