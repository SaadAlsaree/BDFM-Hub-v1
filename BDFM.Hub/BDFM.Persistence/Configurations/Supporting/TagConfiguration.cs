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

            builder.HasOne(t => t.FromUser)
                .WithMany(u => u.UserTags)
                .HasForeignKey(t => t.FromUserId);

            builder.HasOne(t => t.FromUnit)
                .WithMany(ou => ou.OrganizationalUnitTags)
                .HasForeignKey(t => t.FromUnitId);



            // Indexes
            builder.HasIndex(t => t.Name)
                .IsUnique()
                .HasDatabaseName("IX_Tags_Name");

            builder.HasIndex(t => t.FromUserId)
                .HasDatabaseName("IX_Tags_FromUserId");

            builder.HasIndex(t => t.FromUnitId)
                .HasDatabaseName("IX_Tags_FromUnitId");

            builder.HasIndex(t => t.CorrespondenceId)
                .HasDatabaseName("IX_Tags_CorrespondenceId");
                
            builder.HasIndex(t => t.ToPrimaryRecipientId)
                .HasDatabaseName("IX_Tags_ToPrimaryRecipientId");
        }
    }
}