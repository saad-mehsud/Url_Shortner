using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Url_Shortner.Utils;

public class HealthCheck:IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        bool isHealthy = true;
        if (isHealthy)
        {
            return Task.FromResult(HealthCheckResult.Healthy("Service is healthy"));
        }
        return Task.FromResult(HealthCheckResult.Unhealthy("Service is unhealthy"));
    }
}