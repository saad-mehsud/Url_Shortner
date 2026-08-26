using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Url_Shortner.Models;

public class URL
{
    public int Id { get; set; } = 0;
    public string? LongUrl { get; set; } 
    public string? ShortUrl { get; set; } 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Click>? Clicks { get; set; } = new List<Click>();
    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User? user {get; set;}
    public static void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<URL>()
        .HasOne(url => url.user)
        .WithMany(user => user.Urls)
        .HasForeignKey(url => url.UserId)
        .OnDelete(DeleteBehavior.Cascade);
    }
}