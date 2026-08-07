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
            var url =  await service.GetUrlByIdAsync(id);
            if (url is null)
            {
                return NotFound("Url with this id cannot be found");
            }

            return Ok(url);

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
            return Ok(message);
        }
        
        [HttpGet("/{shortUrl}")]
        public async Task<ActionResult<string>> GetShortUrl(string shortUrl)
        {
            string longUrl = await service.GetShortUrlAsync(shortUrl);
            return Redirect(longUrl);
        }
    }
}

