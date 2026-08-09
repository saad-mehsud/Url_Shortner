using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Mvc;
using Url_Shortner.Models;
using Url_Shortner.Services;
using Url_Shortner.DTOs;

namespace Url_Shortner.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UrlController(IUrlServices service) : Controller
    {
        [HttpGet]
        public async Task<ActionResult<List<URL>>> GetAllUrls()
            => await service.GetUrls();

        [HttpGet("{id}")]
        public async Task<ActionResult<URL>> GetUrlByIdAsync(int id)
        {   
            var url =  await service.GetUrl(id);
            if (url.Item1 is null)
            {
                return StatusCode(url.Item2, "Url not found");
            }

            return StatusCode(url.Item2, url.Item1);

        }
        [HttpPut]
        public async Task<ActionResult<URL>> UpdateUrl(URL url)
        {
            var updatedUrl = await service.UpdateUrlAsync(url);
            if (url is null)
            {
                return BadRequest("Url cannot be empty.");
            }
            else if (updatedUrl.Item2 is not null)
            {
                return BadRequest(updatedUrl.Item2.Message);
            }
            else
            {
                return Ok(updatedUrl.Item1);
            }
        }

        [HttpPost]
        public async Task<ActionResult<string>> Createurl(CreateUrlRequest urlRequest)
        {
            var shortenUrl = await service.CreateUrl(urlRequest);
            if (urlRequest is null)
            {
                return BadRequest("Url cannot be empty.");
            }
            else if (shortenUrl.Item2 is not null)
            {
                return BadRequest(shortenUrl.Item2.Message);
            }
            else
            {
                return Ok(shortenUrl.Item1);
            }
        }

        [HttpDelete]
        public async Task<ActionResult<string>> DeleteUrl(int id)
        {
            string message =  await service.DeleteUrlAsync(id);
            return StatusCode(203,message);
        }
        [HttpGet("/{shortUrl}")]
        public async Task<ActionResult> GetShortUrl(string shortUrl)
        {
            URL longUrl = await service.GetLongUrlAsync(shortUrl);
            if (longUrl is null)
            {
                return NotFound("Url not found");
            }
            else
            {
                await service.AddClick(longUrl.Id);
                return Redirect(longUrl.LongUrl!);
            }
            
        }
    }
}

