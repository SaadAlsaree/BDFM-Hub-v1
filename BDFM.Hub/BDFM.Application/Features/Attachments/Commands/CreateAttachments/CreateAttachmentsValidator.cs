namespace BDFM.Application.Features.Attachments.Commands.CreateAttachments
{
    public class CreateAttachmentsValidator : AbstractValidator<CreateAttachmentsCommand>
    {
        public CreateAttachmentsValidator()
        {
            RuleFor(v => v.PrimaryTableId)
                .NotEmpty()
                .WithMessage("PrimaryTableId is required");
            RuleFor(v => v.File)
                .NotEmpty()
                .WithMessage("File is required");
            RuleFor(v => v.TableName)
                .NotEmpty()
                .WithMessage("TableName is required");

        }
    }
}
