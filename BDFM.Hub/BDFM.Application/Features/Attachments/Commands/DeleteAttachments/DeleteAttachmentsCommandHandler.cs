using BDFM.Domain.Entities.Core;

namespace BDFM.Application.Features.Attachments.Commands.DeleteAttachments
{
    public class DeleteAttachmentsCommandHandler : IRequestHandler<DeleteAttachmentsCommand, Response<bool>>
    {
        private readonly IBaseRepository<Attachment> _repository;

        public DeleteAttachmentsCommandHandler(IBaseRepository<Attachment> repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<Response<bool>> Handle(DeleteAttachmentsCommand request, CancellationToken cancellationToken)
        {
            // Find the attachment to delete
            var attachment = await _repository.Find(
                a => a.Id == request.Id && !a.IsDeleted,
                cancellationToken: cancellationToken);

            if (attachment == null)
                return ErrorsMessage.NotFoundData.ToErrorMessage(false);

            try
            {
                // Perform soft delete on the database record
                attachment.IsDeleted = true;
                attachment.DeletedAt = DateTime.UtcNow;
                attachment.DeletedBy = request.DeletedBy;
                attachment.StatusId = Status.InActive;

                var result = _repository.Update(attachment);

                return result
                    ? SuccessMessage.Delete.ToSuccessMessage(true)
                    : ErrorsMessage.FailOnDelete.ToErrorMessage(false);
            }
            catch (Exception)
            {
                return ErrorsMessage.FailOnDelete.ToErrorMessage(false);
            }
        }
    }
}
