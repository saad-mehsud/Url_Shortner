using Url_Shortner.Models;
using Url_Shortner.DTOs;
namespace Url_Shortner.Services;

public interface IUrlServices
{
    Task<List<URL>> GetUrls();
    Task<(URL? , int)> GetUrl(string email);
    Task<(URL?,Exception?)> CreateUrl(CreateUrlRequest url);
    Task<(URL?,Exception?)> UpdateUrlAsync(URL url);
    Task<(string,int)> DeleteUrlAsync(int id);
    Task<string> Shorten_LongUrls(string longUrl);
    public  Task AddClick(int id);
    Task<URL?> GetLongUrlAsync(string shortUrl);
}