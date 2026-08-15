using Microsoft.EntityFrameworkCore;
using Url_Shortner.Data;
using Url_Shortner.DTOs;
using Url_Shortner.Exceptions;
using Url_Shortner.Models;

namespace Url_Shortner.Services;

public class UrlServices(DbConfig context) : IUrlServices
{
    #region ReadMethods
    public async Task<List<URL>> GetUrls()
    {
        return await context.Urls.Include(url => url.Clicks).ToListAsync();
    }

    public async Task<URL> GetUrl(int id)
    {
        URL? url = await context.Urls.Include(url => url.Clicks).FirstOrDefaultAsync(url => url.UserId == id);
        if (url is null)
        {
            throw new NotFoundException("Url", id);
        }

        return url;
    }

    public async Task<URL?> GetLongUrlAsync(string shortUrl)
    {
        return await context.Urls.FirstOrDefaultAsync(url => url.ShortUrl != null && url.ShortUrl.EndsWith(shortUrl));
    }

    #endregion ReadMethods

    #region WriteMethods
    public async Task<URL> CreateUrl(CreateUrlRequest url)
    {
        if (!(await CheckIfShortUrl(url.Url)))
        {
            throw new BadRequestException("Cannot shorten a shortened url.");
        }

        string shortUrl = await Shorten_LongUrls(url.Url);
        URL newUrl = new()
        {
            LongUrl = url.Url,
            CreatedAt = url.CreatedAt,
            ShortUrl = shortUrl,
            UserId = url.UserId
        };
        context.Urls.Add(newUrl);
        await context.SaveChangesAsync();
        return newUrl;
    }

    public async Task<URL> UpdateUrlAsync(URL url)
    {
        if (!await CheckIfUrlExistsAsync(url.Id))
        {
            throw new NotFoundException("Url", url.Id);
        }

        URL newUrl = new()
        {
            Id = url.Id,
            LongUrl = url.LongUrl,
            CreatedAt = url.CreatedAt,
            ShortUrl = url.ShortUrl
        };
        context.Urls.Update(newUrl);
        await context.SaveChangesAsync();
        return newUrl;
    }

    public async Task DeleteUrlAsync(int id)
    {
        int row = await context.Urls.Where(url => url.Id == id).ExecuteDeleteAsync();
        if (row == 0)
        {
            throw new NotFoundException("Url", id);
        }
    }

    public async Task AddClick(int id)
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
        string shortUrl = $"{Environment.GetEnvironmentVariable("DOMAIN")}/{string.Create(urlLength, chars, (span, pool) =>
        {
            Random.Shared.GetItems(pool, span);
        })}";

        return Task.FromResult(shortUrl);
    }

    #endregion

    #region Helpers
    private async Task<bool> CheckIfUrlExistsAsync(int id)
    {
        var existingUrl = await context.Urls.FirstOrDefaultAsync(u => u.Id == id);
        return existingUrl is not null;
    }

    private async Task<bool> CheckIfShortUrl(string url)
    {
        var result = await GetLongUrlAsync(url);
        return result is null;
    }
    #endregion Helpers
}
