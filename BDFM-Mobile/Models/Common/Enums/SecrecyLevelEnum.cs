using System.ComponentModel.DataAnnotations;

namespace BDFM_Mobile.Models.Common.Enums;

public enum SecrecyLevelEnum
{
    [Display(Name = "عام")]
    None = 0,
    [Display(Name = "محدود")]
    Limited = 1,
    [Display(Name = "سري")]
    Secret = 2,
    [Display(Name = "عالي السرية")]
    TopSecret = 3
}
