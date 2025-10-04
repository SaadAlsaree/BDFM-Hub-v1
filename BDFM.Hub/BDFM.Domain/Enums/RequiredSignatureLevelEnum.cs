namespace BDFM.Domain.Enums
{
    public enum RequiredSignatureLevelEnum
    {
        None = 0, // ارسال مباشر (نادر للخارجي)
        UnitManager = 1, // مدير الوحدة/المديرية
        DepartmentHead = 2, // مدير الدائرة (اذا كان اعلى من الوحدة)
        DeputyHead = 3, // الوكيل
        HeadOfOrganization = 4 // رئيس الجهاز
    }
}
