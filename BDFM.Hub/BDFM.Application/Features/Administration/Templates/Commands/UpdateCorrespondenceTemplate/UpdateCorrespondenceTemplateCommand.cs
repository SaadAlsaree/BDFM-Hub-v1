namespace BDFM.Application.Features.Administration.Templates.Commands.UpdateCorrespondenceTemplate;

public class UpdateCorrespondenceTemplateCommand : IRequest<Response<bool>>
{
    public Guid Id { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty; // Text type in DB
    public string? BodyText { get; set; } // LongText type in DB
}

public class UpdateCorrespondenceTemplateCommandValidator : AbstractValidator<UpdateCorrespondenceTemplateCommand>
{
    public UpdateCorrespondenceTemplateCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("معرف القالب مطلوب");

        RuleFor(p => p.TemplateName)
            .NotEmpty().WithMessage("اسم نموذج مطلوب")
            .MaximumLength(255).WithMessage("اسم نموذج يجب ألا يتجاوز 255 حرف");

        RuleFor(p => p.Subject)
            .NotEmpty().WithMessage("موضوع الكتاب مطلوب");

        RuleFor(p => p.BodyText)
            .NotNull().WithMessage("مظمون الكتاب مطلوب");
    }
}
