using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Activity;

public enum ActivityType
{
    Workout,
    MealCheckin,
    WeightEntry,
    WaterEntry,
    DailyCheckin
}

public class ActivityLog
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public ActivityType ActivityType { get; set; }
    public string? Payload { get; set; } // JSON blob for extra data
    public DateTime LoggedAt { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
}