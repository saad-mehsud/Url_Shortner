using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Url_Shortner.DTOs;
using Url_Shortner.Models;
using Url_Shortner.Services;

namespace Url_Shortner.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(IUserServices userService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<User>> RegisterAsync(UserRequest request)
        {
            if (request.UserName is null || request.Password is null || request.Role is null || request.Email is null)
            {
                return BadRequest("All fields are required");
            }
            User user = await userService.CreateUserAsync(request);
            return user ==  null ? BadRequest("User already exists") : Ok(user);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<List<User>>> GetAllUsersAsync()
        {
            try
            {
                /* Item1 is type List<User> will return  a list containing all the users
                 Item2 is type Exception if not null will return BadRequest Status code*/
                var result = await userService.GetAllUsersAsync();
                if (result.Item1 is null)
                {
                    return NotFound(result.Item2!.Message);
                }
                else
                {
                    return Ok(result.Item1);
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet($"email")]
        public async Task<ActionResult<User>> GetUserByIdAsync(string email)
        {
            /* Item1 is type User if null wil return NotFound Status code
             Item2 is type Exception if not null will return BadRequest Status code*/
            var result = await userService.GetUserAsync(email);
            if (result.Item1 is null)
            {
                return NotFound($"Cannot find user with username {email}");
            }
            else if (result.Item2 is not null)
            {
                return BadRequest(result.Item2.Message);
            }
            else
            {
                return Ok(result.Item1);
            }
        }
        
        [Authorize]
        [HttpPut]
        public async Task<ActionResult> UpdateUserAsync(User user)
        {
            /*tem1 is type bool that will be true if user is updated successfully.
            Item2 is type string that will be error message if user is not updated successfully.*/
            var result = await userService.UpdateUserAsync(user);
            if (result.Item1)
            {
                return Ok(result.Item2);
            }
            else
            {
                return BadRequest(result.Item2);
            }
            
        }
        [Authorize]
        [HttpDelete("id")]
        public async Task<ActionResult> DeleteUserAsync(string email)
        {
            
                /*Item1 is type bool that will be true if user is deleted successfully
                Item2 is type string that will be error message if user is not deleted successfully
                Item3 is type Exception that will be null if user is deleted successfully
                And not null if user is not deleted successfully*/
                var result = await userService.DeleteUserAsync(email);
                if (result.Item1)
                {
                    return Ok(result.Item2);
                }
                else if (result.Item3 is not null)
                {
                    return BadRequest(result.Item3);
                }
                else
                {
                    return NotFound(result.Item2);
                }
        }
    }
}
