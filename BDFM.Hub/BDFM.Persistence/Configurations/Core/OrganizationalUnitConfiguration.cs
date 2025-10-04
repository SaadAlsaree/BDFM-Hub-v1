using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Core
{
    public class OrganizationalUnitConfiguration : IEntityTypeConfiguration<OrganizationalUnit>
    {
        public void Configure(EntityTypeBuilder<OrganizationalUnit> builder)
        {
            // Primary Key
            builder.HasKey(ou => ou.Id);

            // Indices
            builder.HasIndex(ou => ou.UnitCode).IsUnique();
            builder.HasIndex(ou => ou.UnitName);
            builder.HasIndex(ou => ou.ParentUnitId);


            // Properties
            builder.Property(ou => ou.UnitName).IsRequired().HasMaxLength(255);
            builder.Property(ou => ou.UnitCode).IsRequired().HasMaxLength(50);
            builder.Property(ou => ou.UnitDescription).HasMaxLength(1000);
            builder.Property(ou => ou.Email).HasMaxLength(255);
            builder.Property(ou => ou.PhoneNumber).HasMaxLength(50);
            builder.Property(ou => ou.Address).HasMaxLength(255);
            builder.Property(ou => ou.PostalCode).HasMaxLength(20);
            builder.Property(ou => ou.UnitLogo).HasMaxLength(255);

            // Relationships
            // Self-referencing relationship for hierarchy
            builder.HasOne(ou => ou.ParentUnit)
                .WithMany(ou => ou.ChildUnits)
                .HasForeignKey(ou => ou.ParentUnitId)
                .OnDelete(DeleteBehavior.Restrict);

            // One-to-Many: OrganizationalUnit has many Users
            builder.HasMany(ou => ou.Users)
                .WithOne(u => u.OrganizationalUnit)
                .HasForeignKey(u => u.OrganizationalUnitId)
                .OnDelete(DeleteBehavior.SetNull);

            // Filter soft-deleted entities
            builder.HasQueryFilter(ou => !ou.IsDeleted);
        }
    }
}