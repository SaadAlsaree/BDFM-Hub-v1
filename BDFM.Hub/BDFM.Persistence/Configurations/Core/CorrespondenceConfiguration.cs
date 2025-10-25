using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Core
{
    public class CorrespondenceConfiguration : IEntityTypeConfiguration<Correspondence>
    {
        public void Configure(EntityTypeBuilder<Correspondence> builder)
        {
            // Primary Key
            builder.HasKey(c => c.Id);

            // Indices
            builder.HasIndex(c => c.MailNum).IsUnique().HasFilter("\"MailNum\" IS NOT NULL");
            builder.HasIndex(c => c.ExternalReferenceNumber);
            builder.HasIndex(c => c.FileId);
            builder.HasIndex(c => c.SignatoryUserId);


            // Properties
            builder.Property(c => c.Subject).IsRequired();
            builder.Property(c => c.MailNum).HasMaxLength(50);
            builder.Property(c => c.MailDate).HasColumnType("date");
            builder.Property(c => c.BodyText).HasColumnType("text");
            builder.Property(c => c.OcrText).HasColumnType("text");
            builder.Property(c => c.MailNum).HasMaxLength(255);
            builder.Property(c => c.ExternalReferenceNumber).HasMaxLength(255);

            // Relationships
            builder.HasOne(c => c.MailFile)
                .WithMany(mf => mf.Correspondences)
                .HasForeignKey(c => c.FileId)
                .OnDelete(DeleteBehavior.SetNull);

            // Self-referencing relationship for replies
            builder.HasMany(c => c.RepliesToThis)
                .WithOne()
                .HasForeignKey("ParentCorrespondenceId")
                .OnDelete(DeleteBehavior.Restrict);

            // Relationship with User (Signatory)
            builder.HasOne<User>()
                .WithMany(u => u.SignedCorrespondences)
                .HasForeignKey(c => c.SignatoryUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relationship with User (Creator)
            builder.HasOne<User>()
                .WithMany(u => u.CreatedCorrespondences)
                .HasForeignKey(c => c.CreateBy)
                .OnDelete(DeleteBehavior.Restrict);

            // One-to-Many: Correspondence has multiple user interactions
            builder.HasMany(c => c.UserCorrespondenceInteractions)
                .WithOne(uci => uci.Correspondence)
                .HasForeignKey(uci => uci.CorrespondenceId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relationship with OrganizationalUnit (Creator)
            builder.HasOne(c => c.CorrespondenceOrganizationalUnit)
                .WithMany(ou => ou.Correspondences)
                .HasForeignKey(c => c.CorrespondenceOrganizationalUnitId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(c => !c.IsDeleted);
        }
    }
}