namespace BDFM.Application.Features.Attachments.Commands.UpdateAttachments
{
    public class UpdateAttachmentsValidator : AbstractValidator<UpdateAttachmentsCommand>
    {
        public UpdateAttachmentsValidator()
        {
            RuleFor(v => v.Id)
                .NotEmpty()
                .WithMessage("Attachment Id is required");

            RuleFor(v => v.PrimaryTableId)
                .NotEmpty()
                .WithMessage("PrimaryTableId is required");

            RuleFor(v => v.TableName)
                .NotEmpty()
                .WithMessage("TableName is required");

            RuleFor(v => v.LastUpdateBy)
                .NotEmpty()
                .WithMessage("LastUpdateBy is required");

            // File is optional for update operations
            When(v => v.File != null, () =>
            {
                RuleFor(v => v.File)
                    .Must(file => file!.Length > 0)
                    .WithMessage("File must not be empty when provided");
            });
        }
    }
}
