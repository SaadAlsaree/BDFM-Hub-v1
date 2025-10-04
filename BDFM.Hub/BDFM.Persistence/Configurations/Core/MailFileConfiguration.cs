using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Core
{
    public class MailFileConfiguration : IEntityTypeConfiguration<MailFile>
    {
        public void Configure(EntityTypeBuilder<MailFile> builder)
        {
            // Primary Key
            builder.HasKey(mf => mf.Id);

            // Indices
            builder.HasIndex(mf => mf.FileNumber).IsUnique();


            // Properties
            builder.Property(mf => mf.FileNumber).IsRequired().HasMaxLength(100);
            builder.Property(mf => mf.Subject).HasMaxLength(500);

            // Relationships (most are defined in inverse properties)
            builder.HasMany(mf => mf.Correspondences)
                .WithOne(c => c.MailFile)
                .HasForeignKey(c => c.FileId)
                .OnDelete(DeleteBehavior.SetNull);

            // Filter soft-deleted entities
            builder.HasQueryFilter(mf => !mf.IsDeleted);
        }
    }
}