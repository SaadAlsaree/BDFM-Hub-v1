using BDFM.Application.Features.Attachments.Commands.CreateAttachments;
using FluentValidation;
using Microsoft.AspNetCore.Http;

namespace BDFM.Application.Features.Attachments.Commands.CreateAttachments.Validators
{
    public class CreateAttachmentsCommandValidator : AbstractValidator<CreateAttachmentsCommand>
    {
        private static readonly string[] SuspiciousFileExtensions = 
        {
            ".exe", ".bat", ".cmd", ".com", ".sh", ".vbs", ".js", ".jar",
            ".ps1", ".psm1", ".ps1xml", ".psc1", ".psc1xml", ".psc2", ".psc2xml",
            ".msh", ".msh1", ".msh2", ".mshxml", ".msh1xml", ".msh2xml",
            ".scf", ".reg", ".inf", ".url", ".lnk", ".pif"
        };

        private static readonly string[] SuspiciousFileNames = 
        {
            "con", "prn", "aux", "nul",
            "com1", "com2", "com3", "com4", "com5", "com6", "com7", "com8", "com9",
            "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9",
            ".git", ".svn", ".env", "config.php", "database.sql", "backup.zip",
            "web.config", "appsettings.json", ".htaccess", ".htpasswd"
        };

        private static readonly string[] ValidFileExtensions = 
        {
            ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".doc", ".docx",
            ".xls", ".xlsx", ".txt", ".zip", ".rar", ".7z", ".csv"
        };

        public CreateAttachmentsCommandValidator()
        {
            RuleFor(x => x.File)
                .NotNull()
                .WithMessage("File is required");

            RuleFor(x => x.File)
                .Must(file => file != null && file.Length > 0)
                .WithMessage("File cannot be empty");

            RuleFor(x => x.File)
                .Must(file => file.Length <= 25 * 1024 * 1024)
                .WithMessage("File size cannot exceed 25MB");

            RuleFor(x => x.File)
                .Must(HaveValidExtension)
                .WithMessage("Invalid file type. Allowed types: " + string.Join(", ", ValidFileExtensions));

            RuleFor(x => x.File)
                .Must(HaveSafeFileName)
                .WithMessage("File name contains invalid characters");

            RuleFor(x => x.PrimaryTableId)
                .NotEmpty()
                .WithMessage("Primary table ID is required");
        }

        private static bool HaveValidExtension(IFormFile file)
        {
            if (file == null || file.FileName == null)
                return false;

            var extension = System.IO.Path.GetExtension(file.FileName).ToLower();
            return ValidFileExtensions.Contains(extension);
        }

        private static bool HaveSafeFileName(IFormFile file)
        {
            if (file == null || file.FileName == null)
                return false;

            var fileName = System.IO.Path.GetFileNameWithoutExtension(file.FileName).ToLower();

            if (Array.Exists(SuspiciousFileNames, s => s.Equals(fileName, StringComparison.OrdinalIgnoreCase)))
                return false;

            if (fileName.Contains("..") || fileName.Contains("/") || fileName.Contains("\\"))
                return false;

            if (fileName.Contains("<") || fileName.Contains(">") || fileName.Contains(":"))
                return false;

            return true;
        }
    }
}
