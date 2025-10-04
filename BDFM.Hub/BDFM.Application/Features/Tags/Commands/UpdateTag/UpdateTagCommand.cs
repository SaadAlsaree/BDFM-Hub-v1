using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Tags.Commands.UpdateTag
{
    public class UpdateTagCommand : IRequest<Response<bool>>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public TagCategoryEnum Category { get; set; } = TagCategoryEnum.General;
        public bool IsPublic { get; set; } = true;
        public Guid? OrganizationalUnitId { get; set; }
    }
}
