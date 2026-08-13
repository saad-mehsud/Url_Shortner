using System.Text;
using System.Text.Json;
using dotenv.net;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Scalar.AspNetCore;
using Url_Shortner.Data;
using Url_Shortner.Services;
using Url_Shortner.Utils;

var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
DotNetEnv.Env.Load();
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddScoped<IUrlServices,UrlServices>();
builder.Services.AddScoped<IClickServices,ClickServices>();
builder.Services.AddHealthChecks()
    .AddCheck<HealthCheck>("healthcheck")
    .AddNpgSql(Environment.GetEnvironmentVariable("DATABASE_URI"));
builder.Services.AddDbContext<DbConfig>(options =>
{
    
    options.UseNpgsql(Environment.GetEnvironmentVariable("DATABASE_URI"));
    Console.WriteLine("Connection Established ");
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
    ResponseWriter = WriteResponse
});

app.MapControllers();
app.Run();


 static Task WriteResponse(HttpContext context, HealthReport healthReport)
{
    context.Response.ContentType = "application/json; charset=utf-8";

    var options = new JsonWriterOptions { Indented = true };

    using var memoryStream = new MemoryStream();
    using (var jsonWriter = new Utf8JsonWriter(memoryStream, options))
    {
        jsonWriter.WriteStartObject();
        jsonWriter.WriteString("status", healthReport.Status.ToString());
        jsonWriter.WriteStartObject("results");

        foreach (var healthReportEntry in healthReport.Entries)
        {
            jsonWriter.WriteStartObject(healthReportEntry.Key);
            jsonWriter.WriteString("status",
                healthReportEntry.Value.Status.ToString());
            jsonWriter.WriteString("description",
                healthReportEntry.Value.Description);
            jsonWriter.WriteStartObject("data");

            foreach (var item in healthReportEntry.Value.Data)
            {
                jsonWriter.WritePropertyName(item.Key);

                JsonSerializer.Serialize(jsonWriter, item.Value,
                    item.Value?.GetType() ?? typeof(object));
            }

            jsonWriter.WriteEndObject();
            jsonWriter.WriteEndObject();
        }

        jsonWriter.WriteEndObject();
        jsonWriter.WriteEndObject();
    }

    return context.Response.WriteAsync(
        Encoding.UTF8.GetString(memoryStream.ToArray()));
}

