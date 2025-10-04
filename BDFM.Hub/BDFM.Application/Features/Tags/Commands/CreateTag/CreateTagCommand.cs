using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Tags.Commands.CreateTag
{
    public class CreateTagCommand : IRequest<Response<bool>>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public TagCategoryEnum Category { get; set; } = TagCategoryEnum.General;
        public bool IsSystemTag { get; set; } = false;
        public bool IsPublic { get; set; } = true;
        public Guid? OrganizationalUnitId { get; set; }
    }
}
