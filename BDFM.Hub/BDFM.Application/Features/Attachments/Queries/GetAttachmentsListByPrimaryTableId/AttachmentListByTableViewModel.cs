namespace BDFM.Application.Features.Attachments.Queries.GetAttachmentsListByPrimaryTableId
{
    public class AttachmentListByTableViewModel
    {
        public Guid Id { get; set; }
        public string? Description { get; set; }
        public string? FileName { get; set; }
        public string? FileExtension { get; set; }
        public long? FileSize { get; set; }
        public string FileSizeDisplay { get; set; } = string.Empty; // Human readable file size
        public int Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public DateTime CreateAt { get; set; }
        public Guid? CreateBy { get; set; }
        public DateTime? LastUpdateAt { get; set; }
        public bool HasOcrText { get; set; } // Indicates if OCR text is available
        public string? CreateByName { get; set; }
        public string? LastUpdateByName { get; set; }
    }
}
