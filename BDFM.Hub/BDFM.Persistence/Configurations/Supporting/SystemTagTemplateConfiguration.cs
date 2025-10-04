using BDFM.Domain.Entities.Supporting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Supporting
{
    public class SystemTagTemplateConfiguration : IEntityTypeConfiguration<SystemTagTemplate>
    {
        public void Configure(EntityTypeBuilder<SystemTagTemplate> builder)
        {
            builder.ToTable("SystemTagTemplates");

            builder.HasKey(stt => stt.Id);

            builder.Property(stt => stt.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(stt => stt.Description)
                .HasMaxLength(500);

            builder.Property(stt => stt.DefaultColor)
                .HasMaxLength(7);

            builder.Property(stt => stt.Category)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(stt => stt.IsAutoCreateEnabled)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(stt => stt.SortOrder)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(stt => stt.NameAr)
                .HasMaxLength(100);

            builder.Property(stt => stt.DescriptionAr)
                .HasMaxLength(500);

            builder.Property(stt => stt.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            // Indexes
            builder.HasIndex(stt => stt.Name)
                .IsUnique()
                .HasDatabaseName("IX_SystemTagTemplates_Name");

            builder.HasIndex(stt => stt.Category)
                .HasDatabaseName("IX_SystemTagTemplates_Category");

            builder.HasIndex(stt => stt.SortOrder)
                .HasDatabaseName("IX_SystemTagTemplates_SortOrder");

            builder.HasIndex(stt => stt.IsActive)
                .HasDatabaseName("IX_SystemTagTemplates_IsActive");
        }
    }
}