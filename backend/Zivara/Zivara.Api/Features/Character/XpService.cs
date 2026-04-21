using Zivara.Api.Data;
using Zivara.Api.Features.Activity;
using Microsoft.EntityFrameworkCore;

namespace Zivara.Api.Features.Character;

public interface IXpService
{
    Task AwardXpAsync(Guid characterId, SkillType skill, int amount, XpSource source, Guid? sourceEntityId = null);
}

public class XpService : IXpService
{
    private readonly ZivaraDbContext _db;
    private readonly ILogger<XpService> _logger;

    public XpService(ZivaraDbContext db, ILogger<XpService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task AwardXpAsync(Guid characterId, SkillType skill, int amount, XpSource source, Guid? sourceEntityId = null)
    {
        if (amount == 0) return;

        // Write the XP event
        var xpEvent = new XpEvent
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            SkillType = skill,
            XpAmount = amount,
            Source = source,
            SourceEntityId = sourceEntityId,
            AwardedAt = DateTime.UtcNow
        };

        _db.XpEvents.Add(xpEvent);

        var skillEntity = await _db.Skills
            .FirstOrDefaultAsync(s => s.CharacterId == characterId && s.SkillType == skill);

        if (skillEntity is null)
        {
            _logger.LogWarning("Skill {Skill} not found for character {CharacterId}", skill, characterId);
            return;
        }

        var previousLevel = skillEntity.Level;

        // Clamp TotalXP to 0 minimum -- XP cannot go below zero
        skillEntity.TotalXP = Math.Max(0, skillEntity.TotalXP + amount);
        skillEntity.Level = XpTable.GetLevelFromXP(skillEntity.TotalXP);
        skillEntity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        if (skillEntity.Level > previousLevel)
        {
            _logger.LogInformation(
                "Character {CharacterId} leveled up {Skill} from {PreviousLevel} to {NewLevel}",
                characterId, skill, previousLevel, skillEntity.Level);
        }
    }
}