namespace Zivara.Api.Features.Character;

public enum SkillType
{
    Agility,
    Endurance,
    Vitality,
    Discipline,
    Nutrition,
    Hydration
}

public class Skill
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public SkillType SkillType { get; set; }
    public long TotalXP { get; set; }
    public int Level { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
}