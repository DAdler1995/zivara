using Zivara.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Zivara.Api.Features.Rewards;

public class JarWeekCreationJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<JarWeekCreationJob> _logger;

    public JarWeekCreationJob(IServiceProvider serviceProvider, ILogger<JarWeekCreationJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            var nextMonday = GetNextMonday(now);
            var delay = nextMonday - now;

            _logger.LogInformation("Jar week creation job sleeping until {NextMonday}", nextMonday);

            await Task.Delay(delay, stoppingToken);

            if (stoppingToken.IsCancellationRequested) break;

            await CreateWeeksForAllCharactersAsync();
        }
    }

    private async Task CreateWeeksForAllCharactersAsync()
    {
        _logger.LogInformation("Creating jar weeks for new week");

        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ZivaraDbContext>();
        var jarService = scope.ServiceProvider.GetRequiredService<IJarService>();

        try
        {
            var characterIds = await db.Characters
                .Select(c => c.Id)
                .ToListAsync();

            foreach (var characterId in characterIds)
            {
                await jarService.EnsureCurrentWeekAsync(characterId);
            }

            _logger.LogInformation("Jar weeks created for {Count} characters", characterIds.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during jar week creation");
        }
    }

    private static DateTime GetNextMonday(DateTime from)
    {
        var daysUntilMonday = ((int)DayOfWeek.Monday - (int)from.DayOfWeek + 7) % 7;
        if (daysUntilMonday == 0) daysUntilMonday = 7;
        return from.Date.AddDays(daysUntilMonday);
    }
}