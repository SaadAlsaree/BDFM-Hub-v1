using AutoMapper;
using BDFM.Application.Features.AnnouncementFeature.Queries.GetAnnouncements;
using BDFM.Domain.Entities.Supporting;

namespace BDFM.Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Announcement, AnnouncementVm>()
                .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.OrganizationalUnit.UnitName));
        }
    }
}
