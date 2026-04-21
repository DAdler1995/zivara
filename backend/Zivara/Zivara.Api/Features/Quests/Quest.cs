using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Quests;

public enum QuestType
{
    Daily,
    Weekly,
    HighTier
}

public enum QuestStatus
{
    Active,
    Completed,
    Expired
}

public class Quest
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public QuestType QuestType { get; set; }
    public SkillType SkillTarget { get; set; }
    public int TargetValue { get; set; }
    public int CurrentValue { get; set; }
    public required string TemplateKey { get; set; }
    public required string Description { get; set; }
    public QuestStatus Status { get; set; }
    public DateTime GeneratedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
}