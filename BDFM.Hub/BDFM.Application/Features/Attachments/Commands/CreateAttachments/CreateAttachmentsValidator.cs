using FluentValidation;

namespace BDFM.Application.Features.Attachments.Commands.CreateAttachments;

public class CreateAttachmentsValidator : AbstractValidator<CreateAttachmentsCommand>
{
    public CreateAttachmentsValidator()
    {
        RuleFor(x => x.PrimaryTableId).NotEmpty();
        RuleFor(x => x.File).NotEmpty()
            .Must(x => x.Length <= 25 * 1024 * 1024)
            .WithMessage("حجم الملف لا يمكن أن يتجاوز 25 ميجابايت");

        RuleFor(x => x.File)
            .Must(HaveValidExtension)
            .WithMessage("نوع الملف غير مدعوم. المسموح فقط الصور والوثائق");

        RuleFor(x => x.TableName).NotEmpty();
    }

    private bool HaveValidExtension(Microsoft.AspNetCore.Http.IFormFile file)
    {
        if (file == null) return false;
        var extension = System.IO.Path.GetExtension(file.FileName).ToLower();
        var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".jpg", ".jpeg", ".png", ".gif" };
        return allowedExtensions.Contains(extension);
    }
}
