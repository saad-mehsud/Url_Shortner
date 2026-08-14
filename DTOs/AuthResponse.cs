namespace Url_Shortner.DTOs;

public class AuthResponse
{
    public int StatusCode { get; set; }
    public string? Token { get; set; } = string.Empty;
    public string? RefreshToken { get; set; } = string.Empty;
    public string? Message { get; set; }
}