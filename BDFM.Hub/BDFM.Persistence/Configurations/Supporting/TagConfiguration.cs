using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Supporting
{
    public class TagConfiguration : IEntityTypeConfiguration<Tag>
    {
        public void Configure(EntityTypeBuilder<Tag> builder)
        {
            builder.ToTable("Tags");

            builder.HasKey(t => t.Id);

            builder.Property(t => t.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(t => t.Description)
                .HasMaxLength(500);

            builder.Property(t => t.Color)
                .HasMaxLength(7);

            builder.Property(t => t.Category)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(t => t.IsSystemTag)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(t => t.IsPublic)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(t => t.UsageCount)
                .IsRequired()
                .HasDefaultValue(0);

            // Relationships
            builder.HasOne(t => t.CreatedByUser)
                .WithMany(u => u.CreatedTags)
                .HasForeignKey(t => t.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(t => t.OrganizationalUnit)
                .WithMany(ou => ou.OrganizationalUnitTags)
                .HasForeignKey(t => t.OrganizationalUnitId)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes
            builder.HasIndex(t => t.Name)
                .IsUnique()
                .HasDatabaseName("IX_Tags_Name");

            builder.HasIndex(t => t.Category)
                .HasDatabaseName("IX_Tags_Category");

            builder.HasIndex(t => t.UsageCount)
                .HasDatabaseName("IX_Tags_UsageCount");

            builder.HasIndex(t => t.IsPublic)
                .HasDatabaseName("IX_Tags_IsPublic");

            builder.HasIndex(t => t.IsSystemTag)
                .HasDatabaseName("IX_Tags_IsSystemTag");
        }
    }
}