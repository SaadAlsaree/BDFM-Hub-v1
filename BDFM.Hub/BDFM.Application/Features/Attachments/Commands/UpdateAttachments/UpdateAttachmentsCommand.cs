using Microsoft.AspNetCore.Http;

namespace BDFM.Application.Features.Attachments.Commands.UpdateAttachments
{
    public class UpdateAttachmentsCommand : IRequest<Response<bool>>
    {
        public Guid Id { get; set; }
        public Guid? PrimaryTableId { get; set; }
        public IFormFile? File { get; set; } // Optional for update
        public TableNames TableName { get; set; } = TableNames.Correspondences;
        public string Secret { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public string? FileExtension { get; set; }
        public long? FileSize { get; set; }
        public string? OcrText { get; set; } // ???? ???????? ?? OCR (??? ??? ?????? ???????)
        public Guid LastUpdateBy { get; set; }
    }
}
