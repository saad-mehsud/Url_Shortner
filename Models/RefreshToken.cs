using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Url_Shortner.Models;

public enum Status
{
    Active,
    Expired ,
    Revoked
}
[PrimaryKey(nameof(tokenId))]
public class RefreshToken
{
    public int tokenId { get; set; }
    public string token { get; set; } = string.Empty;
    public Status? status { get; set; } 
    public DateTime? expires { get; set; }
    public DateTime? created { get; set; }
    public DateTime? blacklisted { get; set; }
    public int userId { get; set; }

    [ForeignKey(nameof(userId))]
    public User? User { get; set; }

    public int replacedByTokenId { get; set; }

    public static void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RefreshToken>()
            .Property(t => t.status)
            .HasMaxLength(20)
            .HasConversion<string>();

        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.userId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
 
