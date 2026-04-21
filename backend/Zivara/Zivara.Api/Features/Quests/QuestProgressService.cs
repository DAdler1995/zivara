using Microsoft.EntityFrameworkCore;
using Zivara.Api.Data;
using Zivara.Api.Features.Activity;
using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Quests;

public interface IQuestProgressService
{
    Task ProcessActivityAsync(Guid characterId, SkillType skill, int value);
}

public class QuestProgressService : IQuestProgressService
{
    private readonly ZivaraDbContext _db;
    private readonly IXpService _xpService;
    private readonly ILogger<QuestProgressService> _logger;

    public QuestProgressService(ZivaraDbContext db, IXpService xpService, ILogger<QuestProgressService> logger)
    {
        _db = db;
        _xpService = xpService;
        _logger = logger;
    }

    public async Task ProcessActivityAsync(Guid characterId, SkillType skill, int value)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var todayStart = today.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        // Load active daily quests for this skill
        var activeQuests = await _db.Quests
            .Where(q => q.CharacterId == characterId &&
                        q.QuestType == QuestType.Daily &&
                        q.SkillTarget == skill &&
                        q.Status == QuestStatus.Active &&
                        q.GeneratedAt >= todayStart)
            .ToListAsync();

        if (activeQuests.Count == 0) return;

        foreach (var quest in activeQuests)
        {
            quest.CurrentValue += value;

            if (quest.CurrentValue >= quest.TargetValue)
            {
                quest.CurrentValue = quest.TargetValue;
                quest.Status = QuestStatus.Completed;
                quest.CompletedAt = DateTime.UtcNow;

                // Award quest completion XP to Discipline
                var questXp = GetQuestCompletionXp(skill);
                await _xpService.AwardXpAsync(
                    characterId,
                    SkillType.Discipline,
                    questXp,
                    XpSource.QuestComplete,
                    quest.Id);

                _logger.LogInformation(
                    "Character {CharacterId} completed quest {QuestId} for skill {Skill}",
                    characterId, quest.Id, skill);
            }
        }

        await _db.SaveChangesAsync();

        // Check if all three daily quests are now completed
        await CheckAllQuestsCompletedAsync(characterId, todayStart);
    }

    private async Task CheckAllQuestsCompletedAsync(Guid characterId, DateTime todayStart)
    {
        var todayQuests = await _db.Quests
            .Where(q => q.CharacterId == characterId &&
                        q.QuestType == QuestType.Daily &&
                        q.GeneratedAt >= todayStart)
            .ToListAsync();

        if (todayQuests.Count != 3) return;
        if (!todayQuests.All(q => q.Status == QuestStatus.Completed)) return;

        // Check if bonus XP has already been awarded today
        var bonusAlreadyAwarded = await _db.XpEvents
            .AnyAsync(e => e.CharacterId == characterId &&
                           e.Source == XpSource.QuestComplete &&
                           e.XpAmount == XpAwards.AllQuestsBonus &&
                           e.AwardedAt >= todayStart);

        if (bonusAlreadyAwarded) return;

        await _xpService.AwardXpAsync(
            characterId,
            SkillType.Discipline,
            XpAwards.AllQuestsBonus,
            XpSource.QuestComplete);

        _logger.LogInformation(
            "Character {CharacterId} completed all daily quests, bonus XP awarded",
            characterId);
    }

    private static int GetQuestCompletionXp(SkillType skill)
    {
        // Base quest completion XP -- scales with skill tier in Phase 2
        return 150;
    }
}