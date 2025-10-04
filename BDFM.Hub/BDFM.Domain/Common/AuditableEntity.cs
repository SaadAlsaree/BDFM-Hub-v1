using BDFM.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace BDFM.Domain.Common
{
    public class AuditableEntity<T> : IAuditableEntity
    {
        [Key]
        public T Id { get; set; } = default!;
        public DateTime CreateAt { get; set; } = DateTime.Now;
        public Guid? CreateBy { get; set; }
        public DateTime? LastUpdateAt { get; set; }
        public Guid? LastUpdateBy { get; set; }
        public Status StatusId { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public DateTime? DoneProcdureDate { get; set; }
        public Guid? DeletedBy { get; set; }
    }
}
