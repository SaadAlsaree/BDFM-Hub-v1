using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Enums
{
    public enum LeaveInterruptionTypeEnum
    {
        [Display(Name = "عودة الموظف")]
        EmployeeReturn = 1,
        [Display(Name = "إنهاء مبكر")]
        EarlyEnd = 2
    }
}
