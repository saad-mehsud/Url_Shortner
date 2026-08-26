using System.ComponentModel.DataAnnotations.Schema;

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
}