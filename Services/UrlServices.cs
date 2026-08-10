using Microsoft.EntityFrameworkCore;
using Url_Shortner.Data;
using Url_Shortner.Models;
using Url_Shortner.DTOs;
namespace Url_Shortner.Services;

public class UrlServices(DbConfig context) : IUrlServices
{
    #region ReadMethods
    public async Task<List<URL>> GetUrls()
    {
        return await context.Urls.Include(url => url.Clicks).ToListAsync();
    }
    
    
    public async Task<(URL? , int)> GetUrl(int id)
    {
        URL? url = await context.Urls.Include(url => url.Clicks).FirstOrDefaultAsync(url => url.Id == id);
        if (url is null)
        {
            return (null,404);
        }
        else
        {
            return (url,200);
        }
    }
    
    public async Task<URL?> GetLongUrlAsync(string shortUrl)
    {
        return await context.Urls.FirstOrDefaultAsync(url => url.ShortUrl != null &&   url.ShortUrl.EndsWith(shortUrl) ) ;
    }


    #endregion ReadMethods    
    
    
    #region WriteMethods
    public async Task<(URL?,Exception?)> CreateUrl(CreateUrlRequest url)
    { 
        try{
        if (string.IsNullOrEmpty(url.Url))
        {
            return (null , new Exception("Url cannot be empty"));
        }
        else if (await CheckIfShortUrl(url.Url))
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
            if (!(await CheckIfUrlExistsAsync(url.Id)))
            {
                return (null , new Exception("URl with this id does not exist."));
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

    
    public async Task<(string,int)> DeleteUrlAsync(int id)
    {
        try
        {
            
                int  row = await context.Urls.Where(url => url.Id == id ).ExecuteDeleteAsync();

                return row > 0 ? ($"Url with id {id} deleted", 203) : ($"Url with id {id} not found", 404);

        }
        catch (Exception e)
        {
            return ($"Error Occured:{e.Message}" , 500 );
        }
    }
    
    public async Task AddClick(int id )
    {
        Click newClick = new()
        {
            UrlId = id,
            DateClicke = DateTime.UtcNow
        };
        context.Clicks.Add(newClick);
        await context.SaveChangesAsync();
        

    }
#endregion WriteMethods


#region BusinessLogic

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

#endregion

  
#region Helpers
    private async  Task<bool> CheckIfUrlExistsAsync(int id )
    {
        var existingUrl = await context.Urls.FirstOrDefaultAsync(u => u.Id == id);
        return  existingUrl is not  null;
    }

    private async  Task<bool> CheckIfShortUrl(string url)
    {
        var result = await GetLongUrlAsync(url);
        return result is  null;
    }
#endregion Helpers
   
}