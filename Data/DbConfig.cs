using Microsoft.EntityFrameworkCore;
using dotenv.net;
using Url_Shortner.Models;
using DotNetEnv;
namespace Url_Shortner.Data;

public class DbConfig : DbContext
{
    private readonly  IConfiguration _configuration;

    public DbConfig(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    public DbSet<URL> Urls { get; set; }
    public DbSet<Click> Clicks { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        try
        {
            if (!optionsBuilder.IsConfigured)
            {
                // 1. Explicitly load the .env file from your project directory
                DotNetEnv.Env.Load();

                // 2. Fetch the variable from the environment
                var connectionString = Environment.GetEnvironmentVariable("DATABASE_URI");
                if (string.IsNullOrEmpty(connectionString))
                {
                    throw new InvalidOperationException("Could not find DATABASE_CONNECTION_STRING in the environment variables!");
                }
                // 3. Pass it to Npgsql
                optionsBuilder.UseNpgsql(connectionString);
            Console.WriteLine($"Connection String:{_configuration["DATABASE_URI"]}");
            Console.WriteLine("Conection Succeeded");
            }
            // optionsBuilder.UseNpgsql(_configuration["DATABASE_URI"]);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
        }
}
    
}