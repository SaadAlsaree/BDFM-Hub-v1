using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Workflow
{
    public class RelatedPriorityConfiguration : IEntityTypeConfiguration<RelatedPriority>
    {
        public void Configure(EntityTypeBuilder<RelatedPriority> builder)
        {
            // Primary Key
            builder.HasKey(rp => rp.Id);

            // Indices
            builder.HasIndex(rp => new { rp.PrimaryCorrespondenceId, rp.PriorityCorrespondenceId }).IsUnique();
            builder.HasIndex(rp => rp.PrimaryCorrespondenceId);
            builder.HasIndex(rp => rp.PriorityCorrespondenceId);


            // Explicitly configure both sides of the relationship
            builder.HasOne(rp => rp.PrimaryCorrespondence)
                .WithMany(c => c.PrimaryRelatedPriorities)
                .HasForeignKey(rp => rp.PrimaryCorrespondenceId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(rp => rp.PriorityCorrespondence)
                .WithMany(c => c.PriorityRelatedCorrespondences)
                .HasForeignKey(rp => rp.PriorityCorrespondenceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(rp => !rp.IsDeleted);
        }
    }
}