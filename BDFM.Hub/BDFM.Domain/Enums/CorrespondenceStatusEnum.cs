namespace BDFM.Domain.Enums
{
    public enum CorrespondenceStatusEnum
    {


        [Display(Name = "قيد الانتظار")]
        PendingReferral = 1,
        [Display(Name = "قيد المعالجة")]
        UnderProcessing = 2,

        [Display(Name = "مكتمل")]
        Completed = 3,
        [Display(Name = "مرفوض")]
        Rejected = 4,
        [Display(Name = "إرجاع للتعديل")]
        ReturnedForModification = 5,
        [Display(Name = "مؤجل")]
        Postponed = 6,
    }
}
