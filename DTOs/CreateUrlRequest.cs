namespace Url_Shortner.DTOs;

public class CreateUrlRequest
{
    public  string? Url { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}