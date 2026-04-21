using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Rewards;

[ApiController]
[Route("api/v1/rewards")]
[Authorize]
public class RewardsController : ControllerBase
{
    private readonly IJarService _jarService;
    private readonly ICharacterService _characterService;

    public RewardsController(IJarService jarService, ICharacterService characterService)
    {
        _jarService = jarService;
        _characterService = characterService;
    }

    [HttpGet("jar")]
    public async Task<ActionResult<JarSummaryResponse>> GetJarSummary()
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        var result = await _jarService.GetJarSummaryAsync(characterId.Value);
        return Ok(result);
    }

    [HttpGet("jar/week/current")]
    public async Task<ActionResult<JarWeekResponse>> GetCurrentWeek()
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        var result = await _jarService.GetCurrentWeekAsync(characterId.Value);
        return Ok(result);
    }

    [HttpPut("jar/config")]
    public async Task<IActionResult> UpdateJarConfig(UpdateJarConfigRequest request)
    {
        if (request.WeeklyContribution <= 0)
            return BadRequest("Weekly contribution must be a positive value.");

        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        await _jarService.UpdateJarConfigAsync(characterId.Value, request.WeeklyContribution);
        return NoContent();
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