using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Core
{
    public class LeaveBalanceHistoryConfiguration : IEntityTypeConfiguration<LeaveBalanceHistory>
    {
        public void Configure(EntityTypeBuilder<LeaveBalanceHistory> builder)
        {
            // Primary Key
            builder.HasKey(lbh => lbh.Id);

            // Indices
            builder.HasIndex(lbh => lbh.LeaveRequestId);
            builder.HasIndex(lbh => lbh.EmployeeId);
            builder.HasIndex(lbh => lbh.LeaveType);
            builder.HasIndex(lbh => lbh.ChangedByUserId);
            builder.HasIndex(lbh => lbh.ChangeDate);
            builder.HasIndex(lbh => lbh.ChangeType);

            // Composite indices
            builder.HasIndex(lbh => new { lbh.EmployeeId, lbh.LeaveType, lbh.ChangeDate });

            // Properties
            builder.Property(lbh => lbh.EmployeeId).IsRequired().HasMaxLength(100);
            builder.Property(lbh => lbh.EmployeeNumber).HasMaxLength(100);
            builder.Property(lbh => lbh.ChangeReason).IsRequired().HasMaxLength(1000);
            builder.Property(lbh => lbh.ChangeType).IsRequired().HasMaxLength(50);
            builder.Property(lbh => lbh.PreviousBalance).HasPrecision(18, 2);
            builder.Property(lbh => lbh.NewBalance).HasPrecision(18, 2);
            builder.Property(lbh => lbh.ChangeAmount).HasPrecision(18, 2);

            // Relationships
            builder.HasOne(lbh => lbh.LeaveRequest)
                .WithMany(lr => lr.BalanceHistories)
                .HasForeignKey(lbh => lbh.LeaveRequestId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(lbh => lbh.ChangedByUser)
                .WithMany(u => u.LeaveBalanceHistories)
                .HasForeignKey(lbh => lbh.ChangedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(lbh => !lbh.IsDeleted);
        }
    }
}
