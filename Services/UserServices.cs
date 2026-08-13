using Microsoft.AspNetCore.Identity;
using Url_Shortner.Data;
using Url_Shortner.DTOs;
using Url_Shortner.Models;

namespace Url_Shortner.Services;

public class AuthServices (DbConfig context) : IAuthServices
{   
    
    public async Task<User> CreateUserAsync(UserRequest request)
    {
        User user = new User();
        user.UserName = request.UserName!;
        user.PasswordHash = new PasswordHasher<User>().HashPassword(user,request.Password!);
        user.Role = request.Role!;
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return await Task.FromResult(new User());
    }
}