using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Supporting
{
    public class CorrespondenceTemplateConfiguration : IEntityTypeConfiguration<CorrespondenceTemplate>
    {
        public void Configure(EntityTypeBuilder<CorrespondenceTemplate> builder)
        {
            // Primary Key
            builder.HasKey(ct => ct.Id);

            // Indices
            builder.HasIndex(ct => ct.TemplateName);
            builder.HasIndex(ct => ct.OrganizationalUnitId);


            // Properties
            builder.Property(ct => ct.TemplateName).IsRequired().HasMaxLength(255);
            builder.Property(ct => ct.Subject).IsRequired().HasMaxLength(250);
            builder.Property(ct => ct.BodyText).HasMaxLength(int.MaxValue);

            // Relationships
            builder.HasOne(ct => ct.OrganizationalUnit)
                .WithMany(ou => ou.CorrespondenceTemplates)
                .HasForeignKey(ct => ct.OrganizationalUnitId)
                .OnDelete(DeleteBehavior.SetNull);

            // Filter soft-deleted entities
            builder.HasQueryFilter(ct => !ct.IsDeleted);
        }
    }
}