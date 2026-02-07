using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts;
using BDFM.Persistence.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Debug;

namespace BDFM.Persistence
{
    public static class PersistenceServiceRegistration
    {
        public static readonly LoggerFactory MyLoggerFactory =
      new(new[]
      {
                new DebugLoggerProvider()
      });
        public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("BDFMDb");
            services.AddDbContext<BDFMDbContext>(options =>
                options.UseNpgsql(connectionString));

            services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
            services.AddScoped(typeof(IExtensionRepository<>), typeof(ExtensionRepository<>));
            services.AddMemoryCache();
            services.AddScoped(typeof(IRedisCacheLayer), typeof(RedisCacheLayer));

            // Add permission validation service
            services.AddScoped<IPermissionValidationService, PermissionValidationService>();

            services.AddScoped(typeof(IStorageService), typeof(StorageService));

            services.Configure<RedisCacheConnectionString>(configuration.GetSection("RedisCacheConnectionString"));

            return services;
        }
    }
}
