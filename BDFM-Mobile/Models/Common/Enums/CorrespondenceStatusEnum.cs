using System.ComponentModel.DataAnnotations;

namespace BDFM_Mobile.Models.Common.Enums;

public enum CorrespondenceStatusEnum
{
    [Display(Name = "مسجل")]
    Registered = 1,
    [Display(Name = "قيد الانتظار")]
    PendingReferral = 2,
    [Display(Name = "قيد المعالجة")]
    UnderProcessing = 3,
    [Display(Name = "قيد الموافقة")]
    PendingApproval = 4,
    [Display(Name = "موافق")]
    Approved = 5,
    [Display(Name = "قيد التوقيع")]
    InSignatureAgenda = 6,
    [Display(Name = "موقع")]
    Signed = 7,
    [Display(Name = "إرسال أو صادر")]
    SentOrOutgoing = 8,
    [Display(Name = "مكتمل")]
    Completed = 9,
    [Display(Name = "مرفوض")]
    Rejected = 10,
    [Display(Name = "إرجاع للتعديل")]
    ReturnedForModification = 11,
    [Display(Name = "مؤجل")]
    Postponed = 12,
    [Display(Name = "ملغي")]
    Cancelled = 13
}
