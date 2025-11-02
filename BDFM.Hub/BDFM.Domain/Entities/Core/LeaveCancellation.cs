using BDFM.Domain.Common;
using BDFM.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Entities.Core
{
    public class LeaveCancellation : AuditableEntity<Guid>
    {
        public Guid LeaveRequestId { get; set; }
        public virtual LeaveRequest LeaveRequest { get; set; } = default!;

        public DateTime CancellationDate { get; set; }
        public Guid CancelledByUserId { get; set; }
        public virtual User CancelledByUser { get; set; } = default!;

        [StringLength(100)]
        public string? EmployeeId { get; set; } // معرف الموظف من HR (للتوثيق)

        public string? Reason { get; set; } // Text type in DB
        public bool IsBalanceRestored { get; set; } = false; // هل تم استرجاع الرصيد
        public decimal? RestoredDays { get; set; } // الأيام المسترجعة
    }
}
