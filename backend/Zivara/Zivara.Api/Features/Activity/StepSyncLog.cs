using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Activity;

public class StepSyncLog
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public DateOnly SyncDate { get; set; }
    public int StepCount { get; set; }
    public int XpAwarded { get; set; }
    public DateTime SyncedAt { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
}