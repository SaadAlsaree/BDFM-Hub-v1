using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Security
{
    public class UserPermissionConfiguration : IEntityTypeConfiguration<UserPermission>
    {
        public void Configure(EntityTypeBuilder<UserPermission> builder)
        {
            // Primary Key
            builder.HasKey(up => up.Id);

            // Indices
            builder.HasIndex(up => new { up.UserId, up.PermissionId }).IsUnique();
            builder.HasIndex(up => up.UserId);
            builder.HasIndex(up => up.PermissionId);

            // Relationships
            builder.HasOne(up => up.User)
                .WithMany(u => u.UserPermissions)
                .HasForeignKey(up => up.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(up => up.Permission)
                .WithMany(p => p.UserPermissions)
                .HasForeignKey(up => up.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Filter soft-deleted entities
            builder.HasQueryFilter(up => !up.IsDeleted);
        }
    }
}