
namespace Url_Shortner.Models;

public class User
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = "";
    public string PasswordHash { get; set; } ="";
    public string Email {get; set;} ="";
    public string Role { get; set; } = "User";
    public ICollection<URL>? Urls { get; set; } = new List<URL>();
    public string? RefreshToken { get; set; } = "";
    public DateTime TokenExpiration { get; set; } = DateTime.UtcNow.AddDays(7);
}