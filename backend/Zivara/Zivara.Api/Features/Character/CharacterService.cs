using Microsoft.EntityFrameworkCore;
using Zivara.Api.Data;

namespace Zivara.Api.Features.Character;

public interface ICharacterService
{
    Task<CharacterDto?> GetCharacterAsync(Guid userId);
    Task<CharacterDto> CreateCharacterAsync(Guid userId, string name);
    Task<bool> IsNameAvailableAsync(string name);
    Task<CharacterDto?> UpdateNameAsync(Guid userId, string newName);
}

public class CharacterService : ICharacterService
{
    private readonly ZivaraDbContext _db;

    public CharacterService(ZivaraDbContext db)
    {
        _db = db;
    }

    public async Task<CharacterDto?> GetCharacterAsync(Guid userId)
    {
        var character = await _db.Characters
            .Include(c => c.Skills)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        return character is null ? null : MapToDto(character);
    }

    public async Task<CharacterDto> CreateCharacterAsync(Guid userId, string name)
    {
        var character = new CharacterEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name,
            CreatedAt = DateTime.UtcNow
        };

        _db.Characters.Add(character);

        // Seed all six skills at level 1 with 0 XP
        var skillTypes = Enum.GetValues<SkillType>();
        foreach (var skillType in skillTypes)
        {
            _db.Skills.Add(new Skill
            {
                Id = Guid.NewGuid(),
                CharacterId = character.Id,
                SkillType = skillType,
                TotalXP = 0,
                Level = 1,
                UpdatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();

        // Reload with skills included
        return (await GetCharacterAsync(userId))!;
    }

    public async Task<bool> IsNameAvailableAsync(string name)
    {
        return !await _db.Characters.AnyAsync(c => c.Name == name);
    }

    public async Task<CharacterDto?> UpdateNameAsync(Guid userId, string newName)
    {
        var character = await _db.Characters
            .Include(c => c.Skills)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (character is null) return null;

        // Enforce 30 day name change cooldown
        if (character.LastNameChangedAt.HasValue &&
            character.LastNameChangedAt.Value.AddDays(30) > DateTime.UtcNow)
            return null;

        // Check name availability
        var available = await IsNameAvailableAsync(newName);
        if (!available) return null;

        character.Name = newName;
        character.LastNameChangedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(character);
    }

    private static CharacterDto MapToDto(CharacterEntity character)
    {
        var skills = character.Skills.Select(s => new SkillDto(
            s.SkillType,
            s.TotalXP,
            s.Level,
            XpTable.GetXPIntoCurrentLevel(s.TotalXP, s.Level),
            XpTable.GetXPToNextLevel(s.TotalXP, s.Level)
        ));

        return new CharacterDto(
            character.Id,
            character.Name,
            character.TitleEquipped,
            character.Skills.Sum(s => s.Level),
            skills
        );
    }
}