using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Workflow
{
    public class RecipientActionLogConfiguration : IEntityTypeConfiguration<RecipientActionLog>
    {
        public void Configure(EntityTypeBuilder<RecipientActionLog> builder)
        {
            // Primary Key
            builder.HasKey(ral => ral.Id);

            // Indices
            builder.HasIndex(ral => ral.WorkflowStepId);
            builder.HasIndex(ral => ral.ActionTakenByUnitId);
            builder.HasIndex(ral => ral.ActionTakenByUserId);

            // Properties
            builder.Property(ral => ral.ActionDescription).IsRequired().HasMaxLength(500);
            builder.Property(ral => ral.Notes).HasMaxLength(1000);

            // Relationships
            builder.HasOne(ral => ral.WorkflowStep)
                .WithMany(ws => ws.RecipientActions)
                .HasForeignKey(ral => ral.WorkflowStepId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ral => ral.ActionTakenByUnit)
                .WithMany()  // No inverse navigation property defined
                .HasForeignKey(ral => ral.ActionTakenByUnitId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ral => ral.ActionTakenByUser)
                .WithMany()  // No inverse navigation property defined
                .HasForeignKey(ral => ral.ActionTakenByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(ral => !ral.IsDeleted);
        }
    }
}