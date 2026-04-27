using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Zivara.Api.Data;
using Zivara.Api.Features.Character;
using Zivara.Api.Features.Quests;

namespace Zivara.Api.Features.Activity;

public interface IActivityService
{
    Task<ActivityResponse> LogMealAsync(Guid characterId, LogMealRequest request);
    Task<ActivityResponse> LogWorkoutAsync(Guid characterId, LogWorkoutRequest request);
    Task<ActivityResponse> LogWeightAsync(Guid characterId, LogWeightRequest request);
    Task<ActivityResponse> LogWaterAsync(Guid characterId, LogWaterRequest request);
    Task<bool> RemoveLastWaterLogAsync(Guid characterId);
    Task<ActivityResponse?> CheckInAsync(Guid characterId);
    Task<ActivityResponse> SyncStepsAsync(Guid characterId, SyncStepsRequest request);
    Task<TodayActivityResponse> GetTodayActivityAsync(Guid characterId);
}

public class ActivityService : IActivityService
{
    private readonly ZivaraDbContext _db;
    private readonly IXpService _xpService;
    private readonly IQuestProgressService _questProgressService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ActivityService(ZivaraDbContext db, IXpService xpService, IQuestProgressService questProgressService, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _xpService = xpService;
        _questProgressService = questProgressService;
        _httpContextAccessor = httpContextAccessor;
    }

    private (DateTime StartUtc, DateTime EndUtc, DateOnly LocalDate) GetTodayBounds()
    {
        var offsetStr = _httpContextAccessor.HttpContext?.Request.Headers["X-Client-Utc-Offset"].FirstOrDefault();
        if (int.TryParse(offsetStr, out var offsetMinutes))
        {
            var localNow = DateTime.UtcNow.AddMinutes(offsetMinutes);
            var localDate = DateOnly.FromDateTime(localNow);
            var startUtc = DateTime.SpecifyKind(
                localDate.ToDateTime(TimeOnly.MinValue).AddMinutes(-offsetMinutes),
                DateTimeKind.Utc);
            return (startUtc, startUtc.AddDays(1), localDate);
        }
        var utcDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var start = DateTime.SpecifyKind(utcDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        return (start, start.AddDays(1), utcDate);
    }

    public async Task<ActivityResponse> LogMealAsync(Guid characterId, LogMealRequest request)
    {
        var xpAmount = request.Rating switch
        {
            MealRating.Healthy => XpAwards.MealHealthy,
            MealRating.Neutral => XpAwards.MealNeutral,
            MealRating.Unhealthy => XpAwards.MealUnhealthy,
            _ => XpAwards.MealNeutral
        };

        var meal = new MealLog
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            Rating = request.Rating,
            Category = request.Category,
            FoodNotes = request.FoodNotes,
            HungerOrHabit = request.HungerOrHabit,
            LoggedAt = DateTime.UtcNow
        };

        _db.MealLogs.Add(meal);
        await _db.SaveChangesAsync();

        await _xpService.AwardXpAsync(characterId, SkillType.Nutrition, xpAmount, XpSource.MealLog, meal.Id);
        await _questProgressService.ProcessActivityAsync(characterId, SkillType.Nutrition, 1);

        return new ActivityResponse($"Meal logged. The realm takes note of your provisions.", xpAmount, "Nutrition");
    }

    public async Task<ActivityResponse> LogWorkoutAsync(Guid characterId, LogWorkoutRequest request)
    {
        var xpAmount = request.DurationMinutes switch
        {
            >= 60 => XpAwards.Workout60Min,
            >= 45 => XpAwards.Workout45Min,
            >= 30 => XpAwards.Workout30Min,
            >= 15 => XpAwards.Workout15Min,
            _ => 0
        };

        var workout = new WorkoutLog
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            DurationMinutes = request.DurationMinutes,
            Notes = request.Notes,
            LoggedAt = DateTime.UtcNow
        };

        _db.WorkoutLogs.Add(workout);
        await _db.SaveChangesAsync();

        if (xpAmount > 0)
            await _xpService.AwardXpAsync(characterId, SkillType.Endurance, xpAmount, XpSource.WorkoutLog, workout.Id);

        // Passive Discipline XP for logging any activity
        await _xpService.AwardXpAsync(characterId, SkillType.Discipline, XpAwards.PassiveActivityLog, XpSource.WorkoutLog, workout.Id);
        await _questProgressService.ProcessActivityAsync(characterId, SkillType.Endurance, request.DurationMinutes);

        return new ActivityResponse("Training logged. Your endurance grows.", xpAmount, "Endurance");
    }

    public async Task<ActivityResponse> LogWeightAsync(Guid characterId, LogWeightRequest request)
    {
        // Check if there was a previous weight log to determine bonus
        var lastLog = await _db.WeightLogs
            .Where(w => w.CharacterId == characterId)
            .OrderByDescending(w => w.LoggedAt)
            .FirstOrDefaultAsync();

        var xpAmount = XpAwards.WeightLog;
        var message = "Weight recorded. Vitality grows through awareness.";

        if (lastLog is not null && request.WeightLbs < lastLog.WeightLbs)
        {
            xpAmount += XpAwards.WeightLossBonus;
            message = "Weight recorded. Progress noted, adventurer.";
        }

        var weightLog = new WeightLog
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            WeightLbs = request.WeightLbs,
            LoggedAt = DateTime.UtcNow
        };

        _db.WeightLogs.Add(weightLog);
        await _db.SaveChangesAsync();

        await _xpService.AwardXpAsync(characterId, SkillType.Vitality, xpAmount, XpSource.WeightLog, weightLog.Id);
        await _questProgressService.ProcessActivityAsync(characterId, SkillType.Vitality, 1);

        return new ActivityResponse(message, xpAmount, "Vitality");
    }

    public async Task<ActivityResponse> LogWaterAsync(Guid characterId, LogWaterRequest request)
    {
        if (request.Glasses <= 0)
            return new ActivityResponse("No glasses logged.", 0, "Hydration");

        var (todayStartUtc, todayEndUtc, _) = GetTodayBounds();

        // Count glasses already logged today
        var glassesToday = await _db.WaterLogs
            .Where(w => w.CharacterId == characterId &&
                        w.LoggedAt >= todayStartUtc && w.LoggedAt < todayEndUtc)
            .SumAsync(w => w.Glasses);

        var waterLog = new WaterLog
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            Glasses = request.Glasses,
            LoggedAt = DateTime.UtcNow
        };

        _db.WaterLogs.Add(waterLog);
        await _db.SaveChangesAsync();

        var xpAmount = request.Glasses * XpAwards.WaterPerGlass;

        // Award daily bonus if crossing the 8 glass threshold
        var newTotal = glassesToday + request.Glasses;
        if (glassesToday < XpAwards.WaterDailyGoal && newTotal >= XpAwards.WaterDailyGoal)
        {
            xpAmount += XpAwards.WaterDailyBonus;
        }

        await _xpService.AwardXpAsync(characterId, SkillType.Hydration, xpAmount, XpSource.WaterLog, waterLog.Id);
        await _questProgressService.ProcessActivityAsync(characterId, SkillType.Hydration, request.Glasses);

        return new ActivityResponse("Water logged. The body endures.", xpAmount, "Hydration");
    }

    public async Task<bool> RemoveLastWaterLogAsync(Guid characterId)
    {
        var (todayStartUtc, todayEndUtc, _) = GetTodayBounds();

        var lastLog = await _db.WaterLogs
            .Where(w => w.CharacterId == characterId &&
                        w.LoggedAt >= todayStartUtc && w.LoggedAt < todayEndUtc)
            .OrderByDescending(w => w.LoggedAt)
            .FirstOrDefaultAsync();

        if (lastLog is null) return false;

        // Reverse XP for the removed glasses
        var xpToReverse = lastLog.Glasses * XpAwards.WaterPerGlass;

        // Check if daily bonus was awarded and needs reversing
        var glassesToday = await _db.WaterLogs
            .Where(w => w.CharacterId == characterId &&
                        w.LoggedAt >= todayStartUtc && w.LoggedAt < todayEndUtc)
            .SumAsync(w => w.Glasses);

        var glassesAfterRemoval = glassesToday - lastLog.Glasses;

        // If removing this log drops us below the daily goal, reverse the bonus too
        if (glassesToday >= XpAwards.WaterDailyGoal && glassesAfterRemoval < XpAwards.WaterDailyGoal)
        {
            xpToReverse += XpAwards.WaterDailyBonus;
        }

        _db.WaterLogs.Remove(lastLog);
        await _db.SaveChangesAsync();

        // Reverse XP by writing a negative XP event
        await _xpService.AwardXpAsync(characterId, SkillType.Hydration, -xpToReverse, XpSource.WaterLog);

        // Reverse quest progress
        await _questProgressService.ReverseProgressAsync(characterId, SkillType.Hydration, lastLog.Glasses);

        return true;
    }

    public async Task<ActivityResponse?> CheckInAsync(Guid characterId)
    {
        var (todayStartUtc, todayEndUtc, _) = GetTodayBounds();

        // Only allow one check-in per day
        var alreadyCheckedIn = await _db.ActivityLogs
            .AnyAsync(a => a.CharacterId == characterId &&
                           a.ActivityType == ActivityType.DailyCheckin &&
                           a.LoggedAt >= todayStartUtc && a.LoggedAt < todayEndUtc);

        if (alreadyCheckedIn) return null;

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            ActivityType = ActivityType.DailyCheckin,
            LoggedAt = DateTime.UtcNow
        };

        _db.ActivityLogs.Add(activityLog);
        await _db.SaveChangesAsync();

        await _xpService.AwardXpAsync(characterId, SkillType.Discipline, XpAwards.DailyCheckin, XpSource.DailyCheckin);
        await _questProgressService.ProcessActivityAsync(characterId, SkillType.Discipline, 1);

        return new ActivityResponse("The realm acknowledges your presence, adventurer.", XpAwards.DailyCheckin, "Discipline");
    }

    public async Task<ActivityResponse> SyncStepsAsync(Guid characterId, SyncStepsRequest request)
    {
        if (request.StepCount < 0)
            return new ActivityResponse("Invalid step count.", 0, "Agility");

        var xpToAward = CalculateStepXP(request.StepCount);

        // Check for existing sync log for this date -- idempotency
        var existingLog = await _db.StepSyncLogs
            .FirstOrDefaultAsync(s => s.CharacterId == characterId && s.SyncDate == request.Date);

        if (existingLog is not null)
        {
            var oldStepCount = existingLog.StepCount;
            var xpDelta = xpToAward - existingLog.XpAwarded;

            existingLog.StepCount = request.StepCount;
            existingLog.XpAwarded = xpToAward;
            existingLog.SyncedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            if (xpDelta > 0)
            {
                await _xpService.AwardXpAsync(characterId, SkillType.Agility, xpDelta, XpSource.StepSync);
                await _questProgressService.ProcessActivityAsync(characterId, SkillType.Agility, request.StepCount - oldStepCount);
            }

            return new ActivityResponse($"Steps updated for {request.Date}.", xpDelta, "Agility");
        }

        // First sync for this date
        var syncLog = new StepSyncLog
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            SyncDate = request.Date,
            StepCount = request.StepCount,
            XpAwarded = xpToAward,
            SyncedAt = DateTime.UtcNow
        };

        _db.StepSyncLogs.Add(syncLog);
        await _db.SaveChangesAsync();

        await _xpService.AwardXpAsync(characterId, SkillType.Agility, xpToAward, XpSource.StepSync);
        await _questProgressService.ProcessActivityAsync(characterId, SkillType.Agility, request.StepCount);

        return new ActivityResponse($"Steps synced. Agility trains with every road walked.", xpToAward, "Agility");
    }

    public async Task<TodayActivityResponse> GetTodayActivityAsync(Guid characterId)
    {
        var (todayStartUtc, todayEndUtc, todayLocal) = GetTodayBounds();

        var stepsToday = await _db.StepSyncLogs
            .Where(s => s.CharacterId == characterId && s.SyncDate == todayLocal)
            .Select(s => s.StepCount)
            .FirstOrDefaultAsync();

        var waterToday = await _db.WaterLogs
            .Where(w => w.CharacterId == characterId &&
                        w.LoggedAt >= todayStartUtc && w.LoggedAt < todayEndUtc)
            .SumAsync(w => w.Glasses);

        var mealsToday = await _db.MealLogs
            .Where(m => m.CharacterId == characterId &&
                        m.LoggedAt >= todayStartUtc && m.LoggedAt < todayEndUtc)
            .ToListAsync();

        var checkedIn = await _db.ActivityLogs
            .AnyAsync(a => a.CharacterId == characterId &&
                           a.ActivityType == ActivityType.DailyCheckin &&
                           a.LoggedAt >= todayStartUtc && a.LoggedAt < todayEndUtc);

        return new TodayActivityResponse(
            stepsToday,
            waterToday,
            mealsToday.Count,
            checkedIn,
            mealsToday.Select(m => new MealSummary(
                m.Id,
                m.Rating,
                m.Category,
                m.FoodNotes,
                m.HungerOrHabit,
                m.LoggedAt
            ))
        );
    }

    private static int CalculateStepXP(int stepCount)
    {
        const double baseRate = 2.0;
        const int capSteps = 15000;
        const int decayHalfLife = 5000;

        if (stepCount <= 0) return 0;
        if (stepCount <= capSteps) return (int)(stepCount * baseRate);

        var xpAtCap = capSteps * baseRate;
        var stepsOverCap = stepCount - capSteps;
        var xpAboveCap = baseRate * (decayHalfLife / Math.Log(2)) *
                         (1 - Math.Pow(0.5, (double)stepsOverCap / decayHalfLife));

        return (int)(xpAtCap + xpAboveCap);
    }
}