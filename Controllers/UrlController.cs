using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Url_Shortner.DTOs;
using Url_Shortner.Exceptions;
using Url_Shortner.Models;
using Url_Shortner.Services;

namespace Url_Shortner.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UrlController(IUrlServices service) : Controller
{
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<List<URL>>> GetAllUrls()
        => await service.GetUrls();

    [Authorize]
    [HttpGet("myUrls")]
    public async Task<ActionResult<URL>> GetUrlByIdAsync()
    {
        int id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var url = await service.GetUrl(id);
        return Ok(url);
    }

    [HttpPut]
    public async Task<ActionResult<URL>> UpdateUrl(URL url)
    {
        var updatedUrl = await service.UpdateUrlAsync(url);
        return Ok(updatedUrl);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<URL>> CreateUrl(CreateUrlRequest urlRequest)
    {
        urlRequest.UserId = Int32.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var shortenUrl = await service.CreateUrl(urlRequest);
        return Ok(shortenUrl);
    }

    [HttpDelete("/:{id}")]
    public async Task<ActionResult> DeleteUrl(int id)
    {
        await service.DeleteUrlAsync(id);
        return NoContent();
    }

    [HttpGet("/{shortUrl}")]
    public async Task<ActionResult> GetShortUrl(string shortUrl)
    {
        URL? longUrl = await service.GetLongUrlAsync(shortUrl);
        if (longUrl is null)
        {
            throw new NotFoundException("Url", shortUrl);
        }

        await service.AddClick(longUrl.Id);
        return Redirect(longUrl.LongUrl!);
    }
}
