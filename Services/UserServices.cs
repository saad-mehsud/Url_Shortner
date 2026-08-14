using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Url_Shortner.Data;
using Url_Shortner.DTOs;
using Url_Shortner.Exceptions;
using Url_Shortner.Models;

namespace Url_Shortner.Services;

public class UserServices(DbConfig context) : IUserServices
{
    public async Task<User> CreateUserAsync(UserRequest request)
    {
        if (await context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new ConflictException("A user with this email already exists.");
        }

        User user = new()
        {
            Email = request.Email,
            UserName = request.UserName,
            Role = request.Role
        };
        user.PasswordHash = new PasswordHasher<User>().HashPassword(user, request.Password);
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    public async Task<User> GetUserAsync(string email)
    {
        User? user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null)
        {
            throw new NotFoundException("User", email);
        }

        return user;
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await context.Users.ToListAsync();
    }

    public async Task UpdateUserAsync(User user)
    {
        bool exists = await context.Users.AnyAsync(u => u.Id == user.Id);
        if (!exists)
        {
            throw new NotFoundException("User", user.Id);
        }

        context.Users.Update(user);
        await context.SaveChangesAsync();
    }

    public async Task DeleteUserAsync(string email)
    {
        int affectedRows = await context.Users.Where(u => u.Email == email).ExecuteDeleteAsync();
        if (affectedRows == 0)
        {
            throw new NotFoundException("User", email);
        }
    }
}
