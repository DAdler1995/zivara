namespace Zivara.Api.Features.Auth;

public record RegisterRequest(string Username, string Password);

public record LoginRequest(string Username, string Password);

public record AuthResponse(string AccessToken, string RefreshToken, DateTime ExpiresAt);