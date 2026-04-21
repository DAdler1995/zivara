using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Quests;

public record QuestDto(
    Guid Id,
    SkillType SkillTarget,
    string Description,
    int TargetValue,
    int CurrentValue,
    QuestStatus Status,
    DateTime ExpiresAt
);

public record DailyQuestsResponse(
    IEnumerable<QuestDto> Quests,
    bool AllCompleted
);