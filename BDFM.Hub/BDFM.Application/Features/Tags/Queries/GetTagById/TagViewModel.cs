using BDFM.Domain.Enums;

namespace BDFM.Application.Features.Tags.Queries.GetTagById
{
    public class TagViewModel
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
        public Guid? CreatedByUserId { get; set; }
        public string? CreatedByUserName { get; set; }
        public Guid? OrganizationalUnitId { get; set; }
        public string? OrganizationalUnitName { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime? LastUpdateAt { get; set; }
        public string StatusName { get; set; } = string.Empty;
    }
}
