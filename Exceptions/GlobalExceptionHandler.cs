using EntityFramework.Exceptions.Common;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Url_Shortner.Exceptions;

public class GlobalExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (status, title, detail) = Map(exception);

        if (status == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception");
        }
        else
        {
            logger.LogWarning(exception, "Handled exception: {Title}", title);
        }

        httpContext.Response.StatusCode = status;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Status = status,
                Title = title,
                Detail = detail,
                Type = $"https://httpstatuses.io/{status}"
            }
        });
    }

    private static (int Status, string Title, string Detail) Map(Exception exception)
    {
        return exception switch
        {
            NotFoundException => (
                StatusCodes.Status404NotFound,
                "Not Found",
                exception.Message),
            ConflictException or UniqueConstraintException => (
                StatusCodes.Status409Conflict,
                "Conflict",
                exception is UniqueConstraintException
                    ? "A resource with that unique value already exists."
                    : exception.Message),
            BadRequestException or CannotInsertNullException or MaxLengthExceededException => (
                StatusCodes.Status400BadRequest,
                "Bad Request",
                exception is BadRequestException
                    ? exception.Message
                    : "The request contains invalid data."),
            UnauthorizedException => (
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                exception.Message),
            ReferenceConstraintException => (
                StatusCodes.Status409Conflict,
                "Conflict",
                "The request conflicts with related data."),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Internal Server Error",
                "An unexpected error occurred.")
        };
    }
}
