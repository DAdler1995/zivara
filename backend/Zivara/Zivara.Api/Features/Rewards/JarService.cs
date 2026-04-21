using Microsoft.EntityFrameworkCore;
using Zivara.Api.Data;

namespace Zivara.Api.Features.Rewards;

public interface IJarService
{
    Task EnsureJarConfigAsync(Guid characterId);
    Task EnsureCurrentWeekAsync(Guid characterId);
    Task AwardDailyQuestDayAsync(Guid characterId);
    Task<JarSummaryResponse> GetJarSummaryAsync(Guid characterId);
    Task<JarWeekResponse> GetCurrentWeekAsync(Guid characterId);
    Task UpdateJarConfigAsync(Guid characterId, decimal weeklyContribution);
}

public class JarService : IJarService
{
    private readonly ZivaraDbContext _db;

    public JarService(ZivaraDbContext db)
    {
        _db = db;
    }

    public async Task EnsureJarConfigAsync(Guid characterId)
    {
        var exists = await _db.JarConfigs.AnyAsync(j => j.CharacterId == characterId);
        if (exists) return;

        _db.JarConfigs.Add(new JarConfig
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            WeeklyContribution = 50.00m,
            StartDate = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
    }

    public async Task EnsureCurrentWeekAsync(Guid characterId)
    {
        await EnsureJarConfigAsync(characterId);

        var weekStart = GetCurrentWeekStart();
        var exists = await _db.JarWeeks
            .AnyAsync(w => w.CharacterId == characterId && w.WeekStartDate == weekStart);

        if (exists) return;

        var config = await _db.JarConfigs.FirstAsync(j => j.CharacterId == characterId);

        _db.JarWeeks.Add(new JarWeek
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            WeekStartDate = weekStart,
            MaxEarn = config.WeeklyContribution,
            UnlockedPercent = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
    }

    public async Task AwardDailyQuestDayAsync(Guid characterId)
    {
        await EnsureCurrentWeekAsync(characterId);

        var weekStart = GetCurrentWeekStart();
        var today = DateTime.UtcNow.Date;

        var week = await _db.JarWeeks
            .Include(w => w.Activities)
            .FirstAsync(w => w.CharacterId == characterId && w.WeekStartDate == weekStart);

        // Check if daily quest day already awarded today
        var alreadyAwarded = week.Activities.Any(a =>
            a.ActivityType == JarActivityType.DailyQuestDay &&
            a.ActivityDate.Date == today);

        if (alreadyAwarded) return;

        const decimal dailyQuestPercent = 0.10m;

        week.Activities.Add(new JarWeekActivity
        {
            Id = Guid.NewGuid(),
            JarWeekId = week.Id,
            ActivityType = JarActivityType.DailyQuestDay,
            ActivityDate = DateTime.UtcNow,
            PercentAwarded = dailyQuestPercent,
            AwardedAt = DateTime.UtcNow
        });

        week.UnlockedPercent = Math.Min(1.0m, week.UnlockedPercent + dailyQuestPercent);
        week.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task<JarSummaryResponse> GetJarSummaryAsync(Guid characterId)
    {
        await EnsureCurrentWeekAsync(characterId);

        var weekStart = GetCurrentWeekStart();

        // Sum all unlocked amounts across all weeks
        var totalUnlocked = await _db.JarWeeks
            .Where(w => w.CharacterId == characterId)
            .SumAsync(w => w.MaxEarn * w.UnlockedPercent);

        var currentWeek = await _db.JarWeeks
            .Include(w => w.Activities)
            .FirstAsync(w => w.CharacterId == characterId && w.WeekStartDate == weekStart);

        var dailyQuestDays = currentWeek.Activities
            .Count(a => a.ActivityType == JarActivityType.DailyQuestDay);

        var weeklyQuestCompleted = currentWeek.Activities
            .Any(a => a.ActivityType == JarActivityType.WeeklyQuest);

        var worldBossKilled = currentWeek.Activities
            .Any(a => a.ActivityType == JarActivityType.WorldBoss);

        return new JarSummaryResponse(
            Math.Round(totalUnlocked, 2),
            currentWeek.MaxEarn,
            Math.Round(currentWeek.UnlockedAmount, 2),
            currentWeek.UnlockedPercent,
            dailyQuestDays,
            weeklyQuestCompleted,
            worldBossKilled
        );
    }

    public async Task<JarWeekResponse> GetCurrentWeekAsync(Guid characterId)
    {
        await EnsureCurrentWeekAsync(characterId);

        var weekStart = GetCurrentWeekStart();

        var week = await _db.JarWeeks
            .Include(w => w.Activities)
            .FirstAsync(w => w.CharacterId == characterId && w.WeekStartDate == weekStart);

        return MapToDto(week);
    }

    public async Task UpdateJarConfigAsync(Guid characterId, decimal weeklyContribution)
    {
        await EnsureJarConfigAsync(characterId);

        var config = await _db.JarConfigs.FirstAsync(j => j.CharacterId == characterId);
        config.WeeklyContribution = weeklyContribution;

        await _db.SaveChangesAsync();
    }

    private static DateTime GetCurrentWeekStart()
    {
        var today = DateTime.UtcNow.Date;
        var daysFromMonday = ((int)today.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
        return today.AddDays(-daysFromMonday);
    }

    private static JarWeekResponse MapToDto(JarWeek week) => new(
        week.Id,
        week.WeekStartDate,
        week.MaxEarn,
        week.UnlockedPercent,
        week.UnlockedAmount,
        week.Activities.Select(a => new JarWeekActivityDto(
            a.ActivityType,
            a.ActivityDate,
            a.PercentAwarded
        ))
    );
}