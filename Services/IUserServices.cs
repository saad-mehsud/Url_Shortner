using Url_Shortner.DTOs;
using Url_Shortner.Models;

namespace Url_Shortner.Services;

public interface IUserServices
{
    public Task<User> CreateUserAsync(UserRequest user);
    public Task<(User?,Exception?)> GetUserAsync(string email);
    public Task<(List<User>?,Exception?)> GetAllUsersAsync();
    public Task<(bool,string)> UpdateUserAsync(User user);
    public Task<(bool,string,Exception?)> DeleteUserAsync(string email);
    
}