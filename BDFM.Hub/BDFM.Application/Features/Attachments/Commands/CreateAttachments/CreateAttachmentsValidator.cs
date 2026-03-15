using FluentValidation;
using System.Linq;

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
                .WithMessage("الملف مطلوب")
                .Must(file => file == null || file.Length <= 25 * 1024 * 1024)
                .WithMessage("حجم الملف لا يمكن أن يتجاوز 25 ميجابايت")
                .Must(HaveValidExtension)
                .WithMessage("نوع الملف غير مدعوم. المسموح فقط الصور والوثائق");

            RuleFor(v => v.TableName)
                .NotEmpty()
                .WithMessage("TableName is required");
        }

        private bool HaveValidExtension(Microsoft.AspNetCore.Http.IFormFile file)
        {
            if (file == null) return true; // Handled by NotEmpty
            var extension = System.IO.Path.GetExtension(file.FileName).ToLower();
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".jpg", ".jpeg", ".png", ".gif" };
            return allowedExtensions.Contains(extension);
        }
    }
}
