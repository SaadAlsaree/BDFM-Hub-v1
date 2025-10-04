using BDFM.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Security
{
    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            // Primary Key
            builder.HasKey(r => r.Id);

            // Indices
            builder.HasIndex(r => r.Name).IsUnique();
            builder.HasIndex(r => r.Value).IsUnique();


            // Properties
            builder.Property(r => r.Name).IsRequired().HasMaxLength(255);
            builder.Property(r => r.Value).IsRequired().HasMaxLength(100);
            builder.Property(r => r.Description).HasMaxLength(1000);

            // Filter soft-deleted entities
            builder.HasQueryFilter(r => !r.IsDeleted);
        }
    }
}