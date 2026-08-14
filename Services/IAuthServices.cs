using System;
using Url_Shortner.DTOs;
namespace Url_Shortner.Services
{
    public interface IAuthServices
    {
        public Task<AuthResponse> Login(Authrequest request);
    }
}