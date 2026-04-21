using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Activity;

public class WorkoutLog
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public int DurationMinutes { get; set; }
    public string? Notes { get; set; }
    public DateTime LoggedAt { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
}