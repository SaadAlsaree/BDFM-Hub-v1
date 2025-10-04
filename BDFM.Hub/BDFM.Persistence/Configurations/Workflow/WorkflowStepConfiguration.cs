using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Workflow
{
    public class WorkflowStepConfiguration : IEntityTypeConfiguration<WorkflowStep>
    {
        public void Configure(EntityTypeBuilder<WorkflowStep> builder)
        {
            // Primary Key
            builder.HasKey(ws => ws.Id);

            // Indices
            builder.HasIndex(ws => ws.CorrespondenceId);
            builder.HasIndex(ws => ws.FromUserId);
            builder.HasIndex(ws => ws.FromUnitId);
            builder.HasIndex(ws => ws.ToPrimaryRecipientId);


            // Composite indices for efficient queries
            builder.HasIndex(ws => new { ws.CorrespondenceId, ws.Status });
            builder.HasIndex(ws => new { ws.ToPrimaryRecipientId, ws.ToPrimaryRecipientType, ws.Status });

            // Properties
            builder.Property(ws => ws.InstructionText).HasColumnType("text");

            // Relationships
            builder.HasOne(ws => ws.Correspondence)
                .WithMany(c => c.WorkflowSteps)
                .HasForeignKey(ws => ws.CorrespondenceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ws => ws.FromUser)
                .WithMany(u => u.InitiatedWorkflowSteps)
                .HasForeignKey(ws => ws.FromUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ws => ws.FromUnit)
                .WithMany(ou => ou.WorkflowStepsFromUnit)
                .HasForeignKey(ws => ws.FromUnitId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(ws => !ws.IsDeleted);
        }
    }
}