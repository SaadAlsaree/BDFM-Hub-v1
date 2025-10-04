namespace BDFM.Application.Features.Correspondences.Commands.RemoveAttachment
{
    public class RemoveAttachmentHandler : IRequestHandler<RemoveAttachmentCommand, Response<bool>>
    {
        public Task<Response<bool>> Handle(RemoveAttachmentCommand request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
