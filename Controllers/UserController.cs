using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Url_Shortner.DTOs;
using Url_Shortner.Models;
using Url_Shortner.Services;

namespace Url_Shortner.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController(IUserServices userService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<User>> RegisterAsync(UserRequest request)
    {
        User user = await userService.CreateUserAsync(request);
        return Ok(user);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<List<User>>> GetAllUsersAsync()
    {
        var users = await userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("email")]
    public async Task<ActionResult<User>> GetUserByIdAsync(string email)
    {
        var user = await userService.GetUserAsync(email);
        return Ok(user);
    }

    [Authorize]
    [HttpPut]
    public async Task<ActionResult> UpdateUserAsync(User user)
    {
        await userService.UpdateUserAsync(user);
        return NoContent();
    }

    [Authorize]
    [HttpDelete("id")]
    public async Task<ActionResult> DeleteUserAsync(string email)
    {
        await userService.DeleteUserAsync(email);
        return NoContent();
    }
}
