namespace BDFM.Application.Features.Correspondences.Commands.RemoveAttachment
{
    public class RemoveAttachmentCommand : IRequest<Response<bool>>
    {
        // Target correspondence ID
        public Guid CorrespondenceId { get; set; }

        // Target attachment ID
        public Guid AttachmentId { get; set; }
    }
}
