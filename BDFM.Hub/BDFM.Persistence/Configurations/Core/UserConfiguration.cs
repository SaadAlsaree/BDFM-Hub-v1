using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Core
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Primary Key
            builder.HasKey(u => u.Id);

            // Indices
            builder.HasIndex(u => u.Username).IsUnique();
            builder.HasIndex(u => u.UserLogin).IsUnique();
            builder.HasIndex(u => u.Email);
            builder.HasIndex(u => u.OrganizationalUnitId);
            builder.HasIndex(u => u.RfidTagId).IsUnique().HasFilter("\"RfidTagId\" IS NOT NULL");


            // Properties
            builder.Property(u => u.Username).IsRequired().HasMaxLength(255);
            builder.Property(u => u.UserLogin).IsRequired().HasMaxLength(100);
            builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(255);
            builder.Property(u => u.FullName).IsRequired().HasMaxLength(255);
            builder.Property(u => u.Email).HasMaxLength(255);
            builder.Property(u => u.PositionTitle).HasMaxLength(255);
            builder.Property(u => u.RfidTagId).HasMaxLength(100);
            builder.Property(u => u.TwoFactorSecret).HasMaxLength(255);
            builder.Property(u => u.IsDefaultPassword).HasDefaultValue(true);
            // Relationships
            builder.HasOne(u => u.OrganizationalUnit)
                .WithMany(ou => ou.Users)
                .HasForeignKey(u => u.OrganizationalUnitId)
                .OnDelete(DeleteBehavior.SetNull);

            // One-to-Many: User creates multiple correspondences
            builder.HasMany(u => u.CreatedCorrespondences)
                .WithOne()
                .HasForeignKey(c => c.CreateBy)
                .OnDelete(DeleteBehavior.Restrict);

            // One-to-Many: User signs multiple correspondences
            builder.HasMany(u => u.SignedCorrespondences)
                .WithOne()
                .HasForeignKey(c => c.SignatoryUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // One-to-Many: User has multiple correspondence interactions
            builder.HasMany(u => u.UserCorrespondenceInteractions)
                .WithOne(uci => uci.User)
                .HasForeignKey(uci => uci.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Filter soft-deleted entities
            builder.HasQueryFilter(u => !u.IsDeleted);


        }
    }
}