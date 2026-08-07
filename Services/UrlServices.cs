using System.Runtime.InteropServices.JavaScript;
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
    
    public async Task<URL?> GetUrlByIdAsync(int id)
    {
        return await context.Urls.FirstOrDefaultAsync(url => url.Id == id);
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
            await context.SaveChangesAsync();
            return (newUrl, null);
        }
        }
        catch(Exception e)
        {
            return (null, e);
        }
        

    }

    
    
    public async Task<(URL?,Exception?)> UpdateUrlAsync(URL url)
    {
        try{
            if (url is null)
            {
                return (null , new Exception("Url cannot be empty"));
            }
            else if (await CheckIfUrlExistsAsync(url.Id))
            {
                return (null , new Exception("Cannot shorten a shortened url."));
            }
            else
            {
               URL newUrl = new()
                {
                    Id = url.Id,
                    LongUrl = url.LongUrl,
                    CreatedAt = url.CreatedAt,
                    ShortUrl = url.ShortUrl
                };
                context.Urls.Update(newUrl);
                await context.SaveChangesAsync();
                return (newUrl, null);
            }
        }
        catch(Exception e)
        {
            return (null, e);
        }
    }

    
    public async Task<string> DeleteUrlAsync(int id)
    {
        try
        {
            if (await CheckIfUrlExistsAsync(id))
            {
                var url = await context.Urls.FirstOrDefaultAsync(url => url.Id == id);
                context.Urls.Remove(url);
                await context.SaveChangesAsync();
                return $"Url with id {id} deleted";
            }
            else
            {
                return "Url with this id does not exist";
            }
        }
        catch (Exception e)
        {
            return $"Error Occured:{e.Message}";
        }
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



    public async Task<string> GetShortUrlAsync(string shortUrl)
    {
        var url = await context.Urls.FirstOrDefaultAsync(url => url.ShortUrl == shortUrl);
        return url?.LongUrl ?? "Url not found";
    }

    private async  Task<bool> CheckIfUrlExistsAsync(int id )
    {
        var existingUrl = await context.Urls.FirstOrDefaultAsync(u => u.Id == id);
        return  existingUrl is not  null;
    }

    private bool CheckIfShortUrl(string url)
    {
        return url.StartsWith(Environment.GetEnvironmentVariable("DOMAIN"));
    }

   
}