using Microsoft.EntityFrameworkCore;
using Zivara.Api.Data;
using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Quests;

public interface IQuestService
{
    Task GenerateDailyQuestsAsync(Guid characterId);
    Task<DailyQuestsResponse> GetDailyQuestsAsync(Guid characterId);
    Task ExpireOldQuestsAsync();
}

public class QuestService : IQuestService
{
    private readonly ZivaraDbContext _db;
    private readonly Random _random = new();

    public QuestService(ZivaraDbContext db)
    {
        _db = db;
    }

    public async Task GenerateDailyQuestsAsync(Guid characterId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var todayStart = today.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var todayEnd = today.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

        // Do not generate if quests already exist for today
        var existingQuests = await _db.Quests
            .AnyAsync(q => q.CharacterId == characterId &&
                           q.QuestType == QuestType.Daily &&
                           q.GeneratedAt >= todayStart &&
                           q.GeneratedAt <= todayEnd);

        if (existingQuests) return;

        // Load character skills to determine quest tiers
        var skills = await _db.Skills
            .Where(s => s.CharacterId == characterId)
            .ToListAsync();

        // Pick three different skills for today's quests
        var allSkills = Enum.GetValues<SkillType>().ToList();
        var selectedSkills = allSkills
            .OrderBy(_ => _random.Next())
            .Take(3)
            .ToList();

        var expiry = todayEnd;

        foreach (var skillType in selectedSkills)
        {
            var skill = skills.FirstOrDefault(s => s.SkillType == skillType);
            var tier = QuestTemplates.GetTierForLevel(skill?.Level ?? 1);
            var template = QuestTemplates.GetRandom(skillType, tier, _random);

            var quest = new Quest
            {
                Id = Guid.NewGuid(),
                CharacterId = characterId,
                QuestType = QuestType.Daily,
                SkillTarget = skillType,
                TargetValue = template.TargetValue,
                CurrentValue = 0,
                TemplateKey = template.Key,
                Description = template.Description,
                Status = QuestStatus.Active,
                GeneratedAt = DateTime.UtcNow,
                ExpiresAt = expiry
            };

            _db.Quests.Add(quest);
        }

        await _db.SaveChangesAsync();
    }

    public async Task<DailyQuestsResponse> GetDailyQuestsAsync(Guid characterId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var todayStart = today.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        // Generate quests if none exist for today
        await GenerateDailyQuestsAsync(characterId);

        var quests = await _db.Quests
            .Where(q => q.CharacterId == characterId &&
                        q.QuestType == QuestType.Daily &&
                        q.GeneratedAt >= todayStart)
            .OrderBy(q => q.GeneratedAt)
            .ToListAsync();

        var allCompleted = quests.Count > 0 && quests.All(q => q.Status == QuestStatus.Completed);

        return new DailyQuestsResponse(
            quests.Select(MapToDto),
            allCompleted
        );
    }

    public async Task ExpireOldQuestsAsync()
    {
        var now = DateTime.UtcNow;

        var expiredQuests = await _db.Quests
            .Where(q => q.Status == QuestStatus.Active && q.ExpiresAt < now)
            .ToListAsync();

        foreach (var quest in expiredQuests)
        {
            quest.Status = QuestStatus.Expired;
        }

        if (expiredQuests.Count > 0)
            await _db.SaveChangesAsync();
    }

    private static QuestDto MapToDto(Quest quest) => new(
        quest.Id,
        quest.SkillTarget,
        quest.Description,
        quest.TargetValue,
        quest.CurrentValue,
        quest.Status,
        quest.ExpiresAt
    );
}