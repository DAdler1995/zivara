using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Activity;

public class GoogleFitCredential
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public DateTime TokenExpiresAt { get; set; }
    public DateTime ConnectedAt { get; set; }
    public DateTime? LastSyncedAt { get; set; }

    public CharacterEntity Character { get; set; } = null!;
}
