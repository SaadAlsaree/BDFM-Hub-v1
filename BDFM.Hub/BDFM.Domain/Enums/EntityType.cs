namespace BDFM.Domain.Enums
{
    public enum EntityType
    {
        [Display(Name = "وزارة")]
        Ministry,
        [Display(Name = "هيئة")]
        Authority,
        [Display(Name = "شركة")]
        Company,
        [Display(Name = "مؤسسة")]
        Individual,
        [Display(Name = "أخرى")]
        Other
    }
}
