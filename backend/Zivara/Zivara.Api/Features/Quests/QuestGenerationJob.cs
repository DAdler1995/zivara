using Zivara.Api.Data;
using Zivara.Api.Features.Notifications;
using Microsoft.EntityFrameworkCore;

namespace Zivara.Api.Features.Quests;

public class QuestGenerationJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<QuestGenerationJob> _logger;

    public QuestGenerationJob(IServiceProvider serviceProvider, ILogger<QuestGenerationJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            var nextMidnight = now.Date.AddDays(1);
            var delay = nextMidnight - now;

            _logger.LogInformation("Quest generation job sleeping until {NextMidnight}", nextMidnight);

            await Task.Delay(delay, stoppingToken);

            if (stoppingToken.IsCancellationRequested) break;

            await GenerateQuestsForAllCharactersAsync();
        }
    }

    private async Task GenerateQuestsForAllCharactersAsync()
    {
        _logger.LogInformation("Running midnight quest generation");

        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ZivaraDbContext>();
        var questService = scope.ServiceProvider.GetRequiredService<IQuestService>();
        var notificationService = scope.ServiceProvider.GetRequiredService<IExpoNotificationService>();

        try
        {
            await questService.ExpireOldQuestsAsync();

            var characterIds = await db.Characters
                .Select(c => c.Id)
                .ToListAsync();

            foreach (var characterId in characterIds)
            {
                await questService.GenerateDailyQuestsAsync(characterId);
            }

            // Notify all characters that their daily quests are ready
            await notificationService.SendToAllCharactersAsync(
                "Daily Quests Ready",
                "Your daily quests are ready. The realm awaits.");

            _logger.LogInformation("Quest generation complete for {Count} characters", characterIds.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during quest generation");
        }
    }
}