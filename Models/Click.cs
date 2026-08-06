namespace Url_Shortner.Models;

public class Click
{
     public int ClickId{get;set;}
     public int UrlId{get;set;}
     public URL Url { get; set; } = default!;
     public DateTime DateClicke { get; set; } = DateTime.UtcNow;
     public string? referrer { get; set; }
     public string? ipAddress { get; set; }
     public ICollection<Click> Clicks { get; set; } = new List<Click>();
}    