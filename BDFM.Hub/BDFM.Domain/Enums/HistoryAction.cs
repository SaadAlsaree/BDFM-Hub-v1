using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Enums
{
    public enum HistoryAction
    {
        [Display(Name = "إنشاء")]
        CREATE = 0,
        [Display(Name = "نقل")]
        TRANSFER = 1,
        [Display(Name = "استلام")]
        RECEIVE = 2,
        [Display(Name = "تعيين")]
        ASSIGN = 3,
        [Display(Name = "إكمال المهمة")]
        COMPLETE_ASSIGNMENT = 4,
        [Display(Name = "تعليق")]
        COMMENT = 5,
        [Display(Name = "إرفاق")]
        ATTACH = 6,
        [Display(Name = "توقيع")]
        SIGN = 7,
        [Display(Name = "تحديد كمقروء")]
        MARK_READ = 8,
        [Display(Name = "موافقة")]
        APPROVE = 9,
        [Display(Name = "رفض")]
        REJECT = 10,
        [Display(Name = "إعادة توجيه")]
        FORWARD = 11,
        [Display(Name = "حل")]
        RESOLVE = 12,
        [Display(Name = "مؤرشف")]
        ARCHIVE = 13,
        [Display(Name = "إسترجاع")]
        RESTORE = 14,
        [Display(Name = "ربط")]
        RELATE = 15,
        [Display(Name = "فصل الربط")]
        UNRELATE = 16,
        [Display(Name = "جمع")]
        COLLECT = 17,
        [Display(Name = "إزالة الجمع")]
        REMOVE_COLLECTION = 18,
        [Display(Name = "تفويض")]
        DELEGATE = 19,
        [Display(Name = "إلغاء التفويض")]
        REVOKE_DELEGATION = 20,
        [Display(Name = "تحديث الحالة")]
        UPDATE_STATUS = 21,
        [Display(Name = "تحديث التفاصيل")]
        UPDATE_DETAILS = 22
    }
}