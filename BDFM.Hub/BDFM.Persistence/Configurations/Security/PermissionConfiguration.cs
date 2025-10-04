using BDFM.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Security
{
    public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
    {
        public void Configure(EntityTypeBuilder<Permission> builder)
        {
            // Primary Key
            builder.HasKey(p => p.Id);

            // Indices
            builder.HasIndex(p => p.Name).IsUnique();
            builder.HasIndex(p => p.Value).IsUnique();


            // Properties
            builder.Property(p => p.Name).IsRequired().HasMaxLength(255);
            builder.Property(p => p.Value).IsRequired().HasMaxLength(100);
            builder.Property(p => p.Description).HasMaxLength(1000);

            // Filter soft-deleted entities
            builder.HasQueryFilter(p => !p.IsDeleted);
        }
    }
}