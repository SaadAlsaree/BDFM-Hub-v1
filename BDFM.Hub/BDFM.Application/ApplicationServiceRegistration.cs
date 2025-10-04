using BDFM.Application.Behaviors;
using BDFM.Application.Contracts.SignalR;
using BDFM.Application.Helper;
using BDFM.Application.Hubs;
using BDFM.Application.Services;
using BDFM.Application.Services.SignalR;
using BDFM.Domain.Entities.Core;
using BDFM.Domain.Entities.Supporting;
using Microsoft.AspNetCore.SignalR;
using System.Reflection;

namespace BDFM.Application
{
    public static class ApplicationServiceRegistration
    {
        public static IServiceCollection AddApplictionService(this IServiceCollection services)
        {
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssemblies(AppDomain.CurrentDomain.GetAssemblies());
                cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
                cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
            });

            // Register FluentValidation
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            // Register Helpers
            services.AddScoped<IFileNumberGenerator, FileNumberGenerator>();
            services.AddScoped<IMailNumberGenerator, MailNumberGenerator>();

            // Register SignalR Services
            services.AddScoped<ICorrespondenceNotificationService, CorrespondenceNotificationService>();
            services.AddScoped<INotificationService, NotificationService>();

            // Register Audit Trail Service
            services.AddScoped<IAuditTrailService, AuditTrailService>();

            // Update the existing CorrespondenceNotificationService registration to include new dependencies
            services.AddScoped<ICorrespondenceNotificationService>(provider =>
            {
                var hubContext = provider.GetRequiredService<IHubContext<CorrespondenceHub>>();
                var logger = provider.GetRequiredService<ILogger<CorrespondenceNotificationService>>();
                var userCorrespondenceRepo = provider.GetRequiredService<IBaseRepository<UserCorrespondenceInteraction>>();
                var userRepo = provider.GetRequiredService<IBaseRepository<User>>();
                var correspondenceRepo = provider.GetRequiredService<IBaseRepository<Correspondence>>();

                return new CorrespondenceNotificationService(hubContext, logger, userCorrespondenceRepo, userRepo, correspondenceRepo);
            });

            return services;
        }
    }
}
