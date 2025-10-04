namespace BDFM.Domain.Enums
{
    public enum RecipientTypeEnum
    {
        [Display(Name = "مستخدم")]
        User = 1,
        [Display(Name = "جهة")]
        Unit = 2,
        [Display(Name = "جهة خارجية")]
        ExternalEntity = 3 // For primary recipient of workflow
    }
}
