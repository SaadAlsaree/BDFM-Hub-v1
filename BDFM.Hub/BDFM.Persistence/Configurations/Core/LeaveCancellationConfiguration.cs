using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Core
{
    public class LeaveCancellationConfiguration : IEntityTypeConfiguration<LeaveCancellation>
    {
        public void Configure(EntityTypeBuilder<LeaveCancellation> builder)
        {
            // Primary Key
            builder.HasKey(lc => lc.Id);

            // Indices
            builder.HasIndex(lc => lc.LeaveRequestId);
            builder.HasIndex(lc => lc.CancelledByUserId);
            builder.HasIndex(lc => lc.EmployeeId);

            // Properties
            builder.Property(lc => lc.EmployeeId).HasMaxLength(100);
            builder.Property(lc => lc.Reason).HasColumnType("text");
            builder.Property(lc => lc.RestoredDays).HasPrecision(18, 2);

            // Relationships
            builder.HasOne(lc => lc.LeaveRequest)
                .WithMany(lr => lr.Cancellations)
                .HasForeignKey(lc => lc.LeaveRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(lc => lc.CancelledByUser)
                .WithMany(u => u.LeaveCancellations)
                .HasForeignKey(lc => lc.CancelledByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(lc => !lc.IsDeleted);
        }
    }
}
