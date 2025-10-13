using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Supporting
{
    public class CustomWorkflowConfiguration : IEntityTypeConfiguration<CustomWorkflow>
    {
        public void Configure(EntityTypeBuilder<CustomWorkflow> builder)
        {
            // Primary Key
            builder.HasKey(cw => cw.Id);

            // Indices
            builder.HasIndex(cw => cw.WorkflowName);
            builder.HasIndex(cw => cw.TriggeringUnitId);


            // Properties
            builder.Property(cw => cw.WorkflowName).IsRequired().HasMaxLength(255);
            builder.Property(cw => cw.Description).HasMaxLength(1000);


            // Relationships
            builder.HasOne(cw => cw.TriggeringUnit)
                .WithMany(ou => ou.TriggeringCustomWorkflows)
                .HasForeignKey(cw => cw.TriggeringUnitId)
                .OnDelete(DeleteBehavior.SetNull);

            // Filter soft-deleted entities
            builder.HasQueryFilter(cw => !cw.IsDeleted);
        }
    }
}