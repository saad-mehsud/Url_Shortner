using Url_Shortner.DTOs;
using Url_Shortner.Models;

namespace Url_Shortner.Services;

public interface IAuthServices
{
    public Task<User> CreateUserAsync(UserRequest user);
}