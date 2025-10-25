namespace BDFM.Domain.Enums
{
    public enum CorrespondenceTypeEnum
    {

        [Display(Name = "مسودة")]
        Draft = 0,
        [Display(Name = "وارد خارجي")]
        IncomingExternal = 1,
        [Display(Name = "صادر خارجي")]
        OutgoingExternal = 2,
        [Display(Name = "وارد داخلي")]
        IncomingInternal = 3,
        [Display(Name = "صادر داخلي")]
        OutgoingInternal = 4,
        [Display(Name = "المطالعة")]
        Memorandum = 5,
        [Display(Name = "رد")]
        Reply = 6,
        [Display(Name = "اعمام")]
        Public = 7,
        [Display(Name = "طلب شخصي")]
        PersonalRequest = 8
    }
}
