using BDFM.Domain.Common;
using BDFM.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Entities.Core
{
    public class LeaveInterruption : AuditableEntity<Guid>
    {
        public Guid LeaveRequestId { get; set; }
        public virtual LeaveRequest LeaveRequest { get; set; } = default!;

        public DateTime InterruptionDate { get; set; } // تاريخ القطع
        public DateTime ReturnDate { get; set; } // تاريخ العودة للعمل
        public LeaveInterruptionTypeEnum InterruptionType { get; set; }
        public string? Reason { get; set; } // Text type in DB

        public Guid InterruptedByUserId { get; set; }
        public virtual User InterruptedByUser { get; set; } = default!;

        [StringLength(100)]
        public string? EmployeeId { get; set; } // معرف الموظف من HR (للتوثيق)

        public bool IsProcessed { get; set; } = false; // هل تم معالجة القطع وتحديث الرصيد
        public decimal? AdjustedDays { get; set; } // الأيام المعدلة بعد القطع
    }
}
