namespace Url_Shortner.Models;

public class URL
{
    public int Id { get; set; } = 0;
    public string? LongUrl { get; set; } 
    public string? ShortUrl { get; set; } 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}