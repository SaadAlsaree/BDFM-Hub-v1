namespace BDFM.Application.Features.Users.Commands.InportFromCsv;

public class ImportFromCsvCommandValidator : AbstractValidator<ImportFromCsvCommand>
{
    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    public ImportFromCsvCommandValidator()
    {
        RuleFor(p => p.File)
            .NotNull().WithMessage("ملف CSV مطلوب")
            .Must(file => file != null && file.Length > 0).WithMessage("الملف فارغ")
            .Must(file => file != null && file.Length <= MaxFileSizeBytes).WithMessage("حجم الملف يجب أن لا يتجاوز 5 ميغابايت")
            .Must(file => file != null && Path.GetExtension(file.FileName).Equals(".csv", StringComparison.OrdinalIgnoreCase))
            .WithMessage("يجب أن يكون الملف بامتداد .csv");
    }
}
