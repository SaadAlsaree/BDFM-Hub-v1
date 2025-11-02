using BDFM.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BDFM.Persistence.Configurations.Core
{
    public class LeaveRequestConfiguration : IEntityTypeConfiguration<LeaveRequest>
    {
        public void Configure(EntityTypeBuilder<LeaveRequest> builder)
        {
            // Primary Key
            builder.HasKey(lr => lr.Id);

            // Indices
            builder.HasIndex(lr => lr.EmployeeId);
            builder.HasIndex(lr => lr.OrganizationalUnitId);
            builder.HasIndex(lr => lr.CreatedByUserId);
            builder.HasIndex(lr => lr.Status);
            builder.HasIndex(lr => lr.LeaveType);
            builder.HasIndex(lr => lr.RequestNumber).IsUnique().HasFilter("\"RequestNumber\" IS NOT NULL");

            // Composite indices
            builder.HasIndex(lr => new { lr.EmployeeId, lr.Status });
            builder.HasIndex(lr => new { lr.StartDate, lr.EndDate });

            // Properties
            builder.Property(lr => lr.EmployeeId).IsRequired().HasMaxLength(100);
            builder.Property(lr => lr.EmployeeNumber).HasMaxLength(100);
            builder.Property(lr => lr.EmployeeName).HasMaxLength(255);
            builder.Property(lr => lr.RequestNumber).HasMaxLength(100);
            builder.Property(lr => lr.Reason).HasColumnType("text");
            builder.Property(lr => lr.RejectionReason).HasColumnType("text");
            builder.Property(lr => lr.CancellationReason).HasColumnType("text");

            // Relationships
            builder.HasOne(lr => lr.OrganizationalUnit)
                .WithMany(ou => ou.LeaveRequests)
                .HasForeignKey(lr => lr.OrganizationalUnitId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(lr => lr.CreatedByUser)
                .WithMany(u => u.CreatedLeaveRequests)
                .HasForeignKey(lr => lr.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(lr => lr.ApprovedByUser)
                .WithMany(u => u.ApprovedLeaveRequests)
                .HasForeignKey(lr => lr.ApprovedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(lr => lr.CancelledByUser)
                .WithMany(u => u.CancelledLeaveRequests)
                .HasForeignKey(lr => lr.CancelledByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Filter soft-deleted entities
            builder.HasQueryFilter(lr => !lr.IsDeleted);
        }
    }
}
