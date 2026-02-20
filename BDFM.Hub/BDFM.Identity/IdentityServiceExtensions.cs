using BDFM.Application.Contract.Identity;
using BDFM.Application.Contracts.Identity;
using BDFM.Application.Models.Authentication;
using BDFM.Identity.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;

namespace BDFM.Identity
{
    public static class IdentityServiceExtensions
    {
        public static void AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));

            // Register authentication services
            services.AddTransient<IAuthenticationService, AuthenticationService>();

            // Register current user service
            // Add HttpContextAccessor if not already registered
            services.AddHttpContextAccessor();

            // Register the CurrentUserService
            services.AddScoped<ICurrentUserService, CurrentUserService>();

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(o =>
                {
                    o.RequireHttpsMetadata = false;
                    o.SaveToken = false;

                    // Map JSON array claims to multiple claims
                    o.MapInboundClaims = false; // Disable default claim mapping

                    o.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero,
                        ValidIssuer = configuration["JwtSettings:Issuer"],
                        ValidAudience = configuration["JwtSettings:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JwtSettings:Key"]!)),
                        // Keep claim names as they are in the token
                        NameClaimType = "name",
                        RoleClaimType = "role"
                    };

                    o.Events = new JwtBearerEvents()
                    {
                        OnAuthenticationFailed = c =>
                        {
                            c.NoResult();
                            c.Response.StatusCode = 500;
                            c.Response.ContentType = "text/plain";
                            return c.Response.WriteAsync(c.Exception.ToString());
                        },
                        OnChallenge = context =>
                        {
                            context.HandleResponse();
                            context.Response.StatusCode = 401;
                            context.Response.ContentType = "application/json";
                            var result = JsonSerializer.Serialize("401 Not authorized");
                            return context.Response.WriteAsync(result);
                        },
                        OnForbidden = context =>
                        {
                            context.Response.StatusCode = 403;
                            context.Response.ContentType = "application/json";
                            var result = JsonSerializer.Serialize("403 Not authorized");
                            return context.Response.WriteAsync(result);
                        }
                    };
                });
            services.AddAuthorization(cfg =>
                {
                    cfg.AddPolicy("SuAdmin", policy => policy.RequireClaim("role", "SuAdmin"));
                    cfg.AddPolicy("Correspondence", policy => policy.RequireClaim("role", "Correspondence"));
                    cfg.AddPolicy("Admin", policy => policy.RequireClaim("role", "Admin"));
                    cfg.AddPolicy("Tracking", policy => policy.RequireClaim("role", "Tracking"));
                    cfg.AddPolicy("FileManagement", policy => policy.RequireClaim("role", "FileManagement"));
                    cfg.AddPolicy("Settings", policy => policy.RequireClaim("role", "Settings"));
                    cfg.AddPolicy("Reports", policy => policy.RequireClaim("role", "Reports"));
                    cfg.AddPolicy("Security", policy => policy.RequireClaim("role", "Security"));
                    cfg.AddPolicy("Reports", policy => policy.RequireClaim("role", "Reports"));
                    cfg.AddPolicy("Support", policy => policy.RequireClaim("role", "Support"));
                    cfg.AddPolicy("User", policy => policy.RequireClaim("role", "User"));
                    cfg.AddPolicy("Manager", policy => policy.RequireClaim("role", "Manager"));
                    cfg.AddPolicy("President", policy => policy.RequireClaim("role", "President"));
                    cfg.AddPolicy("Orders", policy => policy.RequireClaim("role", "Orders"));
                    cfg.AddPolicy("Vacation", policy => policy.RequireClaim("role", "Vacation"));
                    // Added Auth policy for generic authenticated access
                    cfg.AddPolicy("Auth", policy => policy.RequireAuthenticatedUser());
                }
                );
        }
    }
}
