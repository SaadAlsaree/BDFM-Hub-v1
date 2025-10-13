using System.ComponentModel.DataAnnotations;

namespace BDFM_Mobile.Models.Common.Enums;

public enum PriorityLevelEnum
{
    [Display(Name = "غير مرتبة")]
    None = 0,
    [Display(Name = "عادي")]
    Normal = 1,
    [Display(Name = "مستعجل")]
    Urgent = 2,
    [Display(Name = "مستعجل جدا")]
    VeryUrgent = 3,
    [Display(Name = "فوري")]
    Immediate = 4
}
