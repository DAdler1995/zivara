using Microsoft.EntityFrameworkCore;
using Zivara.Api.Data;

namespace Zivara.Api.Features.Activity;

public class GoogleFitSyncJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<GoogleFitSyncJob> _logger;

    public GoogleFitSyncJob(IServiceProvider serviceProvider, ILogger<GoogleFitSyncJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Google Fit sync job sleeping for 1 hour");
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);

            if (stoppingToken.IsCancellationRequested) break;

            await SyncAllCredentialsAsync();
        }
    }

    private async Task SyncAllCredentialsAsync()
    {
        _logger.LogInformation("Running Google Fit hourly sync");

        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ZivaraDbContext>();
        var googleFitService = scope.ServiceProvider.GetRequiredService<GoogleFitService>();

        List<GoogleFitCredential> credentials;
        try
        {
            credentials = await db.GoogleFitCredentials.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load Google Fit credentials");
            return;
        }

        _logger.LogInformation("Syncing {Count} Google Fit credential(s)", credentials.Count);

        foreach (var credential in credentials)
        {
            try
            {
                await googleFitService.SyncCredentialAsync(credential);
                _logger.LogInformation("Google Fit sync complete for character {CharacterId}", credential.CharacterId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google Fit sync failed for character {CharacterId}", credential.CharacterId);
            }
        }
    }
}
