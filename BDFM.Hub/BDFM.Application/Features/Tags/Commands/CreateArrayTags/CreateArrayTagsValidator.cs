namespace BDFM.Application.Features.Tags.Commands.CreateArrayTags;

public class CreateArrayTagsValidator : AbstractValidator<CreateArrayTagsCommand>
{
    public CreateArrayTagsValidator()
    {
        RuleFor(p => p.CorrespondenceId)
            .NotEmpty().WithMessage("{PropertyName} is required.");


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

    }
}
