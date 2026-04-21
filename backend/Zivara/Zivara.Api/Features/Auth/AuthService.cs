using Microsoft.EntityFrameworkCore;
using Zivara.Api.Data;

namespace Zivara.Api.Features.Auth;

public interface IAuthService
{
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RefreshAsync(string refreshToken);
}

public class AuthService : IAuthService
{
    private readonly ZivaraDbContext _db;
    private readonly IJwtService _jwtService;

    public AuthService(ZivaraDbContext db, IJwtService jwtService)
    {
        _db = db;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        // Check if username is already taken
        var exists = await _db.Users.AnyAsync(u => u.Username == request.Username);
        if (exists) return null;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user is null) return null;

        var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!passwordValid) return null;

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponse?> RefreshAsync(string refreshToken)
    {
        var storedToken = await _db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (storedToken is null) return null;
        if (storedToken.IsRevoked) return null;
        if (storedToken.ExpiresAt < DateTime.UtcNow) return null;

        // Revoke the old refresh token
        storedToken.IsRevoked = true;
        await _db.SaveChangesAsync();

        return await GenerateAuthResponseAsync(storedToken.User);
    }

    private async Task<AuthResponse> GenerateAuthResponseAsync(User user)
    {
        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshTokenValue = _jwtService.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(60);

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow,
            IsRevoked = false
        };

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync();

        return new AuthResponse(accessToken, refreshTokenValue, expiresAt);
    }
}