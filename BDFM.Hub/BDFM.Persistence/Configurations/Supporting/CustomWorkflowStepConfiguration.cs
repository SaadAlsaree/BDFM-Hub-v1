using BDFM.Domain.Entities.Supporting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Supporting
{
    public class CustomWorkflowStepConfiguration : IEntityTypeConfiguration<CustomWorkflowStep>
    {
        public void Configure(EntityTypeBuilder<CustomWorkflowStep> builder)
        {
            // Primary Key
            builder.HasKey(cws => cws.Id);

            // Indices
            builder.HasIndex(cws => cws.WorkflowId);
            builder.HasIndex(cws => cws.StepOrder);


            // Composite index for workflow steps order
            builder.HasIndex(cws => new { cws.WorkflowId, cws.StepOrder }).IsUnique();

            // Properties
            builder.Property(cws => cws.TargetIdentifier).HasMaxLength(255);
            builder.Property(cws => cws.DefaultInstructionText).HasMaxLength(1000);

            // Relationships
            builder.HasOne(cws => cws.CustomWorkflow)
                .WithMany(cw => cw.Steps)
                .HasForeignKey(cws => cws.WorkflowId)
                .OnDelete(DeleteBehavior.Cascade);

            // Filter soft-deleted entities
            builder.HasQueryFilter(cws => !cws.IsDeleted);
        }
    }
}