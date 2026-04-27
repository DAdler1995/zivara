using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Zivara.Api.Data;

namespace Zivara.Api.Features.Activity;

public interface IGoogleFitService
{
    string FrontendOrigin { get; }
    string GetAuthUrl(Guid characterId);
    Task ExchangeCodeAsync(string code, string state);
    Task<GoogleFitStatusResponse> GetStatusAsync(Guid characterId);
    Task<ActivityResponse?> SyncTodayAsync(Guid characterId);
    Task DisconnectAsync(Guid characterId);
}

public class GoogleFitService : IGoogleFitService
{
    private readonly HttpClient _httpClient;
    private readonly ZivaraDbContext _db;
    private readonly IActivityService _activityService;
    private readonly IDataProtector _protector;
    private readonly string _clientId;
    private readonly string _clientSecret;
    private readonly string _redirectUri;
    private readonly string _frontendOrigin;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public GoogleFitService(
        HttpClient httpClient,
        ZivaraDbContext db,
        IActivityService activityService,
        IDataProtectionProvider dataProtectionProvider,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _db = db;
        _activityService = activityService;
        _protector = dataProtectionProvider.CreateProtector("GoogleFitOAuth");

        var section = configuration.GetSection("GoogleFit");
        _clientId = section["ClientId"] ?? string.Empty;
        _clientSecret = section["ClientSecret"] ?? string.Empty;
        _redirectUri = section["RedirectUri"] ?? string.Empty;
        _frontendOrigin = section["FrontendOrigin"] ?? "http://localhost:5173";
    }

    public string FrontendOrigin => _frontendOrigin;

    public string GetAuthUrl(Guid characterId)
    {
        var state = _protector.Protect(characterId.ToString());
        var scope = Uri.EscapeDataString("https://www.googleapis.com/auth/fitness.activity.read");
        var redirectUri = Uri.EscapeDataString(_redirectUri);

        return $"https://accounts.google.com/o/oauth2/v2/auth" +
               $"?client_id={_clientId}" +
               $"&redirect_uri={redirectUri}" +
               $"&response_type=code" +
               $"&scope={scope}" +
               $"&access_type=offline" +
               $"&prompt=consent" +
               $"&state={Uri.EscapeDataString(state)}";
    }

    public async Task ExchangeCodeAsync(string code, string state)
    {
        var characterId = Guid.Parse(_protector.Unprotect(state));

        var tokenResponse = await PostTokenRequestAsync(new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = _clientId,
            ["client_secret"] = _clientSecret,
            ["redirect_uri"] = _redirectUri,
            ["grant_type"] = "authorization_code"
        });

        var expiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn - 60);

        var existing = await _db.GoogleFitCredentials
            .FirstOrDefaultAsync(c => c.CharacterId == characterId);

        if (existing is not null)
        {
            existing.AccessToken = tokenResponse.AccessToken;
            if (tokenResponse.RefreshToken is not null)
                existing.RefreshToken = tokenResponse.RefreshToken;
            existing.TokenExpiresAt = expiresAt;
            existing.ConnectedAt = DateTime.UtcNow;
            existing.LastSyncedAt = null;
        }
        else
        {
            _db.GoogleFitCredentials.Add(new GoogleFitCredential
            {
                Id = Guid.NewGuid(),
                CharacterId = characterId,
                AccessToken = tokenResponse.AccessToken,
                RefreshToken = tokenResponse.RefreshToken ?? string.Empty,
                TokenExpiresAt = expiresAt,
                ConnectedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
    }

    public async Task<GoogleFitStatusResponse> GetStatusAsync(Guid characterId)
    {
        var credential = await _db.GoogleFitCredentials
            .FirstOrDefaultAsync(c => c.CharacterId == characterId);

        return new GoogleFitStatusResponse(credential is not null, credential?.LastSyncedAt);
    }

    public async Task<ActivityResponse?> SyncTodayAsync(Guid characterId)
    {
        var credential = await _db.GoogleFitCredentials
            .FirstOrDefaultAsync(c => c.CharacterId == characterId);

        if (credential is null) return null;

        await EnsureFreshTokenAsync(credential);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var stepCount = await GetStepCountAsync(credential, today);

        var result = await _activityService.SyncStepsAsync(characterId, new SyncStepsRequest(today, stepCount));

        credential.LastSyncedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return result;
    }

    public async Task DisconnectAsync(Guid characterId)
    {
        var credential = await _db.GoogleFitCredentials
            .FirstOrDefaultAsync(c => c.CharacterId == characterId);

        if (credential is not null)
        {
            _db.GoogleFitCredentials.Remove(credential);
            await _db.SaveChangesAsync();
        }
    }

    // Called by the background job — syncs today and yesterday for a credential
    public async Task SyncCredentialAsync(GoogleFitCredential credential)
    {
        await EnsureFreshTokenAsync(credential);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var yesterday = today.AddDays(-1);

        foreach (var date in new[] { today, yesterday })
        {
            var stepCount = await GetStepCountAsync(credential, date);
            await _activityService.SyncStepsAsync(credential.CharacterId, new SyncStepsRequest(date, stepCount));
        }

        credential.LastSyncedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    private async Task EnsureFreshTokenAsync(GoogleFitCredential credential)
    {
        if (DateTime.UtcNow < credential.TokenExpiresAt) return;

        var tokenResponse = await PostTokenRequestAsync(new Dictionary<string, string>
        {
            ["client_id"] = _clientId,
            ["client_secret"] = _clientSecret,
            ["refresh_token"] = credential.RefreshToken,
            ["grant_type"] = "refresh_token"
        });

        credential.AccessToken = tokenResponse.AccessToken;
        credential.TokenExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn - 60);
        // Refresh token is only returned on initial exchange; don't overwrite if absent
        if (tokenResponse.RefreshToken is not null)
            credential.RefreshToken = tokenResponse.RefreshToken;

        await _db.SaveChangesAsync();
    }

    private async Task<int> GetStepCountAsync(GoogleFitCredential credential, DateOnly date)
    {
        var startMs = new DateTimeOffset(date.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero).ToUnixTimeMilliseconds();
        var endMs = new DateTimeOffset(date.AddDays(1).ToDateTime(TimeOnly.MinValue), TimeSpan.Zero).ToUnixTimeMilliseconds();

        var body = JsonSerializer.Serialize(new
        {
            aggregateBy = new[] { new { dataTypeName = "com.google.step_count.delta" } },
            bucketByTime = new { durationMillis = 86400000 },
            startTimeMillis = startMs,
            endTimeMillis = endMs
        });

        using var request = new HttpRequestMessage(HttpMethod.Post,
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", credential.AccessToken);
        request.Content = new StringContent(body, Encoding.UTF8, "application/json");

        using var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return ParseStepCount(json);
    }

    private async Task<TokenResponse> PostTokenRequestAsync(Dictionary<string, string> parameters)
    {
        using var response = await _httpClient.PostAsync(
            "https://oauth2.googleapis.com/token",
            new FormUrlEncodedContent(parameters));

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<TokenResponse>(json, JsonOptions)
               ?? throw new InvalidOperationException("Empty token response from Google");
    }

    private static int ParseStepCount(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var total = 0;

        if (!doc.RootElement.TryGetProperty("bucket", out var buckets)) return 0;

        foreach (var bucket in buckets.EnumerateArray())
        {
            if (!bucket.TryGetProperty("dataset", out var datasets)) continue;
            foreach (var dataset in datasets.EnumerateArray())
            {
                if (!dataset.TryGetProperty("point", out var points)) continue;
                foreach (var point in points.EnumerateArray())
                {
                    if (!point.TryGetProperty("value", out var values)) continue;
                    foreach (var value in values.EnumerateArray())
                    {
                        if (value.TryGetProperty("intVal", out var intVal))
                            total += intVal.GetInt32();
                    }
                }
            }
        }

        return total;
    }

    private record TokenResponse(
        [property: JsonPropertyName("access_token")] string AccessToken,
        [property: JsonPropertyName("refresh_token")] string? RefreshToken,
        [property: JsonPropertyName("expires_in")] int ExpiresIn);
}
