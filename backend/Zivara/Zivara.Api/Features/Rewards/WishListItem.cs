using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Rewards;

public class WishListItem
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public required string Label { get; set; }
    public decimal? EstimatedCost { get; set; }
    public string? MilestoneTrigger { get; set; }
    public bool IsUnlocked { get; set; }
    public DateTime? UnlockedAt { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
}