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
            // The relationship with Correspondence is configured in CorrespondenceConfiguration.cs
            // to avoid conflicts and ensure proper navigation property mapping

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
            // Note: Unique index on Name is configured in BDFMDbContext.cs to avoid duplication
            // The unique index should allow multiple tags with the same name for different correspondences
            // If a unique constraint is needed, it should be on a composite key (Name, CorrespondenceId, etc.)

            builder.HasIndex(t => t.FromUserId)
                .HasDatabaseName("IX_Tags_FromUserId");

            builder.HasIndex(t => t.FromUnitId)
                .HasDatabaseName("IX_Tags_FromUnitId");
            
            builder.HasIndex(t => t.CorrespondenceId)
                .HasDatabaseName("IX_Tags_CorrespondenceId");
        }
    }
}