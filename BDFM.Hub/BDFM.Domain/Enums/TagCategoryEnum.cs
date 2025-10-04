namespace BDFM.Domain.Enums
{
    public enum TagCategoryEnum
    {
        [Display(Name = "عام")]
        General = 1,
        [Display(Name = "أولوية")]
        Priority = 2,
        [Display(Name = "قسم")]
        Department = 3,
        [Display(Name = "مشروع")]
        Project = 4,
        [Display(Name = "موضوع")]
        Subject = 5,
        [Display(Name = "حالة")]
        Status = 6,
        [Display(Name = "موقع")]
        Location = 7,
        [Display(Name = "عميل")]
        Client = 8,
        [Display(Name = "قانوني")]
        Legal = 9,
        [Display(Name = "مالي")]
        Financial = 10,
        [Display(Name = "فني")]
        Technical = 11,
        [Display(Name = "إداري")]
        Administrative = 12,
        [Display(Name = "عاجل")]
        Urgent = 13,
        [Display(Name = "سري")]
        Confidential = 14,
        [Display(Name = "أرشيف")]
        Archive = 15,
        [Display(Name = "مراجعة")]
        Review = 16,
        [Display(Name = "موافقة")]
        Approval = 17,
        [Display(Name = "تابع")]
        Follow_Up = 18,
        [Display(Name = "مرجع")]
        Reference = 19,
        [Display(Name = "مخصص")]
        Custom = 20
    }
}