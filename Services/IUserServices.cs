using Url_Shortner.DTOs;
using Url_Shortner.Models;

namespace Url_Shortner.Services;

public interface IUserServices
{
    Task<User> CreateUserAsync(UserRequest user);
    Task<User> GetUserAsync(string email);
    Task<List<User>> GetAllUsersAsync();
    Task UpdateUserAsync(User user);
    Task DeleteUserAsync(string email);
}
