using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Core
{
    public class ExternalEntityConfiguration : IEntityTypeConfiguration<ExternalEntity>
    {
        public void Configure(EntityTypeBuilder<ExternalEntity> builder)
        {
            // Primary Key
            builder.HasKey(ee => ee.Id);

            // Indices
            builder.HasIndex(ee => ee.EntityName);
            builder.HasIndex(ee => ee.EntityCode).IsUnique();

            // Properties
            builder.Property(ee => ee.EntityName).IsRequired().HasMaxLength(255);
            builder.Property(ee => ee.EntityCode).IsRequired().HasMaxLength(50);
            builder.Property(ee => ee.ContactInfo).HasMaxLength(1000);

            // Explicitly configure relationship with PermittedExternalEntityCommunication
            builder.HasMany(ee => ee.PermittedCommunications)
                .WithOne(peec => peec.ExternalEntity)
                .HasForeignKey(peec => peec.ExternalEntityId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(ee => ee.Correspondences)
                .WithOne(c => c.ExternalEntity)
                .HasForeignKey(c => c.ExternalEntityId)
                .OnDelete(DeleteBehavior.Cascade);

            // Filter soft-deleted entities
            builder.HasQueryFilter(ee => !ee.IsDeleted);
        }
    }
}