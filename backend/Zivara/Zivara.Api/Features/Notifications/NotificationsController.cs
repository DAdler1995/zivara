using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zivara.Api.Data;
using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Notifications;

[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ZivaraDbContext _db;
    private readonly ICharacterService _characterService;

    public NotificationsController(ZivaraDbContext db, ICharacterService characterService)
    {
        _db = db;
        _characterService = characterService;
    }

    [HttpPost("devicetoken")]
    public async Task<IActionResult> RegisterDeviceToken(RegisterDeviceTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
            return BadRequest("Token is required.");

        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        // Upsert -- update LastSeenAt if token exists, otherwise create
        var existing = await _db.DeviceTokens
            .FirstOrDefaultAsync(t => t.Token == request.Token);

        if (existing is not null)
        {
            existing.LastSeenAt = DateTime.UtcNow;
        }
        else
        {
            _db.DeviceTokens.Add(new DeviceToken
            {
                Id = Guid.NewGuid(),
                CharacterId = characterId.Value,
                Token = request.Token,
                RegisteredAt = DateTime.UtcNow,
                LastSeenAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<Guid?> GetCharacterIdAsync()
    {
        var userId = GetUserId();
        if (userId is null) return null;

        var character = await _characterService.GetCharacterAsync(userId.Value);
        return character?.Id;
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}