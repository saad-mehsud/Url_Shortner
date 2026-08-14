using Url_Shortner.DTOs;

namespace Url_Shortner.Services;

public interface IAuthServices
{
    Task<AuthResponse> Login(Authrequest request);
}
