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
        URL[] _urls = 
        {
            new URL{Id =1,CreatedAt = DateTime.UtcNow, LongUrl = "https://google.com", ShortUrl = "https://local.com"},
            
            new URL{Id =2,CreatedAt = DateTime.UtcNow, LongUrl = "https://google.com", ShortUrl = "https://local.com"}
        };


        [HttpGet]
        public async Task<ActionResult<List<URL>>> GetAllUrls()
            => await service.GetUrls();

        [HttpGet("{id}")]
        public async Task<ActionResult<URL>> GetUrlByIdAsync(int id)
        {   
            var url =  _urls.FirstOrDefault(url => url.Id == id);
            if (url is null)
            {
                return NotFound("Url with this id cannot be found");
            }

            return Ok(url);

        }
        [HttpPut]
        public async Task<ActionResult<URL>> UpdateUrl(URL url)
        {
            return Ok(url);
        }

        [HttpPost]
        public async Task<ActionResult<string>> Createurl(CreateUrlRequest urlRequest)
        {
            var shortenUrl = await service.CreateUrl(urlRequest);
            if (shortenUrl.Item1 is null)
            {
                return BadRequest(shortenUrl.Item2.Message);
            }
            else
            {
                return Ok(shortenUrl.Item1.ShortUrl);
            }
        }

        [HttpDelete]
        public async Task<ActionResult<string>> DeleteUrl(int id)
        {
            return Ok("Url with id " + id + " deleted");
        }
    }
}

