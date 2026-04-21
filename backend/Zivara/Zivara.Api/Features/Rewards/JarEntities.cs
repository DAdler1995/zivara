using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Rewards;

public class JarConfig
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public decimal WeeklyContribution { get; set; } = 50.00m;
    public DateTime StartDate { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
}

public class JarWeek
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public DateTime WeekStartDate { get; set; }
    public decimal MaxEarn { get; set; }
    public decimal UnlockedPercent { get; set; }
    public decimal UnlockedAmount => MaxEarn * UnlockedPercent;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
    public ICollection<JarWeekActivity> Activities { get; set; } = [];
}

public enum JarActivityType
{
    DailyQuestDay,
    WeeklyQuest,
    WorldBoss
}

public class JarWeekActivity
{
    public Guid Id { get; set; }
    public Guid JarWeekId { get; set; }
    public JarActivityType ActivityType { get; set; }
    public DateTime ActivityDate { get; set; }
    public decimal PercentAwarded { get; set; }
    public DateTime AwardedAt { get; set; }

    // Navigation property
    public JarWeek JarWeek { get; set; } = null!;
}