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
DotNetEnv.Env.Load();
builder.Services.AddDbContext<DbConfig>(options =>
{
    options.UseNpgsql(Environment.GetEnvironmentVariable("DATABASE_URI"));
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

