using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Core
{
    public class CorrespondenceLinkConfiguration : IEntityTypeConfiguration<CorrespondenceLink>
    {
        public void Configure(EntityTypeBuilder<CorrespondenceLink> builder)
        {
            // Primary Key
            builder.HasKey(cl => cl.Id);

            // Indices
            builder.HasIndex(cl => new { cl.SourceCorrespondenceId, cl.LinkedCorrespondenceId, cl.LinkType }).IsUnique();
            builder.HasIndex(cl => cl.SourceCorrespondenceId);
            builder.HasIndex(cl => cl.LinkedCorrespondenceId);

            // Properties
            builder.Property(cl => cl.Notes).HasMaxLength(1000);

            // Relationships
            builder.HasOne(cl => cl.SourceCorrespondence)
                .WithMany(c => c.ReferencesTo)
                .HasForeignKey(cl => cl.SourceCorrespondenceId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(cl => cl.LinkedCorrespondence)
                .WithMany(c => c.ReferencedBy)
                .HasForeignKey(cl => cl.LinkedCorrespondenceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(cl => !cl.IsDeleted);
        }
    }
}