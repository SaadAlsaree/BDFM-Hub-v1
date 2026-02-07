using BDFM.Application.Features.AnnouncementFeature.Queries.GetAnnouncements;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Features.AnnouncementFeature.Queries.GetAnnouncementById
{
    public class GetAnnouncementByIdHandler : IRequestHandler<GetAnnouncementByIdQuery, Response<AnnouncementVm>>
    {
        private readonly IBaseRepository<Announcement> _announcementRepository;

        public GetAnnouncementByIdHandler(IBaseRepository<Announcement> announcementRepository)
        {
            _announcementRepository = announcementRepository;
        }

        public async Task<Response<AnnouncementVm>> Handle(GetAnnouncementByIdQuery request, CancellationToken cancellationToken)
        {
            var result = await _announcementRepository.Query(a => a.Id == request.Id)
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
                .FirstOrDefaultAsync(cancellationToken);

            if (result == null)
            {
                return ErrorsMessage.NotFoundData.ToErrorMessage<AnnouncementVm>(null!);
            }

            return SuccessMessage.Get.ToSuccessMessage(result);
        }
    }
}
