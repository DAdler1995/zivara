using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Zivara.Api.Data;

namespace Zivara.Api.Features.Notifications;

public interface IExpoNotificationService
{
    Task SendToCharacterAsync(Guid characterId, string title, string body);
    Task SendToAllCharactersAsync(string title, string body);
}

public class ExpoNotificationService : IExpoNotificationService
{
    private readonly ZivaraDbContext _db;
    private readonly HttpClient _httpClient;
    private readonly ILogger<ExpoNotificationService> _logger;

    private const string ExpoEndpoint = "https://exp.host/--/api/v2/push/send";

    public ExpoNotificationService(ZivaraDbContext db, HttpClient httpClient, ILogger<ExpoNotificationService> logger)
    {
        _db = db;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task SendToCharacterAsync(Guid characterId, string title, string body)
    {
        var tokens = await _db.DeviceTokens
            .Where(t => t.CharacterId == characterId)
            .Select(t => t.Token)
            .ToListAsync();

        if (tokens.Count == 0) return;

        await SendAsync(tokens, title, body);
    }

    public async Task SendToAllCharactersAsync(string title, string body)
    {
        var tokens = await _db.DeviceTokens
            .Select(t => t.Token)
            .ToListAsync();

        if (tokens.Count == 0) return;

        await SendAsync(tokens, title, body);
    }

    private async Task SendAsync(List<string> tokens, string title, string body)
    {
        var messages = tokens.Select(token => new
        {
            to = token,
            title,
            body,
            sound = "default"
        });

        var json = JsonSerializer.Serialize(messages);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync(ExpoEndpoint, content);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Expo push notification returned {StatusCode}", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Expo push notification");
        }
    }
}