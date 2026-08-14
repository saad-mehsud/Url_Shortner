using System.ComponentModel.DataAnnotations;

namespace Url_Shortner.DTOs;

public class Authrequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    public required string Password { get; set; }
}
