using BDFM.Domain.Entities.Supporting;
using BDFM.Domain.Enums;
using BDFM.Domain.Extensions;

namespace BDFM.Domain.Common
{
    public static class DefaultSystemTags
    {
        public static List<SystemTagTemplate> GetDefaultSystemTagTemplates()
        {
            return new List<SystemTagTemplate>
            {
                // Priority Tags
                new SystemTagTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "High Priority",
                    NameAr = "أولوية عالية",
                    Description = "High priority correspondence requiring immediate attention",
                    DescriptionAr = "مراسلة ذات أولوية عالية تتطلب اهتماماً فورياً",
                    Category = TagCategoryEnum.Priority,
                    DefaultColor = TagCategoryEnum.Priority.GetDefaultColorForCategory(),
                    SortOrder = 1,
                    IsAutoCreateEnabled = true,
                    IsActive = true
                },
                new SystemTagTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Low Priority",
                    NameAr = "أولوية منخفضة",
                    Description = "Low priority correspondence",
                    DescriptionAr = "مراسلة ذات أولوية منخفضة",
                    Category = TagCategoryEnum.Priority,
                    DefaultColor = "#4CAF50",
                    SortOrder = 2,
                    IsAutoCreateEnabled = true,
                    IsActive = true
                },

                // Status Tags
                new SystemTagTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Under Review",
                    NameAr = "قيد المراجعة",
                    Description = "Correspondence currently under review",
                    DescriptionAr = "مراسلة قيد المراجعة حالياً",
                    Category = TagCategoryEnum.Review,
                    DefaultColor = TagCategoryEnum.Review.GetDefaultColorForCategory(),
                    SortOrder = 3,
                    IsAutoCreateEnabled = true,
                    IsActive = true
                },
                new SystemTagTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Pending Approval",
                    NameAr = "في انتظار الموافقة",
                    Description = "Correspondence pending approval",
                    DescriptionAr = "مراسلة في انتظار الموافقة",
                    Category = TagCategoryEnum.Approval,
                    DefaultColor = TagCategoryEnum.Approval.GetDefaultColorForCategory(),
                    SortOrder = 4,
                    IsAutoCreateEnabled = true,
                    IsActive = true
                },
                new SystemTagTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Follow Up Required",
                    NameAr = "يتطلب متابعة",
                    Description = "Correspondence requiring follow-up action",
                    DescriptionAr = "مراسلة تتطلب إجراء متابعة",
                    Category = TagCategoryEnum.Follow_Up,
                    DefaultColor = TagCategoryEnum.Follow_Up.GetDefaultColorForCategory(),
                    SortOrder = 5,
                    IsAutoCreateEnabled = true,
                    IsActive = true
                },

                // Confidentiality Tags
                new SystemTagTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Confidential",
                    NameAr = "سري",
                    Description = "Confidential correspondence",
                    DescriptionAr = "مراسلة سرية",
                    Category = TagCategoryEnum.Confidential,
                    DefaultColor = TagCategoryEnum.Confidential.GetDefaultColorForCategory(),
                    SortOrder = 6,
                    IsAutoCreateEnabled = true,
                    IsActive = true
                },
                new SystemTagTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Urgent",
                    NameAr = "عاجل",
                    Description = "Urgent correspondence requiring immediate action",
                    DescriptionAr = "مراسلة عاجلة تتطلب إجراءً فورياً",
                    Category = TagCategoryEnum.Urgent,
                    DefaultColor = TagCategoryEnum.Urgent.GetDefaultColorForCategory(),
                    SortOrder = 7,
                    IsAutoCreateEnabled = true,
                    IsActive = true
                },

                // Department Tags
                new SystemTagTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "HR Related",
                    NameAr = "متعلق بالموارد البشرية",
                    Description = "Human Resources related correspondence",
                    DescriptionAr = "مراسلة متعلقة بالموارد البشرية",
                    Category = TagCategoryEnum.Department,
                    DefaultColor = TagCategoryEnum.Department.GetDefaultColorForCategory(),
                    SortOrder = 8,
                    IsAutoCreateEnabled = true,
                    IsActive = true
                },
                new SystemTagTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Finance Related",
                    NameAr = "متعلق بالمالية",
                    Description = "Finance related correspondence",
                    DescriptionAr = "مراسلة متعلقة بالمالية",
                    Category = TagCategoryEnum.Financial,
                    DefaultColor = TagCategoryEnum.Financial.GetDefaultColorForCategory(),
                    SortOrder = 9,
                    IsAutoCreateEnabled = true,
                    IsActive = true
                },
                new SystemTagTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Legal Related",
                    NameAr = "متعلق بالشؤون القانونية",
                    Description = "Legal affairs related correspondence",
                    DescriptionAr = "مراسلة متعلقة بالشؤون القانونية",
                    Category = TagCategoryEnum.Legal,
                    DefaultColor = TagCategoryEnum.Legal.GetDefaultColorForCategory(),
                    SortOrder = 10,
                    IsAutoCreateEnabled = true,
                    IsActive = true
                },

                // Archive Tags
                new SystemTagTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Archived",
                    NameAr = "مؤرشف",
                    Description = "Archived correspondence",
                    DescriptionAr = "مراسلة مؤرشفة",
                    Category = TagCategoryEnum.Archive,
                    DefaultColor = TagCategoryEnum.Archive.GetDefaultColorForCategory(),
                    SortOrder = 11,
                    IsAutoCreateEnabled = true,
                    IsActive = true
                },

                // Reference Tags
                new SystemTagTemplate
                {
                    Id = Guid.NewGuid(),
                    Name = "Reference Document",
                    NameAr = "وثيقة مرجعية",
                    Description = "Reference document for future use",
                    DescriptionAr = "وثيقة مرجعية للاستخدام المستقبلي",
                    Category = TagCategoryEnum.Reference,
                    DefaultColor = TagCategoryEnum.Reference.GetDefaultColorForCategory(),
                    SortOrder = 12,
                    IsAutoCreateEnabled = true,
                    IsActive = true
                }
            };
        }

        public static List<Tag> CreateSystemTagsFromTemplates(List<SystemTagTemplate> templates)
        {
            return templates.Where(t => t.IsAutoCreateEnabled && t.IsActive)
                          .Select(template => new Tag
                          {
                              Id = Guid.NewGuid(),
                              Name = template.Name,
                          }).ToList()!;
        }
    }
}