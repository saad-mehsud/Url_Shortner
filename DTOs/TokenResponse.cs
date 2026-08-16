using System.ComponentModel.DataAnnotations;

namespace Url_Shortner.DTOs;

public class TokenResponse
{
    [Required]
    public required string AccessToken { get; set; }
    [Required]
    public required string RefreshToken { get; set; }
}