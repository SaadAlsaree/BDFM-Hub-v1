namespace BDFM.Application.Features.Administration.ExternalEntities.Commands.CreateExternalEntity;

public class CreateExternalEntityCommand : IRequest<Response<bool>>
{
    public string EntityName { get; set; } = string.Empty;
    public string EntityCode { get; set; } = string.Empty;
    public EntityType? EntityType { get; set; }
    public string? ContactInfo { get; set; }
}

public class CreateExternalEntityCommandValidator : AbstractValidator<CreateExternalEntityCommand>
{
    public CreateExternalEntityCommandValidator()
    {
        RuleFor(p => p.EntityName)
            .NotEmpty().WithMessage("اسم الجهة مطلوب")
            .MaximumLength(100).WithMessage("اسم الجهة يجب ألا يتجاوز 100 حرف");

        RuleFor(p => p.EntityCode)
            .NotEmpty().WithMessage("رمز الجهة مطلوب")
            .MaximumLength(50).WithMessage("رمز الجهة يجب ألا يتجاوز 50 حرف");

        RuleFor(p => p.EntityType)
            .NotNull().WithMessage("نوع الجهة مطلوب");
    }
}
