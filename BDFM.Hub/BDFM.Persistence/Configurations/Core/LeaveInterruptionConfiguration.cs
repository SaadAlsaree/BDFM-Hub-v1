using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Core
{
    public class LeaveInterruptionConfiguration : IEntityTypeConfiguration<LeaveInterruption>
    {
        public void Configure(EntityTypeBuilder<LeaveInterruption> builder)
        {
            // Primary Key
            builder.HasKey(li => li.Id);

            // Indices
            builder.HasIndex(li => li.LeaveRequestId);
            builder.HasIndex(li => li.InterruptedByUserId);
            builder.HasIndex(li => li.EmployeeId);

            // Properties
            builder.Property(li => li.EmployeeId).HasMaxLength(100);
            builder.Property(li => li.Reason).HasColumnType("text");
            builder.Property(li => li.AdjustedDays).HasPrecision(18, 2);

            // Relationships
            builder.HasOne(li => li.LeaveRequest)
                .WithMany(lr => lr.Interruptions)
                .HasForeignKey(li => li.LeaveRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(li => li.InterruptedByUser)
                .WithMany(u => u.LeaveInterruptions)
                .HasForeignKey(li => li.InterruptedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(li => !li.IsDeleted);
        }
    }
}
