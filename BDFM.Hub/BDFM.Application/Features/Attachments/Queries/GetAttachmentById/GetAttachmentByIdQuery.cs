namespace BDFM.Application.Features.Attachments.Queries.GetAttachmentById
{
    public class GetAttachmentByIdQuery : IRequest<Response<AttachmentViewModel>>
    {
        public Guid Id { get; set; }
    }
}
