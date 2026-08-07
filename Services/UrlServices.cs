using Url_Shortner.Models;
using Url_Shortner.DTOs;
namespace Url_Shortner.Services;

public class UrlServices : IUrlServices
{
    public Task<List<URL>> GetUrls() => throw new NotImplementedException();
    public Task<URL> GetUrl(int id)
    {
        throw new NotImplementedException();
    }

    public async Task<URL> CreateUrl(CreateUrlRequest url)
    {
        if (CheckIfUrlExists(url.Url))
        {
            throw new Exception("Url already exists");
        }
        else
        {
            string shortUrl = await Shorten_LongUrls(url.Url);
            URL newUrl = new()
            {
                LongUrl = url.Url,
                CreatedAt = url.CreatedAt,
                ShortUrl = shortUrl
            };

            return newUrl;
        }
        

    }

    public Task<URL> UpdateUrl(URL url)
    {
        throw new NotImplementedException();
    }

    public Task<string> DeleteUrl(int id)
    {
        throw new NotImplementedException();
    }

    public Task<string> Shorten_LongUrls(string longUrl)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const int urlLength = 10;
        DotNetEnv.Env.Load();
        string shortUrl = $"{Environment.GetEnvironmentVariable("DOMAIN")}/{ string.Create(urlLength, chars, (span,pool) =>
        {
            Random.Shared.GetItems(pool, span);
        })}";
        return Task.FromResult(shortUrl);
    }

    public Task<string> Redirect(string shortUrl)
    {
        throw new NotImplementedException();
    }

    private bool CheckIfUrlExists(string url)
    {
        throw new NotImplementedException();
    }

   
}