namespace BDFM.Domain.Enums
{
    public enum WorkflowStepStatus
    {
        [Display(Name = "قيد الانتظار")]
        Pending = 1,
        [Display(Name = "قيد التنفيذ")]
        InProgress = 2,
        [Display(Name = "مكتمل")]
        Completed = 3,
        [Display(Name = "مرفوض")]
        Rejected = 4,
        [Display(Name = "تعيين")]
        Delegated = 5,
        [Display(Name = "إرجاع")]
        Returned = 6
    }
}
