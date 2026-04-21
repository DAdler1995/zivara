using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Quests;

[ApiController]
[Route("api/v1/quests")]
[Authorize]
public class QuestsController : ControllerBase
{
    private readonly IQuestService _questService;
    private readonly ICharacterService _characterService;

    public QuestsController(IQuestService questService, ICharacterService characterService)
    {
        _questService = questService;
        _characterService = characterService;
    }

    [HttpGet("daily")]
    public async Task<ActionResult<DailyQuestsResponse>> GetDailyQuests()
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        var result = await _questService.GetDailyQuestsAsync(characterId.Value);
        return Ok(result);
    }

    private async Task<Guid?> GetCharacterIdAsync()
    {
        var userId = GetUserId();
        if (userId is null) return null;

        var character = await _characterService.GetCharacterAsync(userId.Value);
        return character?.Id;
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}