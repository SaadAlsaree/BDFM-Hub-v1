using BDFM.Domain.Entities.Automation;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Automation
{
    public class AdvancedAlertTriggerLogConfiguration : IEntityTypeConfiguration<AdvancedAlertTriggerLog>
    {
        public void Configure(EntityTypeBuilder<AdvancedAlertTriggerLog> builder)
        {
            // Primary Key
            builder.HasKey(aatl => aatl.Id);

            // Indices
            builder.HasIndex(aatl => aatl.AdvancedAlertRuleId);
            builder.HasIndex(aatl => aatl.TriggeredAt);
            builder.HasIndex(aatl => aatl.RelatedEntityId);

            // Properties
            builder.Property(aatl => aatl.Details).HasMaxLength(1000);

            // Relationships
            builder.HasOne(aatl => aatl.AdvancedAlertRule)
                .WithMany(aar => aar.TriggerLogs)
                .HasForeignKey(aatl => aatl.AdvancedAlertRuleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Apply the same query filter as AdvancedAlertRule for consistency
            builder.HasQueryFilter(aatl => !aatl.IsDeleted);
        }
    }
}