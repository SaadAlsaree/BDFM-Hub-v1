using BDFM.Domain.Entities.Automation;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Automation
{
    public class AdvancedAlertRuleConfiguration : IEntityTypeConfiguration<AdvancedAlertRule>
    {
        public void Configure(EntityTypeBuilder<AdvancedAlertRule> builder)
        {
            // Primary Key
            builder.HasKey(aar => aar.Id);

            // Indices
            builder.HasIndex(aar => aar.AlertName);
            builder.HasIndex(aar => aar.IsActive);
            builder.HasIndex(aar => aar.CreatedByUserId);
            builder.HasIndex(aar => aar.TargetUserId);
            builder.HasIndex(aar => aar.TargetRoleId);

            // Properties
            builder.Property(aar => aar.AlertName).IsRequired().HasMaxLength(255);
            builder.Property(aar => aar.Description).HasMaxLength(1000);
            builder.Property(aar => aar.ConditionLogic).IsRequired().HasMaxLength(255);
            builder.Property(aar => aar.ConditionParametersJson).HasMaxLength(1000);
            builder.Property(aar => aar.NotificationMessageTemplate).IsRequired().HasMaxLength(1000);
            builder.Property(aar => aar.NotificationChannel).IsRequired().HasMaxLength(50);

            // Relationships
            builder.HasOne(aar => aar.CreatedByUser)
                .WithMany()  // No inverse navigation property defined
                .HasForeignKey(aar => aar.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(aar => aar.TargetUser)
                .WithMany()  // No inverse navigation property defined
                .HasForeignKey(aar => aar.TargetUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(aar => aar.TargetRole)
                .WithMany()  // No inverse navigation property defined
                .HasForeignKey(aar => aar.TargetRoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Specifically define the relationship with TriggerLogs
            builder.HasMany(aar => aar.TriggerLogs)
                .WithOne(aatl => aatl.AdvancedAlertRule)
                .HasForeignKey(aatl => aatl.AdvancedAlertRuleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Filter soft-deleted entities - to match User entity filter
            builder.HasQueryFilter(aar => !aar.IsDeleted);
        }
    }
}