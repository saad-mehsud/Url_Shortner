using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Url_Shortner.Data;
using Url_Shortner.DTOs;
using Url_Shortner.Exceptions;
using Url_Shortner.Models;

namespace Url_Shortner.Services;

public class AuthServices(DbConfig context) : IAuthServices
{
    public async Task<AuthResponse> Login(Authrequest request)
    {
        User? user = await context.Users.Where(u => u.Email == request.Email).FirstOrDefaultAsync();

        if (user is null)
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        var hashVerifier =
            new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (hashVerifier == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        return new AuthResponse
        {
            Token = CreateToken(user),
            Message = "Login successful"
        };
    }

    private string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(DotNetEnv.Env.GetString("JWT_SECRET_KEY")));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var tokenDescriptor = new JwtSecurityToken(
            issuer: DotNetEnv.Env.GetString("ISSUER"),
            audience: DotNetEnv.Env.GetString("AUDIENCE"),
            claims: claims,
            expires: DateTime.Now.AddMinutes(30),
            signingCredentials: credentials
        );
        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }
}
