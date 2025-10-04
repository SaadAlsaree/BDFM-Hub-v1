using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Tags.Queries.GetAllTags
{
    public class TagListViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public TagCategoryEnum Category { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public bool IsSystemTag { get; set; }
        public bool IsPublic { get; set; }
        public int UsageCount { get; set; }
        public string? CreatedByUserName { get; set; }
        public string? OrganizationalUnitName { get; set; }
        public DateTime CreateAt { get; set; }
        public string StatusName { get; set; } = string.Empty;
    }
}
