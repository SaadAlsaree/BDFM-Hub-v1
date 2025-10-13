using System.ComponentModel.DataAnnotations;

namespace BDFM_Mobile.Models.Common.Enums;

public enum InternalActionTypeEnum
{
    [Display(Name = "إعادة إحالة")]
    Referral = 1,

    [Display(Name = "أجابة")]
    Answer = 2,

    [Display(Name = "رفض")]
    Reject = 3,
}
