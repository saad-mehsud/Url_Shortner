using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Url_Shortner.Data;
using Url_Shortner.Services;
using Url_Shortner.Utils;

DotNetEnv.Env.Load();


var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddScoped<IUrlServices,UrlServices>();
builder.Services.AddScoped<IClickServices,ClickServices>();
builder.Services.AddScoped<IUserServices,UserServices>();
builder.Services.AddScoped<IAuthServices,AuthServices>();
builder.Services.AddHealthChecks()
    .AddCheck<HealthCheck>("healthcheck")
    .AddNpgSql(Environment.GetEnvironmentVariable("DATABASE_URI")!);
builder.Services.AddDbContext<DbConfig>(options =>
{
    options.UseNpgsql(Environment.GetEnvironmentVariable("DATABASE_URI"));
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = Environment.GetEnvironmentVariable("ISSUER"),
            ValidateAudience = true,
            ValidAudience = Environment.GetEnvironmentVariable("AUDIENCE"),
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET_KEY")!))
        };
    });
builder.Configuration.AddEnvironmentVariables();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.MapHealthChecks("/health", new HealthCheckOptions()
{
    ResponseWriter =  HealthCheck.WriteResponse
});
app.UseAuthorization();
app.MapControllers();
app.Run();


