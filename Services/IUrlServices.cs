using Url_Shortner.Models;
using Url_Shortner.DTOs;
namespace Url_Shortner.Services;

public interface IUrlServices
{
    Task<List<URL>> GetUrls();
    Task<URL> GetUrl(int id);
    Task<URL> CreateUrl(CreateUrlRequest url);
    Task<URL> UpdateUrl(URL url);
    Task<string> DeleteUrl(int id);
    Task<string> Shorten_LongUrls(string longUrl);
    Task<string> Redirect(string shortUrl);
}