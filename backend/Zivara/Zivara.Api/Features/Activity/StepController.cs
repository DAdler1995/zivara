using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Activity;

[ApiController]
[Route("api/v1/steps")]
[Authorize]
public class StepsController : ControllerBase
{
    private readonly IActivityService _activityService;
    private readonly ICharacterService _characterService;

    public StepsController(IActivityService activityService, ICharacterService characterService)
    {
        _activityService = activityService;
        _characterService = characterService;
    }

    [HttpPost("sync")]
    public async Task<ActionResult<ActivityResponse>> SyncSteps(SyncStepsRequest request)
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        if (request.StepCount < 0)
            return BadRequest("Step count cannot be negative.");

        var result = await _activityService.SyncStepsAsync(characterId.Value, request);
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