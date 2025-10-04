using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Supporting
{
    public class CorrespondenceTagConfiguration : IEntityTypeConfiguration<CorrespondenceTag>
    {
        public void Configure(EntityTypeBuilder<CorrespondenceTag> builder)
        {
            builder.ToTable("CorrespondenceTags");

            builder.HasKey(ct => ct.Id);

            builder.Property(ct => ct.CorrespondenceId)
                .IsRequired();

            builder.Property(ct => ct.TagId)
                .IsRequired();

            builder.Property(ct => ct.AppliedByUserId)
                .IsRequired();

            builder.Property(ct => ct.Notes)
                .HasMaxLength(500);

            builder.Property(ct => ct.IsPrivateTag)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(ct => ct.Priority)
                .IsRequired()
                .HasDefaultValue(0);

            // Relationships
            builder.HasOne(ct => ct.Correspondence)
               .WithMany(c => c.CorrespondenceTags)
               .HasForeignKey(ct => ct.CorrespondenceId)
               .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ct => ct.Tag)
                .WithMany(t => t.CorrespondenceTags)
                .HasForeignKey(ct => ct.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ct => ct.AppliedByUser)
                .WithMany(u => u.AppliedCorrespondenceTags)
                .HasForeignKey(ct => ct.AppliedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            builder.HasIndex(ct => new { ct.CorrespondenceId, ct.TagId })
                .IsUnique()
                .HasDatabaseName("IX_CorrespondenceTags_CorrespondenceId_TagId");

            builder.HasIndex(ct => ct.CorrespondenceId)
                .HasDatabaseName("IX_CorrespondenceTags_CorrespondenceId");

            builder.HasIndex(ct => ct.TagId)
                .HasDatabaseName("IX_CorrespondenceTags_TagId");

            builder.HasIndex(ct => ct.AppliedByUserId)
                .HasDatabaseName("IX_CorrespondenceTags_AppliedByUserId");

            builder.HasIndex(ct => ct.IsPrivateTag)
                .HasDatabaseName("IX_CorrespondenceTags_IsPrivateTag");

            builder.HasIndex(ct => ct.Priority)
                .HasDatabaseName("IX_CorrespondenceTags_Priority");

            // Filter soft-deleted entities to match the User entity's global query filter
            builder.HasQueryFilter(ct => !ct.IsDeleted);
        }
    }
}