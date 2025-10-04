using BDFM.Domain.Enums;

namespace BDFM.Application.Features.CorrespondenceTags.Queries.GetCorrespondenceTags
{
    public class CorrespondenceTagViewModel
    {
        public Guid Id { get; set; }
        public Guid TagId { get; set; }
        public string TagName { get; set; } = string.Empty;
        public string? TagDescription { get; set; }
        public string? TagColor { get; set; }
        public TagCategoryEnum TagCategory { get; set; }
        public string TagCategoryName { get; set; } = string.Empty;
        public bool IsSystemTag { get; set; }
        public bool IsPrivateTag { get; set; }
        public string? Notes { get; set; }
        public int Priority { get; set; }
        public string AppliedByUserName { get; set; } = string.Empty;
        public DateTime AppliedAt { get; set; }
    }
}
