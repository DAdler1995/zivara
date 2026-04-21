using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Activity;

public class WeightLog
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public decimal WeightLbs { get; set; }
    public DateTime LoggedAt { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
}