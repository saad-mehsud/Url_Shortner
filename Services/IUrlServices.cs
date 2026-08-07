using Url_Shortner.Models;
using Url_Shortner.DTOs;
namespace Url_Shortner.Services;

public interface IUrlServices
{
    Task<List<URL>> GetUrls();
    Task<URL?> GetUrlByIdAsync(int id);
    Task<(URL? , Exception?)> GetUrl(int id);
    Task<(URL?,Exception?)> CreateUrl(CreateUrlRequest url);
    Task<(URL?,Exception?)> UpdateUrlAsync(URL url);
    Task<string> DeleteUrlAsync(int id);
    Task<string> Shorten_LongUrls(string longUrl);
    Task<string> Redirect(string shortUrl);
}