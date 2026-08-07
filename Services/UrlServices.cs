using Microsoft.EntityFrameworkCore;
using Url_Shortner.Data;
using Url_Shortner.Models;
using Url_Shortner.DTOs;
namespace Url_Shortner.Services;

public class UrlServices(DbConfig context) : IUrlServices
{
    public Task<List<URL>> GetUrls()
    {
        return Task.FromResult(context.Urls.ToList());
    }
    public async Task<(URL? , Exception?)> GetUrl(int id)
    {
        var url = await  context.Urls.FirstOrDefaultAsync(url => url.Id == id);
        return url is null ? (null,new Exception("URL Not Found")) : (url,null);
    }

    public async Task<(URL?,Exception?)> CreateUrl(CreateUrlRequest url)
    {
        try{
        if (string.IsNullOrEmpty(url.Url))
        {
            return (null , new Exception("Url cannot be empty"));
        }
        else if (CheckIfShortUrl(url.Url))
        {
            return (null , new Exception("Cannot shorten a shortened url."));
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
            context.Urls.Add(newUrl);
            context.SaveChanges();
            return (newUrl, null);
        }
        }
        catch(Exception e)
        {
            return (null, e);
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

    private async  Task<bool> CheckIfUrlShortExistsAsync(string url)
    {
        var existingUrl = await context.Urls.FirstOrDefaultAsync(u => u.LongUrl == url);
        return  existingUrl is not  null;
    }

    private bool CheckIfShortUrl(string url)
    {
        return url.StartsWith(Environment.GetEnvironmentVariable("DOMAIN"));
    }

   
}