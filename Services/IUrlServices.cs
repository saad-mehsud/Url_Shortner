using Url_Shortner.Models;
using Url_Shortner.DTOs;
namespace Url_Shortner.Services;

public interface IUrlServices
{
    Task<List<URL>> GetUrls();
    Task<(URL? , int)> GetUrl(int id);
    Task<(URL?,Exception?)> CreateUrl(CreateUrlRequest url);
    Task<(URL?,Exception?)> UpdateUrlAsync(URL url);
    Task<string> DeleteUrlAsync(int id);
    Task<string> Shorten_LongUrls(string longUrl);
    public  Task AddClick(int id);
    Task<URL> GetLongUrlAsync(string shortUrl);
}