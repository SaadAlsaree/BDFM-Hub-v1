using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Workflow
{
    public class WorkflowStepSecondaryRecipientConfiguration : IEntityTypeConfiguration<WorkflowStepSecondaryRecipient>
    {
        public void Configure(EntityTypeBuilder<WorkflowStepSecondaryRecipient> builder)
        {
            // Primary Key
            builder.HasKey(wssr => wssr.Id);

            // Indices
            builder.HasIndex(wssr => new { wssr.StepId, wssr.RecipientId, wssr.RecipientType }).IsUnique();
            builder.HasIndex(wssr => wssr.StepId);
            builder.HasIndex(wssr => wssr.RecipientId);


            // Properties
            builder.Property(wssr => wssr.Purpose).HasMaxLength(255);
            builder.Property(wssr => wssr.InstructionText).HasColumnType("text");

            // Relationships
            builder.HasOne(wssr => wssr.WorkflowStep)
                .WithMany(ws => ws.SecondaryRecipients)
                .HasForeignKey(wssr => wssr.StepId)
                .OnDelete(DeleteBehavior.Cascade);

            // Note: We don't define relationships for RecipientId because it's a polymorphic association
            // The application must interpret RecipientId based on RecipientType

            // Filter soft-deleted entities
            builder.HasQueryFilter(wssr => !wssr.IsDeleted);
        }
    }
}