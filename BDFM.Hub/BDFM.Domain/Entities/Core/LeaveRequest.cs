using BDFM.Domain.Common;
using BDFM.Domain.Entities.Workflow;
using BDFM.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Entities.Core
{
    public class LeaveRequest : AuditableEntity<Guid>
    {
        [StringLength(100)]
        public string EmployeeId { get; set; } = string.Empty; // معرف الموظف من نظام HR

        [StringLength(100)]
        public string? EmployeeNumber { get; set; } // رقم الموظف من HR

        [StringLength(255)]
        public string? EmployeeName { get; set; } // اسم الموظف من HR

        public Guid? OrganizationalUnitId { get; set; }
        public virtual OrganizationalUnit? OrganizationalUnit { get; set; }

        public Guid? CreatedByUserId { get; set; }
        public virtual User? CreatedByUser { get; set; }

        public LeaveTypeEnum LeaveType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int RequestedDays { get; set; }  // عدد الأيام المطلوبة
        public int? ApprovedDays { get; set; }  // عدد الأيام الموافق عليها
        public decimal TotalBalance { get; set; } = 0; // الرصيد الكلي من نظام HR
        public decimal MonthlyBalance { get; set; } = 0; // الرصيد الشهري - 3 أيام للعادية
        public decimal UsedBalance { get; set; } = 0; // المستخدم
        public decimal AvailableBalance { get; set; } = 0; // المتاح = Total - Used
        public decimal MonthlyUsedBalance { get; set; } = 0; // المستخدم شهرياً

        public DateTime? LastMonthlyResetDate { get; set; } // تاريخ آخر إعادة تعيين شهري
        public LeaveRequestStatusEnum Status { get; set; }

        public string? Reason { get; set; } // Text type in DB // السبب في الطلب
        public string? RejectionReason { get; set; } // Text type in DB // السبب في الرفض 

        public DateTime? ApprovedAt { get; set; } // تاريخ الموافقة
        public Guid? ApprovedByUserId { get; set; } // معرف الموافق عليه
        public virtual User? ApprovedByUser { get; set; }

        public Guid? CancelledByUserId { get; set; } // معرف الملغي
        public virtual User? CancelledByUser { get; set; }
        public DateTime? CancelledAt { get; set; } // تاريخ الملغي
        public string? CancellationReason { get; set; } // Text type in DB // السبب في الملغي

        public bool IsInterrupted { get; set; } = false; // هل تم القطع
        public DateTime? ActualEndDate { get; set; } // تاريخ النهاية الفعلية

        [StringLength(100)]
        public string? RequestNumber { get; set; } // مثل "LEAVE-2025-001"

        // Navigation Properties
        public virtual ICollection<LeaveInterruption> Interruptions { get; set; } = new HashSet<LeaveInterruption>();
        public virtual ICollection<LeaveCancellation> Cancellations { get; set; } = new HashSet<LeaveCancellation>();
        public virtual ICollection<LeaveBalanceHistory> BalanceHistories { get; set; } = new HashSet<LeaveBalanceHistory>();
        public virtual ICollection<WorkflowStep> WorkflowSteps { get; set; } = new HashSet<WorkflowStep>();
    }
}
