using BDFM.Domain.Entities.Supporting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Supporting
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            // Primary Key
            builder.HasKey(n => n.Id);

            // Indices
            builder.HasIndex(n => n.UserId);
            builder.HasIndex(n => n.LinkToCorrespondenceId);
            builder.HasIndex(n => n.LinkToWorkflowStepId);


            // Properties
            builder.Property(n => n.Message).IsRequired().HasColumnType("text");

            // Relationships
            builder.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(n => n.LinkToCorrespondence)
                .WithMany(c => c.Notifications)
                .HasForeignKey(n => n.LinkToCorrespondenceId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(n => n.LinkToWorkflowStep)
                .WithMany(ws => ws.Notifications)
                .HasForeignKey(n => n.LinkToWorkflowStepId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(n => !n.IsDeleted);
        }
    }
}