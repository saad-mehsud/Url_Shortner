using Url_Shortner.DTOs;

namespace Url_Shortner.Services;

public interface IAuthServices
{
    Task<TokenResponse> Login(Authrequest request);
    Task<TokenResponse> RefreshTokenAsync(RefreshRequest request);   
}
