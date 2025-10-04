using BDFM.Domain.Common;

namespace BDFM.Domain.Entities.Configuration
{
    public class SystemIntegrationSetting : AuditableEntity<Guid>
    {
        public string SystemName { get; set; } = string.Empty; // اسم وصفي للنظام المتكامل (e.g., "CentralArchive", "HRSystem", "DigitalSignatureService")
        public string? Description { get; set; }
        public bool IsEnabled { get; set; } = false; // هل التكامل مفعل؟

        // نوع التكامل (e.g., "REST_API", "SOAP_API", "DatabaseLink", "SharedFolder")
        public string IntegrationType { get; set; } = string.Empty;

        // معلومات التهيئة العامة
        public string? BaseUrl { get; set; } // إذا كان API
        public string? ApiKey { get; set; } // (يفضل تخزينه مشفرًا أو في مكان آمن مثل Azure Key Vault)
        public string? Username { get; set; } // (يفضل تخزينه مشفرًا أو في مكان آمن)
        public string? EncryptedPassword { get; set; } // (مهم: يجب أن يكون مشفرًا دائمًا)
        public string? ConnectionString { get; set; } // إذا كان اتصال قاعدة بيانات (يفضل تخزينه مشفرًا)
        public string? OtherParametersJson { get; set; } // أي معلمات تهيئة إضافية بتنسيق JSON


    }
}
