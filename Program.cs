using dotenv.net;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Url_Shortner.Data;
using Url_Shortner.Services;

var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddScoped<IUrlServices,UrlServices>();

builder.Services.AddDbContext<DbConfig>(options =>
{
    DotNetEnv.Env.Load();
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


app.MapControllers();
app.Run();

