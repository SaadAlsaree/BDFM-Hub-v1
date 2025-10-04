using BDFM.Domain.Enums;

namespace BDFM.Domain.Common
{
    public interface IAuditableEntity
    {
        DateTime CreateAt { get; set; }
        Guid? CreateBy { get; set; }
        DateTime? LastUpdateAt { get; set; }
        Guid? LastUpdateBy { get; set; }
        Status StatusId { get; set; }
        bool IsDeleted { get; set; }
        DateTime? DeletedAt { get; set; }
        Guid? DeletedBy { get; set; }
    }
}