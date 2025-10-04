using BDFM.Domain.Entities.Supporting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Supporting
{
    public class PermittedExternalEntityCommunicationConfiguration : IEntityTypeConfiguration<PermittedExternalEntityCommunication>
    {
        public void Configure(EntityTypeBuilder<PermittedExternalEntityCommunication> builder)
        {
            // Primary Key
            builder.HasKey(peec => peec.Id);

            // Indices
            builder.HasIndex(peec => new { peec.OrganizationalUnitId, peec.ExternalEntityId }).IsUnique();
            builder.HasIndex(peec => peec.OrganizationalUnitId);
            builder.HasIndex(peec => peec.ExternalEntityId);
            builder.HasIndex(peec => peec.CanSend);
            builder.HasIndex(peec => peec.CanReceive);

            // Properties
            builder.Property(peec => peec.RequiresSignatureLevel).HasMaxLength(100);

            // Relationships
            builder.HasOne(peec => peec.OrganizationalUnit)
                .WithMany(ou => ou.PermittedCommunications)
                .HasForeignKey(peec => peec.OrganizationalUnitId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(peec => peec.ExternalEntity)
                .WithMany(ee => ee.PermittedCommunications)
                .HasForeignKey(peec => peec.ExternalEntityId)
                .OnDelete(DeleteBehavior.Cascade);

            // Filter soft-deleted entities
            builder.HasQueryFilter(peec => !peec.IsDeleted);
        }
    }
}