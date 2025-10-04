using BDFM.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Security
{
    public class UnitPermissionConfiguration : IEntityTypeConfiguration<UnitPermission>
    {
        public void Configure(EntityTypeBuilder<UnitPermission> builder)
        {
            // Primary Key
            builder.HasKey(up => up.Id);

            // Indices
            builder.HasIndex(up => new { up.UnitId, up.PermissionId }).IsUnique();
            builder.HasIndex(up => up.UnitId);
            builder.HasIndex(up => up.PermissionId);


            // Relationships
            builder.HasOne(up => up.Unit)
                .WithMany(ou => ou.UnitPermissions)
                .HasForeignKey(up => up.UnitId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(up => up.Permission)
                .WithMany(p => p.UnitPermissions)
                .HasForeignKey(up => up.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Filter soft-deleted entities - to match Permission entity filter
            builder.HasQueryFilter(up => !up.IsDeleted);
        }
    }
}