using Url_Shortner.Models;
using Url_Shortner.DTOs;

namespace Url_Shortner.Services;

public interface IUrlServices
{
    Task<List<URL>> GetUrls();
    Task<URL> GetUrl(string email);
    Task<URL> CreateUrl(CreateUrlRequest url);
    Task<URL> UpdateUrlAsync(URL url);
    Task DeleteUrlAsync(int id);
    Task<string> Shorten_LongUrls(string longUrl);
    Task AddClick(int id);
    Task<URL?> GetLongUrlAsync(string shortUrl);
}
