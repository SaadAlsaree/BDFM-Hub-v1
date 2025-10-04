using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Enums
{
    public enum NotificationTypeEnum
    {
        [Display(Name = "تذكير")]
        Reminder = 1,
        [Display(Name = "رسالة جديدة")]
        NewMail = 2,
        [Display(Name = "إجراء مطلوب")]
        ActionRequired = 3,
        [Display(Name = "تحديث الحالة")]
        StatusUpdate = 4,
        [Display(Name = "تم استلام الكتاب")]
        BOOK_RECEIVED = 5,
        [Display(Name = "تم أجابة الكتاب")]
        BOOK_RESOLVED = 6,
        [Display(Name = "الإجراء المستحق")]
        ACTION_DUE = 7,
        [Display(Name = "تم استلام التعيين")]
        DELEGATION_RECEIVED = 8,
        [Display(Name = "تم إضافة التعليق")]
        COMMENT_ADDED = 9,
        [Display(Name = "تم طلب التوقيع")]
        SIGNATURE_REQUESTED = 10
    }
}
