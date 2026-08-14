using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
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
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<List<URL>>> GetAllUrls()
            => await service.GetUrls();
        [Authorize]                        
        [HttpGet("{id}")]
        public async Task<ActionResult<URL>> GetUrlByIdAsync(int id)
        {
            string email = User.FindFirstValue(ClaimTypes.Email);
            Console.WriteLine(email);
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
             if (updatedUrl.Item2 is not null)
            {
                return BadRequest(updatedUrl.Item2.Message);
            }
            else
            {
                return Ok(updatedUrl.Item1);
            }
        }

        [HttpPost]
        public async Task<ActionResult<string>> CreateUrl(CreateUrlRequest urlRequest)
        {
            var shortenUrl = await service.CreateUrl(urlRequest);
             if (shortenUrl.Item2 is not null)
            {
                return BadRequest(shortenUrl.Item2.Message);
            }
            else
            {
                return Ok(shortenUrl.Item1);
            }
        }

        [HttpDelete("/:{id}")]
        public async Task<ActionResult<string>> DeleteUrl(int id)
        {
            var message =  await service.DeleteUrlAsync(id);
            return StatusCode(message.Item2,message.Item1);
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

