namespace Zivara.Api.Features.Rewards;

public record JarSummaryResponse(
    decimal TotalUnlockedBalance,
    decimal CurrentWeekMaxEarn,
    decimal CurrentWeekUnlockedAmount,
    decimal CurrentWeekUnlockedPercent,
    int DailyQuestDaysCompletedThisWeek,
    bool WeeklyQuestCompleted,
    bool WorldBossKilledThisWeek
);

public record JarWeekResponse(
    Guid Id,
    DateTime WeekStartDate,
    decimal MaxEarn,
    decimal UnlockedPercent,
    decimal UnlockedAmount,
    IEnumerable<JarWeekActivityDto> Activities
);

public record JarWeekActivityDto(
    JarActivityType ActivityType,
    DateTime ActivityDate,
    decimal PercentAwarded
);

public record UpdateJarConfigRequest(
    decimal WeeklyContribution
);