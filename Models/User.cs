namespace Url_Shortner.Models;

public class User
{
    public int Id { get; set; }
    public string UserName { get; set; } = "";
    public string PasswordHash { get; set; }
    public string Role { get; set; } = "User";
    public ICollection<URL>? Urls { get; set; } = new List<URL>();
}