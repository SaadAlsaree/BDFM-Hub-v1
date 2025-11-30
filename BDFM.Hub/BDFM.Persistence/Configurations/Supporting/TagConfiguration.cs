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
                .HasMaxLength(500);

            // Navigation Properties
            // Note: Tag can have a direct relationship with Correspondence (for legacy/specific tags)
            // OR through CorrespondenceTag (many-to-many relationship)
            builder.HasOne(t => t.Correspondence)
                .WithMany()
                .HasForeignKey(t => t.CorrespondenceId)
                .OnDelete(DeleteBehavior.SetNull);

            // Many-to-many relationship through CorrespondenceTag is configured in CorrespondenceTagConfiguration
            builder.HasMany(t => t.CorrespondenceTags)
                .WithOne(ct => ct.Tag)
                .HasForeignKey(ct => ct.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(t => t.User)
                .WithMany(u => u.UserTags)
                .HasForeignKey(t => t.ForUserId);

            builder.HasOne(t => t.OrganizationalUnit)
                .WithMany(ou => ou.OrganizationalUnitTags)
                .HasForeignKey(t => t.ForOrganizationalUnitId);


            // Indexes
            builder.HasIndex(t => t.Name)
                .IsUnique()
                .HasDatabaseName("IX_Tags_Name");

            builder.HasIndex(t => t.ForUserId)
                .HasDatabaseName("IX_Tags_ForUserId");

            builder.HasIndex(t => t.ForOrganizationalUnitId)
                .HasDatabaseName("IX_Tags_ForOrganizationalUnitId");

            builder.HasIndex(t => t.CorrespondenceId)
                .HasDatabaseName("IX_Tags_CorrespondenceId");
        }
    }
}