using Microsoft.EntityFrameworkCore;
using dotenv.net;
using Url_Shortner.Models;
using DotNetEnv;
namespace Url_Shortner.Data;

public class DbConfig : DbContext
{
    private readonly  IConfiguration _configuration;

    public DbConfig(DbContextOptions<DbConfig> options, IConfiguration configuration) : base(options)
    {
        _configuration = configuration;
    }
    
    
    public DbSet<URL> Urls { get; set; }
    public DbSet<Click> Clicks { get; set; }

}
    
