using Microsoft.AspNetCore.Http;

namespace BDFM.Application.Features.Attachments.Commands.CreateAttachments
{
    public class CreateAttachmentsCommand : IRequest<Response<bool>>
    {
        public Guid? PrimaryTableId { get; set; }
        public IFormFile File { get; set; } = null!;
        public TableNames TableName { get; set; } = TableNames.Correspondences;
        public string? Description { get; set; }
        public long? FileSize { get; set; }
        public string? OcrText { get; set; } // ???? ???????? ?? OCR (??? ??? ?????? ???????)
        public Guid CreateBy { get; set; }

    }
}
