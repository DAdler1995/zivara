namespace Zivara.Api.Features.Character;

public record SkillDto(
    SkillType SkillType,
    long TotalXP,
    int Level,
    long XpIntoCurrentLevel,
    long XpToNextLevel
);

public record CharacterDto(
    Guid Id,
    string Name,
    string? TitleEquipped,
    int TotalLevel,
    IEnumerable<SkillDto> Skills
);

public record CreateCharacterRequest(string Name);

public record UpdateNameRequest(string Name);

public record NameAvailabilityResponse(bool Available);