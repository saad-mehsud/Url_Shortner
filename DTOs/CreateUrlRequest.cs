using System.ComponentModel.DataAnnotations;

namespace Url_Shortner.DTOs;

public class CreateUrlRequest
{
    [Required]
    public required string Url { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
