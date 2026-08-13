using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Url_Shortner.Data;
using Url_Shortner.DTOs;
using Url_Shortner.Models;

namespace Url_Shortner.Services;

public class UserServices (DbConfig context) : IUserServices
{   
    
    public async Task<User> CreateUserAsync(UserRequest request)
    {
        User user = new();
        user.UserName = request.UserName!;
        user.PasswordHash = new PasswordHasher<User>().HashPassword(user,request.Password!);
        user.Role = request.Role!;
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return await Task.FromResult(new User());
    }

    public async Task<(User?,Exception?)> GetUserAsync(string userName)
    {
        try
        {
            User? user = await context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            return (user,null);
        }
        catch (Exception e)
        {
            return (null,e);
        }
    }

    public async Task<(List<User>?,Exception?)> GetAllUsersAsync()
    {
        try
        {
            return (await context.Users.ToListAsync(),null);
        }
        catch (Exception e)
        {
            return (null,e);
        }
    }

    public async Task<(bool,string)> UpdateUserAsync(User user)
    {
        try
        {
            bool result = await context.Users.AnyAsync(u => u.Id == user.Id);
            if (result)
            {
                context.Users.Update(user);
                int updatedRows = await context.SaveChangesAsync();
                return updatedRows > 0 ? (true, "User updated successfully") : (false, "User not updated");
            }
            else
            {
                return (false, "User not found");
            }
        }
        catch (Exception e)
        {
            return (false,e.Message);
        }
    }

    public async Task<(bool,string,Exception?)> DeleteUserAsync(int id)
    {
        try
        {
            bool result = await context.Users.AnyAsync(u => u.Id == id);
            if (result)
            {
                int affectedRows = await context.Users.Where(u => u.Id == id ).ExecuteDeleteAsync();
                return affectedRows > 0 ? (true, $"User with {id} deleted successfully.", null) : (false,$"User with id cannot be deleted.", null);
            }
            else
            {
                return (false, "User not found", null);
            }
        }
        catch (Exception e)
        {
            return (false, "Error Occured", e);
        }
    }
}