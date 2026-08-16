using System.ComponentModel.DataAnnotations;

namespace Url_Shortner.DTOs;

public class RefreshRequest
{
    [Required]
    public required string RefreshToken { get; set; }
    [Required]
    public required int UserId { get; set; }
}