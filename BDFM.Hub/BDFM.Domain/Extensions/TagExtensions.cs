using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Extensions
{
    public static class TagExtensions
    {
        /// <summary>
        /// Gets all tags applied to a correspondence
        /// </summary>
        public static IEnumerable<Tag> GetTags(this Correspondence correspondence)
        {
            return correspondence.CorrespondenceTags.Select(ct => ct.Tag);

        }

        /// <summary>
        /// Gets all public tags applied to a correspondence
        /// </summary>
        public static IEnumerable<Tag> GetPublicTags(this Correspondence correspondence)
        {
            return correspondence.CorrespondenceTags
                .Where(ct => !ct.IsPrivateTag)
                .Select(ct => ct.Tag);
        }

        /// <summary>
        /// Gets all private tags applied to a correspondence by a specific user
        /// </summary>
        public static IEnumerable<Tag> GetPrivateTagsByUser(this Correspondence correspondence, Guid userId)
        {
            return correspondence.CorrespondenceTags
                .Where(ct => ct.IsPrivateTag && ct.AppliedByUserId == userId)
                .Select(ct => ct.Tag);
        }

        
        /// <summary>
        /// Checks if correspondence has a specific tag
        /// </summary>
        public static bool HasTag(this Correspondence correspondence, string tagName)
        {
            return correspondence.CorrespondenceTags
                .Any(ct => ct.Tag.Name.Equals(tagName, StringComparison.OrdinalIgnoreCase));

        }

        /// <summary>
        /// Gets tag names as a comma-separated string
        /// </summary>
        public static string GetTagNamesAsString(this Correspondence correspondence, bool includePrivate = false, Guid? userId = null)
        {
            var tags = includePrivate && userId.HasValue
                ? correspondence.CorrespondenceTags
                    .Where(ct => !ct.IsPrivateTag || ct.AppliedByUserId == userId.Value)
                    .Select(ct => ct.Tag.Name)
                : correspondence.CorrespondenceTags
                    .Where(ct => !ct.IsPrivateTag)
                    .Select(ct => ct.Tag.Name);

            return string.Join(", ", tags);
        }


        /// <summary>
        /// Generates a default color for a tag based on its category
        /// </summary>
        public static string GetDefaultColorForCategory(this TagCategoryEnum category)
        {
            return category switch
            {
                TagCategoryEnum.Priority => "#FF5722", // Red-orange
                TagCategoryEnum.Department => "#2196F3", // Blue
                TagCategoryEnum.Project => "#4CAF50", // Green
                TagCategoryEnum.Subject => "#9C27B0", // Purple
                TagCategoryEnum.Status => "#FF9800", // Orange
                TagCategoryEnum.Location => "#795548", // Brown
                TagCategoryEnum.Client => "#607D8B", // Blue Grey
                TagCategoryEnum.Legal => "#E91E63", // Pink
                TagCategoryEnum.Financial => "#009688", // Teal
                TagCategoryEnum.Technical => "#3F51B5", // Indigo
                TagCategoryEnum.Administrative => "#8BC34A", // Light Green
                TagCategoryEnum.Urgent => "#F44336", // Red
                TagCategoryEnum.Confidential => "#9E9E9E", // Grey
                TagCategoryEnum.Archive => "#CDDC39", // Lime
                TagCategoryEnum.Review => "#FFC107", // Amber
                TagCategoryEnum.Approval => "#00BCD4", // Cyan
                TagCategoryEnum.Follow_Up => "#FFEB3B", // Yellow
                TagCategoryEnum.Reference => "#673AB7", // Deep Purple
                TagCategoryEnum.Custom => "#757575", // Grey
                _ => "#6C757D" // Default grey
            };
        }
    }
}