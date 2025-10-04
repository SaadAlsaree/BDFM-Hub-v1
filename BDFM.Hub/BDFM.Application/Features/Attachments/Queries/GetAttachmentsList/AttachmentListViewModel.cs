namespace BDFM.Application.Features.Attachments.Queries.GetAttachmentsList
{
    public class AttachmentListViewModel
    {
        public Guid Id { get; set; }
        public Guid? PrimaryTableId { get; set; }
        public TableNames TableName { get; set; }
        public string TableNameDisplay { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? FileName { get; set; }
        public string? FileExtension { get; set; }
        public long? FileSize { get; set; }
        public int Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public DateTime CreateAt { get; set; }
        public Guid? CreateBy { get; set; }
        public string? CreateByName { get; set; }
    }
}
