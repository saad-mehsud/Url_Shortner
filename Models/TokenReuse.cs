using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Url_Shortner.Models;
[PrimaryKey(nameof(reuseId))]
public class TokenReuse
{
    public int reuseId { get; set; }
    public int userId { get; set; }
    public int tokenId { get; set; }
    [ForeignKey((nameof(tokenId)))]
    public RefreshToken? token { get; set; }
    public DateTime createdAt { get; set; } = DateTime.UtcNow;
    public string userIp { get; set; } = string.Empty;

    public static void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TokenReuse>()
            .HasOne(tr => tr.token)
            .WithMany(rt => rt.tokenReuse)
            .HasForeignKey(tr => tr.tokenId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}