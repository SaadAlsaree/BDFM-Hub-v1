using BDFM.Application.Hubs;
using System.Text.Json;

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

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("Open", builder => builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
            options.AddPolicy("AllowSpecificOrigin", builder =>
                builder.WithOrigins("http://cm.inss.local:3000", "http://localhost:3000", "http://192.168.25.34:3000", "http://cm.inss.local", "http://192.168.25.207:3000")
                       .AllowAnyHeader()
                       .AllowAnyMethod()
                       .AllowCredentials());
        });

        return builder.Build();
    }



    public static WebApplication ConfigurePipeline(this WebApplication app)
    {

        if (app.Environment.IsDevelopment() | app.Environment.IsProduction())
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
