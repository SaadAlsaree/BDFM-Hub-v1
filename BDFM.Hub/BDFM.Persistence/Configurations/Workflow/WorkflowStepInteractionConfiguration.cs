using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Workflow
{
    public class WorkflowStepInteractionConfiguration : IEntityTypeConfiguration<WorkflowStepInteraction>
    {
        public void Configure(EntityTypeBuilder<WorkflowStepInteraction> builder)
        {
            // Primary Key
            builder.HasKey(wsi => wsi.Id);

            // Indices
            builder.HasIndex(wsi => new { wsi.WorkflowStepId, wsi.InteractingUserId }).IsUnique()
                .HasFilter("\"InteractingUserId\" IS NOT NULL");
            builder.HasIndex(wsi => wsi.WorkflowStepId);
            builder.HasIndex(wsi => wsi.InteractingUserId);

            // Relationships
            builder.HasOne(wsi => wsi.WorkflowStep)
                .WithMany(ws => ws.Interactions)
                .HasForeignKey(wsi => wsi.WorkflowStepId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(wsi => wsi.InteractingUser)
                .WithMany()  // No inverse navigation property defined in User class
                .HasForeignKey(wsi => wsi.InteractingUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(wsi => !wsi.IsDeleted);
        }
    }
}