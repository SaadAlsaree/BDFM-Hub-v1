namespace BDFM.Application.Features.Attachments.Queries.GetAttachmentById
{
    public class AttachmentViewModel
    {
        public Guid Id { get; set; }
        public Guid? PrimaryTableId { get; set; }
        public TableNames TableName { get; set; }
        public string TableNameDisplay { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public string? FileExtension { get; set; }
        public long? FileSize { get; set; }
        public string? OcrText { get; set; }
        public int StatusId { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public DateTime CreateAt { get; set; }
        public Guid? CreateBy { get; set; }
        public string? CreateByName { get; set; }
        public DateTime? LastUpdateAt { get; set; }
        public Guid? LastUpdateBy { get; set; }
        public string? LastUpdateByName { get; set; }
        public string FileBase64 { get; set; } = string.Empty;
    }
}
