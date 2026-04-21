using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Activity;

public enum XpSource
{
    StepSync,
    MealLog,
    WorkoutLog,
    WeightLog,
    WaterLog,
    QuestComplete,
    BossKill,
    Milestone,
    ReturnOfHero,
    DailyCheckin
}

public class XpEvent
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public SkillType SkillType { get; set; }
    public int XpAmount { get; set; }
    public XpSource Source { get; set; }
    public Guid? SourceEntityId { get; set; }
    public DateTime AwardedAt { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
}