using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Notifications;

public class DeviceToken
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public required string Token { get; set; }
    public DateTime RegisteredAt { get; set; }
    public DateTime LastSeenAt { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
}