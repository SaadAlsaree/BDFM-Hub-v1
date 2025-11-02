using BDFM.Domain.Common;
using BDFM.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Entities.Core
{
    public class LeaveBalanceHistory : AuditableEntity<Guid>
    {
        public Guid? LeaveRequestId { get; set; } // اختياري، مرتبط بطلب إجازة
        public virtual LeaveRequest? LeaveRequest { get; set; }

        [StringLength(100)]
        public string EmployeeId { get; set; } = string.Empty; // معرف الموظف من HR

        [StringLength(100)]
        public string? EmployeeNumber { get; set; } // رقم الموظف من HR

        public LeaveTypeEnum LeaveType { get; set; }
        public decimal PreviousBalance { get; set; } // الرصيد السابق
        public decimal NewBalance { get; set; } // الرصيد الجديد
        public decimal ChangeAmount { get; set; } // قيمة التغيير: + أو -
        public string ChangeReason { get; set; } = string.Empty; // Text type in DB

        public Guid? ChangedByUserId { get; set; }
        public virtual User? ChangedByUser { get; set; }

        public DateTime ChangeDate { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string ChangeType { get; set; } = string.Empty; // "Approval", "Cancellation", "Interruption", "MonthlyReset", "HRSync"
    }
}
