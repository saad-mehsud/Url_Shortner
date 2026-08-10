using Url_Shortner.Data;
using Url_Shortner.Models;

namespace Url_Shortner.Services
{
    public class ClickServices(DbConfig context) : IClickServices
    {
        public async Task<List<Click>> GetAllClicksAsync(int id )
        {
            var clicks = context.Clicks.Where(click => click.UrlId == id).ToList();
            return clicks;
        }   
    }
    
}