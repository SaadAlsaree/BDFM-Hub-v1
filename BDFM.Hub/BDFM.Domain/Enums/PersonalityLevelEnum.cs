using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Enums
{
    public enum PersonalityLevelEnum
    {
        [Display(Name = "عام")]
        General = 0,
        [Display(Name = "شخصي")]
        Personal = 1,
        [Display(Name = "يفتح بالذات")]
        ToBeOpenedByAddresseeOnly = 2 // يفتح بالذات
    }
}
