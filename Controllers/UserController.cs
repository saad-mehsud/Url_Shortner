using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Url_Shortner.DTOs;
using Url_Shortner.Models;
using Url_Shortner.Services;

namespace Url_Shortner.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IAuthServices authService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserRequest request)
        {
            return await authService.CreateUserAsync(request);;
        }
    }
}
