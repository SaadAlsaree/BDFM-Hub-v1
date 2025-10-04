namespace BDFM.Application.Features.Attachments.Commands.DeleteAttachments
{
    public class DeleteAttachmentsCommand : IRequest<Response<bool>>
    {
        public Guid Id { get; set; }
        public Guid DeletedBy { get; set; }
    }
}
