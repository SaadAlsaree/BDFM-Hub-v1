using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Workflow
{
    public class DraftVersionConfiguration : IEntityTypeConfiguration<DraftVersion>
    {
        public void Configure(EntityTypeBuilder<DraftVersion> builder)
        {
            // Primary Key
            builder.HasKey(dv => dv.Id);

            // Indices
            builder.HasIndex(dv => new { dv.CorrespondenceId, dv.VersionNumber }).IsUnique();
            builder.HasIndex(dv => dv.CorrespondenceId);
            builder.HasIndex(dv => dv.ChangedByUserId);


            // Properties
            builder.Property(dv => dv.BodyText).HasColumnType("text");
            builder.Property(dv => dv.ChangeReason).HasMaxLength(500);

            // Relationships
            builder.HasOne(dv => dv.Correspondence)
                .WithMany(c => c.DraftVersions)
                .HasForeignKey(dv => dv.CorrespondenceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(dv => dv.ChangedByUser)
                .WithMany(u => u.DraftVersionsChangedBy)
                .HasForeignKey(dv => dv.ChangedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(dv => !dv.IsDeleted);
        }
    }
}