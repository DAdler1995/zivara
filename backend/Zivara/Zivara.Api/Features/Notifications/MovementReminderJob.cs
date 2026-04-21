namespace Zivara.Api.Features.Notifications;

public class MovementReminderJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MovementReminderJob> _logger;

    // Notification times in local hour/minute (24hr) -- Monday to Friday only
    private static readonly (int Hour, int Minute)[] NotificationTimes =
    [
        (8, 0),
        (9, 30),
        (11, 0),
        (12, 30),
        (15, 0),
        (16, 30)
    ];

    private static readonly string[] Messages =
    [
        "Your character grows restless. A short walk awaits.",
        "The training grounds call. Step away from the desk, adventurer.",
        "Movement detected: none. The Bog Lurker stirs. Shake its attention.",
        "Even the mightiest heroes pace the halls. Take a short walk.",
        "The road does not walk itself. Step away for a moment.",
        "A scout who stops moving is a scout who gets caught. Take a walk.",
        "The Stillness grows when you sit too long. Push back.",
        "Your legs remember the road. Give them a moment to prove it."
    ];

    public MovementReminderJob(IServiceProvider serviceProvider, ILogger<MovementReminderJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.Now; // Local time for scheduling
            var nextNotification = GetNextNotificationTime(now);

            if (nextNotification is null)
            {
                // No more notifications today -- sleep until tomorrow's first one
                var tomorrow = now.Date.AddDays(1);
                var tomorrowFirst = GetNextNotificationTime(tomorrow);
                if (tomorrowFirst is null)
                {
                    await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
                    continue;
                }
                var delay = tomorrowFirst.Value - now;
                _logger.LogInformation("Movement reminder sleeping until {Next}", tomorrowFirst.Value);
                await Task.Delay(delay, stoppingToken);
            }
            else
            {
                var delay = nextNotification.Value - now;
                _logger.LogInformation("Movement reminder sleeping until {Next}", nextNotification.Value);
                await Task.Delay(delay, stoppingToken);
            }

            if (stoppingToken.IsCancellationRequested) break;

            var currentDay = DateTime.Now.DayOfWeek;
            if (currentDay == DayOfWeek.Saturday || currentDay == DayOfWeek.Sunday)
                continue;

            await SendMovementReminderAsync();
        }
    }

    private static DateTime? GetNextNotificationTime(DateTime from)
    {
        foreach (var (hour, minute) in NotificationTimes)
        {
            var candidate = from.Date.AddHours(hour).AddMinutes(minute);
            if (candidate > from) return candidate;
        }
        return null;
    }

    private async Task SendMovementReminderAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var notificationService = scope.ServiceProvider.GetRequiredService<IExpoNotificationService>();
        var random = new Random();

        var message = Messages[random.Next(Messages.Length)];

        try
        {
            await notificationService.SendToAllCharactersAsync("Time to Move", message);
            _logger.LogInformation("Movement reminder sent: {Message}", message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send movement reminder");
        }
    }
}