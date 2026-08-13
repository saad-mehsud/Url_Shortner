using Microsoft.AspNetCore.Http.HttpResults;
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
            return await userService.CreateUserAsync(request);;
        }
        [HttpGet]
        public async Task<ActionResult<List<User>>> GetAllUsersAsync()
        {
            try
            {
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

        [HttpGet($"userName")]
        public async Task<ActionResult<User>> GetUserByIdAsync(string userName)
        {
            var result = await userService.GetUserAsync(userName);
            if (result.Item1 is null)
            {
                return NotFound($"Cannot find user with username {userName}");
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

        [HttpDelete("id")]
        public async Task<ActionResult> DeleteUserAsync(int id)
        {
            
                /*Item1 is type bool that will be true if user is deleted successfully
                Item2 is type string that will be error message if user is not deleted successfully
                Item3 is type Exception that will be null if user is deleted successfully
                And not null if user is not deleted successfully*/
                var result = await userService.DeleteUserAsync(id);
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
