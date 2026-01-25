using BDFM.Application.Contracts.Infrastructure;
using BDFM.Application.Models.Mail;
using BDFM.Infrastructure.FileExport;
using BDFM.Infrastructure.Mail;
using BDFM.Infrastructure.Reports;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BDFM.Infrastructure
{
    public static class InfrastructureServiceRegistration
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));

            services.AddTransient<ICsvExporter, CsvExporter>();
            services.AddTransient<IEmailService, EmailService>();
            services.AddTransient<IPdfService, QuestPdfService>();

            return services;
        }
    }
}
