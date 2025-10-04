using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Workflow
{
    public class TodoTemplate : AuditableEntity<Guid>
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsCompleted { get; set; } = false;
        public DateTime? DueDate { get; set; }
        public string? Notes { get; set; }
    }
}
