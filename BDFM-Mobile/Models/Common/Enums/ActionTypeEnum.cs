using System.ComponentModel.DataAnnotations;

namespace BDFM_Mobile.Models.Common.Enums;

public enum ActionTypeEnum
{
    [Display(Name = "تسجيل الوارد")]
    RegisterIncoming = 1,
    [Display(Name = "طلب الموافقة")]
    RequestApproval = 2,
    [Display(Name = "أجراء الازم")]
    Action = 3,
    [Display(Name = "رفض")]
    Reject = 4,
    [Display(Name = "إرجاع")]
    Return = 5,
    [Display(Name = "إرسال")]
    Send = 6,
    [Display(Name = "أرشيف")]
    Archive = 7,
    [Display(Name = "وضع تحت اليد")]
    TakeUnderConsideration = 8,
    [Display(Name = "طلب معلومات")]
    RequestInformation = 9,
    [Display(Name = "إرسال إلى جهة خارجية")]
    SendToExternalReferral = 10,
    [Display(Name = "إرسال إلى جهة داخلية")]
    SendToInternalReferral = 11,
}
