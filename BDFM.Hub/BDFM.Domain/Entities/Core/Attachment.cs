using BDFM.Domain.Common;
using BDFM.Domain.Enums;

namespace BDFM.Domain.Entities.Core
{
    public class Attachment : AuditableEntity<Guid>
    {
        public Guid? PrimaryTableId { get; set; }
        public TableNames TableName { get; set; }
        public string? Description { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public string? FileExtension { get; set; }
        public long? FileSize { get; set; }
        public string? OcrText { get; set; }
        public string? Secret { get; set; }
    }
}
