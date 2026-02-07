using BDFM.Application.Features.AnnouncementFeature.Queries.GetAnnouncements;
using BDFM.Application.Features.Utility.BaseUtility.Query.GetAll;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.AnnouncementFeature.Queries.GetActiveAnnouncements
{
    public class GetActiveAnnouncementsHandler : IRequestHandler<GetActiveAnnouncementsQuery, Response<PagedResult<AnnouncementVm>>>
    {
        private readonly IBaseRepository<Announcement> _announcementRepository;

        public GetActiveAnnouncementsHandler(IBaseRepository<Announcement> announcementRepository)
        {
            _announcementRepository = announcementRepository;
        }

        public async Task<Response<PagedResult<AnnouncementVm>>> Handle(GetActiveAnnouncementsQuery request, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;

            var query = _announcementRepository.Query(a =>
                a.IsActive &&
                a.StartDate <= now &&
                a.EndDate >= now);

            var totalCount = await query.CountAsync(cancellationToken);

            var data = await query
                .OrderByDescending(a => a.CreateAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(a => new AnnouncementVm
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    Variant = a.Variant,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    IsActive = a.IsActive,
                    UserId = a.UserId,
                    UserFullName = a.User.FullName,
                    OrganizationalUnitId = a.OrganizationalUnitId,
                    UnitName = a.OrganizationalUnit.UnitName,
                    CreateAt = a.CreateAt
                })
                .ToListAsync(cancellationToken);

            var pagedResult = new PagedResult<AnnouncementVm>
            {
                Items = data,
                TotalCount = totalCount
            };

            return SuccessMessage.Get.ToSuccessMessage(pagedResult);
        }
    }
}
