namespace Url_Shortner.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string resource, object key)
        : base($"{resource} '{key}' was not found.")
    {
    }

    public NotFoundException(string message) : base(message)
    {
    }
}
