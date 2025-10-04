namespace BDFM.Domain.Enums
{
    public enum CommentVisibility
    {
        [Display(Name = "كل الموظفين")]
        InternalUsers, // كل المستخدمين الداخليين الذين لهم وصول للمراسلة
        [Display(Name = "جهة معينة")]
        SpecificUnits, // لوحدات معينة فقط
        [Display(Name = "خاص بالكاتب ومن تم الإشارة إليهم")]
        PrivateToAuthorAndMentions // خاص بالكاتب ومن تم الإشارة إليهم
    }
}
