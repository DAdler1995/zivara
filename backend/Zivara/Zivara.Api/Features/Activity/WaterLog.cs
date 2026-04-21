using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Activity;

public class WaterLog
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public int Glasses { get; set; }
    public DateTime LoggedAt { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
}