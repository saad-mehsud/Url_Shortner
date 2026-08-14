
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Url_Shortner.Data;
using Url_Shortner.DTOs;
using Url_Shortner.Models;

namespace Url_Shortner.Services;

public class AuthServices(DbConfig context) : IAuthServices
{
    public async Task<AuthResponse> Login(Authrequest request)
    {
        try
        {
            User? user = await context.Users.Where(u => u.Email == request.Email).FirstOrDefaultAsync();
           
            if (user is null)
            {
                return new AuthResponse
                {
                    StatusCode = 404,
                    Message = "User not found"
                };
    
            }
            else
            {
                var hashVerifier =
                    new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password!);
                if (hashVerifier == PasswordVerificationResult.Failed)
                {
                    
                    return new AuthResponse
                    {
                        StatusCode = 401,
                        Message = "Invalid password"
                    };
                }
                else 
                {
                    return new AuthResponse
                    {
                        StatusCode = 200,
                        Token = CreateToken(user),
                        Message = "Login successful"
                    };
                }
            }
        }
        catch (Exception e)
        {
            return new AuthResponse
            {
                StatusCode = 500,
                Message = $"Error Occured{e.Message}+{e.StackTrace}"
            };
        }

    }

    private string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role)
        };
        var key =  new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET_KEY")!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var tokenDescriptor = new JwtSecurityToken(
        
            issuer: Environment.GetEnvironmentVariable("ISSUER"),
            audience: Environment.GetEnvironmentVariable("AUDIENCE"),
            claims: claims,
            expires: DateTime.Now.AddMinutes(30),
            signingCredentials: credentials
        );
        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }
}