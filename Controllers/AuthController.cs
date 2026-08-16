using Microsoft.AspNetCore.Mvc;
using Url_Shortner.DTOs;
using Url_Shortner.Exceptions;
using Url_Shortner.Services;

namespace Url_Shortner.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthServices authServices) : Controller
{
    [HttpPost]
    public async Task<ActionResult<AuthResponse>> Login(Authrequest request)
    {
        var response = await authServices.Login(request);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<TokenResponse>> RefreshToken(RefreshRequest refreshRequest)
    {
        TokenResponse response = await authServices.RefreshTokenAsync(refreshRequest);
        if (response is null)
        {
            throw new UnauthorizedException("Invalid refresh token");
        }
        return  Ok(response);
    }
}
