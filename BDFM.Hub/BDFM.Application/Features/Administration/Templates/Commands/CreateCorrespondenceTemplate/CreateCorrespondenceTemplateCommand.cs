namespace BDFM.Application.Features.Administration.Templates.Commands.CreateCorrespondenceTemplate;

public class CreateCorrespondenceTemplateCommand : IRequest<Response<bool>>
{
    public string TemplateName { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty; // Text type in DB
    public string? BodyText { get; set; } // LongText type in DB
    public Guid? OrganizationalUnitId { get; set; }
    public Guid? CreateBy { get; set; } // Set in handler based on current user context

}

public class CreateCorrespondenceTemplateCommandValidator : AbstractValidator<CreateCorrespondenceTemplateCommand>
{
    public CreateCorrespondenceTemplateCommandValidator()
    {
        RuleFor(p => p.TemplateName)
            .NotEmpty().WithMessage("name is required")
            .MaximumLength(255).WithMessage("name must not exceed 255 characters");

        RuleFor(p => p.Subject)
            .NotEmpty().WithMessage("subject is required");

    }
}
