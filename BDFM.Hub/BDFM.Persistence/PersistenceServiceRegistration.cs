using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts;
using BDFM.Application.Contracts.AI;
using BDFM.Application.Models.AI;
using BDFM.Persistence.Security;
using BDFM.Persistence.Services;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Debug;
using MongoDB.Driver;
using OllamaSharp;

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


            // Configure MongoDB
            services.AddSingleton<IMongoClient>(_ =>
                new MongoClient(configuration.GetConnectionString("MongoDb")));

            // Configure Ollama
            services.AddSingleton<OllamaApiClient>(provider =>
            {
                var ollamaUrl = configuration.GetSection("Ollama")["Url"];
                if (string.IsNullOrEmpty(ollamaUrl))
                {
                    throw new InvalidOperationException("Ollama URL is not configured in appsettings.json");
                }
                var ollamaClient = new OllamaApiClient(ollamaUrl);
                ollamaClient.SelectedModel = "deepseek-r1:8b";
                return ollamaClient;
            });

            // Register OllamaApiClient as IEmbeddingGenerator and IChatClient
            services.AddSingleton<IEmbeddingGenerator<string, Embedding<float>>>(provider => provider.GetRequiredService<OllamaApiClient>());
            services.AddSingleton<IChatClient>(provider => provider.GetRequiredService<OllamaApiClient>());

            // Configure Ollama settings
            services.Configure<OllamaSetting>(configuration.GetSection("Ollama"));



            services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
            services.AddScoped(typeof(IExtensionRepository<>), typeof(ExtensionRepository<>));
            services.AddMemoryCache();
            services.AddScoped(typeof(IRedisCacheLayer), typeof(RedisCacheLayer));

            services.AddScoped<ICorrespondenceService, CorrespondenceService>();
            services.AddScoped<IEmbeddingService, EmbeddingService>();
            services.AddScoped<IVectorService, VectorService>();
            services.AddScoped<IRAGService, RAGService>();
            // Add permission validation service
            services.AddScoped<IPermissionValidationService, PermissionValidationService>();

            services.AddScoped(typeof(IStorageService), typeof(StorageService));

            services.Configure<RedisCacheConnectionString>(configuration.GetSection("RedisCacheConnectionString"));

            return services;
        }
    }
}
