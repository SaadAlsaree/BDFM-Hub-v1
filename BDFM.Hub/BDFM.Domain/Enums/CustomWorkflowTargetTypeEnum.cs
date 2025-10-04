namespace BDFM.Domain.Enums
{
    public enum CustomWorkflowTargetTypeEnum
    {
        [Display(Name = "مستخدم معين")]
        SpecificUser = 1,
        [Display(Name = "وحدة معينة")]
        SpecificUnit = 2,
        [Display(Name = "صلاحية في وحدة")]
        RoleInUnit = 3,
        [Display(Name = "مدير الوحدة")]
        ManagerOfUnit = 4,
        [Display(Name = "رئيس الجهاز")]
        HeadOfDevice = 5
    }
}
