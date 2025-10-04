using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Common;
public enum SuccessMessage
{
    [Display(Name = "تم جلب البيانات")]
    Get = 100,
    [Display(Name = "تم تحديث البيانات")]
    Update = 101,
    [Display(Name = "تم ادخال البيانات")]
    Create = 103,
    [Display(Name = "تم حذف البيانات")]
    Delete = 103,
}
