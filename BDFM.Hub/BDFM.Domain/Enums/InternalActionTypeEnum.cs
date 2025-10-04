namespace BDFM.Domain.Enums
{
    public enum InternalActionTypeEnum
    {
        [Display(Name = "إعادة إحالة")]
        Referral = 1,

        [Display(Name = "أجابة")]
        Answer = 2,

        [Display(Name = "رفض")]
        Reject = 3,

    }
}
