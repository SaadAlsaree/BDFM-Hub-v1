namespace BDFM.Application.Features.Tags.Commands.CreateArrayTags;

public class CreateArrayTagsValidator : AbstractValidator<CreateArrayTagsCommand>
{
    public CreateArrayTagsValidator()
    {
        RuleFor(p => p.CorrespondenceId)
            .NotEmpty().WithMessage("{PropertyName} is required.");

        RuleFor(p => p.Data)
            .NotEmpty().WithMessage("{PropertyName} is required.")
            .Must(data => data != null && data.Count > 0).WithMessage("{PropertyName} must contain at least one item.");

        RuleForEach(p => p.Data)
            .SetValidator(new DataTDOValidator());
    }
}

public class DataTDOValidator : AbstractValidator<DataTDO>
{
    public DataTDOValidator()
    {
        RuleFor(p => p.Name)
            .MaximumLength(255).WithMessage("{PropertyName} must not exceed 255 characters.");

        RuleFor(p => p.ToPrimaryRecipientId)
            .NotEmpty().WithMessage("{PropertyName} is required.");

        RuleFor(p => p.ToPrimaryRecipientType)
            .IsInEnum().WithMessage("{PropertyName} is invalid.");
    }
}
