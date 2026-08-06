using Microsoft.AspNetCore.Mvc;
using Url_Shortner.Models;
namespace Url_Shortner.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UrlController : Controller
    {
        URL[] _urls = 
        {
            new URL{Id =1,CreatedAt = DateTime.UtcNow, LongUrl = "https://google.com", ShortUrl = "https://local.com"},
            
            new URL{Id =2,CreatedAt = DateTime.UtcNow, LongUrl = "https://google.com", ShortUrl = "https://local.com"}
        };


        [HttpGet]
        public async Task<ActionResult<string>> GetAllUrls()
            => await Task.FromResult(Ok(_urls));

        [HttpGet("{id}")]
        public async Task<ActionResult<URL>> GetUrlByIDAsync(int id)
        {   
            var url =  _urls.FirstOrDefault(url => url.Id == id);
            if (url is null)
            {
                return NotFound("Url with this id cannot be found");
            }

            return Ok(url);

        }
    }
}

