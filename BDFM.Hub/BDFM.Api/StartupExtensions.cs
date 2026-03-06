using BDFM.Application.Hubs;
using Microsoft.AspNetCore.RateLimiting;
using System.Text.Json;
using System.Threading.RateLimiting;

namespace BDFM.Api;

public static class StartupExtensions
{

    public static WebApplication ConfigureServices(this WebApplicationBuilder builder)
    {
        AddSwagger(builder.Services);

        builder.Services.AddApplictionService();
        builder.Services.AddInfrastructureServices(builder.Configuration);
        builder.Services.AddPersistenceServices(builder.Configuration);
        builder.Services.AddIdentityServices(builder.Configuration);


        // Add SignalR services
        builder.Services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = builder.Environment.IsDevelopment();
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
        });

        builder.Services.AddScoped<LogActionArguments>();

        builder.Services.AddScoped<ILoggedInUserService, LoggedInUserService>();

        builder.Services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        });

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddLogging();
        builder.Services.AddControllers();
        builder.Services.AddSwaggerGen();

        // Add Rate Limiter
        builder.Services.AddRateLimiter(cfg =>
        {
            cfg.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            cfg.AddFixedWindowLimiter(policyName: "fixed", options =>
            {
                options.PermitLimit = 10;
                options.Window = TimeSpan.FromMinutes(1);

            });

            cfg.AddPolicy("per-user", httpContext =>
            {
                // Check multiple claim types for user ID since MapInboundClaims=false
                var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                             httpContext.User.FindFirstValue("sub") ??
                             httpContext.User.FindFirstValue("uid") ??
                             httpContext.User.FindFirstValue("id");

                if (!string.IsNullOrWhiteSpace(userId))
                {
                    return RateLimitPartition.GetTokenBucketLimiter(userId, _ => new TokenBucketRateLimiterOptions
                    {
                        TokenLimit = 50,
                        TokensPerPeriod = 50,
                        ReplenishmentPeriod = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        //QueueLimit = 5
                    });
                }

                return RateLimitPartition.GetFixedWindowLimiter("anonymous", _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 10,
                    Window = TimeSpan.FromMinutes(1)
                });
            });
        });

        // Register anti-forgery services
        builder.Services.AddAntiforgery();

        // Register CORS policy
        builder.Services.AddCors(option =>
            option.AddPolicy("AllowSpecificOrigin", policy =>
            policy.WithOrigins(
                "http://localhost:3000",
                "http://cm.inss.local:3000",
                "http://cm.inss.local",
                "https://cm.inss.local:3000",
                "https://cm.inss.local",
                "http://10.42.10.26:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
      )
  );

        // Register rate limit filter globally
        builder.Services.AddControllers(options =>
        {
            options.Filters.Add<Helpers.RateLimitFilter>();
        });

        return builder.Build();
    }



    public static WebApplication ConfigurePipeline(this WebApplication app)
    {

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Authentication Management API");
            });
        }
        app.UseHttpsRedirection();

        //app.UseRouting();

        app.UseAuthentication();


        app.UseCustomExceptionHandler();

        app.UseCors("AllowSpecificOrigin");

        app.UseAuthorization();

        // Add anti-forgery middleware
        app.UseAntiforgery();

        // Rate limiting should be after authentication/authorization so we can identify the user
        app.UseRateLimiter();

        app.MapControllers();

        // Map SignalR Hub with correct casing to match frontend
        app.MapHub<CorrespondenceHub>("/correspondenceHub");

        return app;
    }


    private static void AddSwagger(IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = @"JWT Authorization header using the Bearer scheme. \r\n\r\n 
                      Enter 'Bearer' [space] and then your token in the text input below.
                      \r\n\r\nExample: 'Bearer 12345abcdef'",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement()
                  {
                    {
                      new OpenApiSecurityScheme
                      {
                        Reference = new OpenApiReference
                          {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                          },
                          Scheme = "oauth2",
                          Name = "Bearer",
                          In = ParameterLocation.Header,

                        },
                        new List<string>()
                      }
                    });

            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Version = "v1",
                Title = "BDFM Management API",

            });
            c.CustomSchemaIds(type => type.FullName);
            //c.OperationFilter<FileResultContentTypeOperationFilter>();
        });
    }



    //public static async Task ResetDatabaseAsync(this WebApplication app)
    //{
    //    using var scope = app.Services.CreateScope();
    //    try
    //    {
    //        var context = scope.ServiceProvider.GetService<IdentityDbContext>();
    //        if (context != null)
    //        {
    //            await context.Database.EnsureDeletedAsync();
    //            await context.Database.MigrateAsync();
    //        }
    //    }
    //    catch (Exception ex)
    //    {
    //        new Exception(ex.ToString(), ex);
    //        //var logger = scope.ServiceProvider.GetRequiredService<ILogger>();
    //        //logger.LogError(ex, "An error occurred while migrating the database.");
    //    }
    //}



}
