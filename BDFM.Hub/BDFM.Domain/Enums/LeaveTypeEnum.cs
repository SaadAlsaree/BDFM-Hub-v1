using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Enums
{
    public enum LeaveTypeEnum
    {
        [Display(Name = "عادية/يومية")]
        RegularDaily = 1,
        [Display(Name = "طويلة المدة")]
        LongTerm = 2,
        [Display(Name = "سنوية")]
        Annual = 3,
        [Display(Name = "دراسية")]
        Study = 4,
        [Display(Name = "أمومة")]
        Maternity = 5,
        [Display(Name = "عدة")]
        Mourning = 6,
        [Display(Name = "مرضية")]
        Sick = 7
    }
}
