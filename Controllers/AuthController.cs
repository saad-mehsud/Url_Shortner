using Microsoft.AspNetCore.Mvc;
using Url_Shortner.DTOs;
using Url_Shortner.Services;

namespace Url_Shortner.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthServices authServices) : Controller
{
    [HttpPost]
    public async Task<ActionResult<AuthResponse>> Login(Authrequest request)
    {
        var reponse = await authServices.Login(request);
        if(reponse.StatusCode == 200)
        {
            return Ok(reponse);
        }
        return StatusCode(reponse.StatusCode, reponse);
    }
}