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

public class AuthServices(DbConfig dbContext) : IAuthServices
{
    public async Task<TokenResponse> Login(Authrequest request)
    {
        User? user = await dbContext.Users.Where(u => u.Email == request.Email).FirstOrDefaultAsync();

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
        RefreshToken? token = await dbContext.RefreshTokens.FirstOrDefaultAsync(tok => tok.User!.Id == user.Id && tok.status == Status.Active);
        
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
        User? user = await dbContext.Users.FindAsync(refreshRequest.UserId);
        bool isValid = await ValidateRefreshTokenAsync(refreshRequest.UserId, refreshRequest.RefreshToken);
        if (!isValid || user is null)
        {
            throw new UnauthorizedException("Invalid refresh token");
        }
        else
        {
            RefreshToken? tok = await dbContext.RefreshTokens.FirstOrDefaultAsync(tok => tok.User!.Id == user.Id && tok.status == Status.Active);
        
            string token = await GenerateAndSaveRefreshTokenAsync(tok!);
            return new TokenResponse()
            {
                AccessToken = CreateToken(user),
                RefreshToken = token
            };
        }
    }
    
    private async Task<bool> ValidateRefreshTokenAsync(int userId, string refreshToken)
    {
        RefreshToken? token = await dbContext.RefreshTokens.FirstOrDefaultAsync(tok =>tok.token  == refreshToken);
        if (token is null )
        {
            throw new NotFoundException("Refresh Token", refreshToken);
        }
        else if (token.expires <= DateTime.UtcNow)
        {
            throw new UnauthorizedException("Refresh Token has expired");
        }
        else if (token.status == Status.Revoked)
        {
            await ReuseDetectedAsync(token);
            throw new UnauthorizedException("Refresh Token has been revoked");
        }
        else
        {
            return true;
        }
    }

    private  async Task<string> GenerateAndSaveRefreshTokenAsync(RefreshToken refreshToken)
    {
        try{
            string token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            await DiscardRefreshToken(refreshToken);
            RefreshToken rtoken = new RefreshToken()
            {
                token = token,
                userId = refreshToken.userId,
                User = refreshToken.User,
                created = DateTime.UtcNow,
                expires = DateTime.UtcNow.AddDays(7),
                status = Status.Active
            };
        dbContext.RefreshTokens.Add(rtoken);
        await dbContext.SaveChangesAsync();
        return  token;
        }
        catch(Exception)
        {
            throw;
        }
    }

    private async Task DiscardRefreshToken(RefreshToken refreshToken)
    {
        try
        {
            refreshToken.status = Status.Revoked;
            dbContext.RefreshTokens.Update(refreshToken);
            await dbContext.SaveChangesAsync();
        }
        catch (Exception)
        {
            throw;
        }
    }

    private async Task ReuseDetectedAsync(RefreshToken refreshToken)
    {
        TokenReuse tokenReuse = new()
        {
            token = refreshToken,
            userId = refreshToken.userId,
            createdAt = DateTime.UtcNow
        };
        await dbContext.ReuseTokens.AddAsync(tokenReuse);
        await dbContext.SaveChangesAsync();
        
    }
}
