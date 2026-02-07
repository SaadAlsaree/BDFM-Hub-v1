using BDFM.Domain.Entities.Supporting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Supporting
{
    public class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
    {
        public void Configure(EntityTypeBuilder<Announcement> builder)
        {
            // Primary Key
            builder.HasKey(a => a.Id);

            // Indexes
            builder.HasIndex(a => a.UserId);
            builder.HasIndex(a => a.OrganizationalUnitId);
            builder.HasIndex(a => a.IsActive);
            builder.HasIndex(a => a.StartDate);
            builder.HasIndex(a => a.EndDate);

            // Properties
            builder.Property(a => a.Title)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(a => a.Description)
                .IsRequired()
                .HasColumnType("text");

            builder.Property(a => a.Variant)
                .HasMaxLength(50);

            // Relationships
            builder.HasOne(a => a.User)
                .WithMany(u => u.Announcements)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.OrganizationalUnit)
                .WithMany(ou => ou.Announcements)
                .HasForeignKey(a => a.OrganizationalUnitId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(a => !a.IsDeleted);
        }
    }
}
