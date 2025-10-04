using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Workflow
{
    public class WorkflowStepTodoConfiguration : IEntityTypeConfiguration<WorkflowStepTodo>
    {
        public void Configure(EntityTypeBuilder<WorkflowStepTodo> builder)
        {
            // Primary Key
            builder.HasKey(wt => wt.Id);

            // Indices
            builder.HasIndex(wt => wt.WorkflowStepId);
            builder.HasIndex(wt => wt.IsCompleted);
            builder.HasIndex(wt => wt.DueDate);
            builder.HasIndex(wt => new { wt.WorkflowStepId, wt.IsCompleted });

            // Properties
            builder.Property(wt => wt.Title)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(wt => wt.Description)
                .HasMaxLength(1000);

            builder.Property(wt => wt.Notes)
                .HasMaxLength(2000);

            builder.Property(wt => wt.IsCompleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(wt => wt.DueDate)
                .IsRequired(false);

            // Relationships
            builder.HasOne(wt => wt.WorkflowStep)
                .WithMany(ws => ws.Todos)
                .HasForeignKey(wt => wt.WorkflowStepId)
                .OnDelete(DeleteBehavior.Cascade);

            // Filter soft-deleted entities
            builder.HasQueryFilter(wt => !wt.IsDeleted);
        }
    }
}
