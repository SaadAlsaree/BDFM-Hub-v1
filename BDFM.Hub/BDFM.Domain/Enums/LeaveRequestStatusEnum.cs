using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Enums
{
    public enum LeaveRequestStatusEnum
    {
        [Display(Name = "مسودة")]
        Draft = 1,
        [Display(Name = "قيد الموافقة")]
        PendingApproval = 2,
        [Display(Name = "موافق عليه")]
        Approved = 3,
        [Display(Name = "مرفوض")]
        Rejected = 4,
        [Display(Name = "ملغي")]
        Cancelled = 5,
        [Display(Name = "مقطوع")]
        Interrupted = 6,
        [Display(Name = "منتهية")]
        Completed = 7
    }
}
