using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Common;
public enum ErrorsMessage
{
    [Display(Name = "حدث خطأ أثناء جلب البيانات , أعد المحاولة لاحقاً")]
    FailOnGet = 10001,

    [Display(Name = "حدث خطأ أثناء إدخال البيانات , أعد المحاولة لاحقاً")]
    FailOnCreate = 10002,

    [Display(Name = "حدث خطأ أثناء تحديث البيانات , أعد المحاولة لاحقاً")]
    FailOnUpdate = 10003,

    [Display(Name = "حدث خطأ أثناء حذف البيانات , أعد المحاولة لاحقاً")]
    FailOnDelete = 10004,

    [Display(Name = "المدخل موجود سابقاً")]
    ExistOnCreate = 10005,

    [Display(Name = "يرجى التحقق من المدخلات , لا توجد بيانات")]
    NotExistOnCreate = 10006,

    [Display(Name = "لا توجد بيانات")]
    NotFoundData = 10007,

    [Display(Name = "الحالة غير معرفة")]
    ThisStatusNotFound = 10008,

    [Display(Name = "يرجى التحقق من المدخلات , لا توجد بيانات")]
    NotExistOnUpdate = 10009,
}