using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Security
{
    public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
    {
        public void Configure(EntityTypeBuilder<UserRole> builder)
        {
            // Primary Key
            builder.HasKey(ur => ur.Id);

            // Indices
            builder.HasIndex(ur => new { ur.UserId, ur.RoleId }).IsUnique();
            builder.HasIndex(ur => ur.UserId);
            builder.HasIndex(ur => ur.RoleId);


            // Relationships
            builder.HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Filter soft-deleted entities
            builder.HasQueryFilter(ur => !ur.IsDeleted);
        }
    }
}