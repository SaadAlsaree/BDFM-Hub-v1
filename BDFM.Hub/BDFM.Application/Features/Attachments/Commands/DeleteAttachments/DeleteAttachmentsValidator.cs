namespace BDFM.Application.Features.Attachments.Commands.DeleteAttachments
{
    public class DeleteAttachmentsValidator : AbstractValidator<DeleteAttachmentsCommand>
    {
        public DeleteAttachmentsValidator()
        {
            RuleFor(v => v.Id)
                .NotEmpty()
                .WithMessage("Attachment Id is required");

            RuleFor(v => v.DeletedBy)
                .NotEmpty()
                .WithMessage("DeletedBy is required");
        }
    }
}
