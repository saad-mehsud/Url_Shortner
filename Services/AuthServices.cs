using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Url_Shortner.Data;
using Url_Shortner.DTOs;
using Url_Shortner.Exceptions;
using Url_Shortner.Models;

namespace Url_Shortner.Services;

public class AuthServices(DbConfig context) : IAuthServices
{
    public async Task<TokenResponse> Login(Authrequest request)
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
        RefreshToken? token = await context.RefreshTokens.FirstOrDefaultAsync(tok => tok.User.Id == user.Id && tok.status == Status.Active);
        
        if(token is null) {
            token = new()
            {
                userId = user.Id,
                User = user 
            };
        }
        return new TokenResponse()
        {
            AccessToken = CreateToken(user),
            RefreshToken = await GenerateAndSaveRefreshTokenAsync(token!)
        };
    }

    private string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
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

   
    public async Task<TokenResponse> RefreshTokenAsync(RefreshRequest refreshRequest)
    {
        User? user = await context.Users.FindAsync(refreshRequest.UserId);
        bool isValid = await ValidateRefreshTokenAsync(refreshRequest.UserId, refreshRequest.RefreshToken);
        if (!isValid || user is null)
        {
            throw new UnauthorizedException("Invalid refresh token");
        }
        else
        {
            RefreshToken? tok = await context.RefreshTokens.FirstOrDefaultAsync(tok => tok.User.Id == user.Id && tok.status == Status.Active);
        
            string token = await GenerateAndSaveRefreshTokenAsync(tok);
            return new TokenResponse()
            {
                AccessToken = CreateToken(user),
                RefreshToken = token
            };
        }
    }
    
    private async Task<bool> ValidateRefreshTokenAsync(int userId, string refreshToken)
    {
        RefreshToken? token = await context.RefreshTokens.FirstOrDefaultAsync(tok => token.token  == refreshToken);
        if (token is null || token.expires <= DateTime.UtcNow || token.status != Status.Active)
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    public  async Task<string> GenerateAndSaveRefreshTokenAsync(RefreshToken refreshToken)
    {
        try{
        string token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        refreshToken.token = token;
        refreshToken.expires = DateTime.UtcNow.AddDays(7);
        refreshToken.status = Status.Active;
        context.RefreshTokens.Update(refreshToken);
        await context.SaveChangesAsync();
        return  token;
        }
        catch(Exception)
        {
            throw;
        }
    }
}
