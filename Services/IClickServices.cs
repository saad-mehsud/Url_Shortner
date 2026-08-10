using Url_Shortner.Models;

namespace Url_Shortner.Services
{
    public interface IClickServices
    {
        Task<List<Click>> GetAllClicksAsync(int id );        
    }
    
}