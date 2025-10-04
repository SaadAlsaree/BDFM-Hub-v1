using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Enums
{
    public enum RelationshipType
    {
        [Display(Name = "ذات صلة ب")]
        RELATED_TO = 0,
        [Display(Name = "تأكيد")]
        CONFIRMATION_OF = 1,
        [Display(Name = "رد")]
        REPLY_TO = 2,
        [Display(Name = "يتجاوز")]
        SUPERSEDES = 3
    }
}