using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Enums
{
    public enum Status
    {
        [Display(Name = "غير معرف")]
        None = -1,
        [Display(Name = "غير مدقق")]
        Pending = 0,
        [Display(Name = "فعال")]
        Active = 1,
        [Display(Name = "غير مدقق")]
        Unverified = 33,
        [Display(Name = "غير فعال")]
        InActive = 2,
        [Display(Name = "قيد التدقيق")]
        UnderVerification = 44,
        [Display(Name = "مدقق")]
        Verified = 55,
        [Display(Name = "تم الاجراء")]
        ActionTaken = 66,
        [Display(Name = "مؤرشف")]
        Archived = 77
    }
}
