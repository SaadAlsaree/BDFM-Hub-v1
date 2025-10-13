namespace BDFM.Domain.Enums
{
    public enum CustomWorkflowTargetTypeEnum
    {
        [Display(Name = "مستخدم")]
        SpecificUser = 1,
        [Display(Name = "جهة")]
        SpecificUnit = 2,
        [Display(Name = "صلاحية في وحدة")]
        RoleInUnit = 3,
        [Display(Name = "مدير الوحدة")]
        ManagerOfUnit = 4,
        [Display(Name = "رئيس الجهاز")]
        HeadOfDevice = 5
    }
}
