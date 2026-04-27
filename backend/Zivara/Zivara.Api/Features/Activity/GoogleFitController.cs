using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Activity;

[ApiController]
[Route("api/v1/steps/google")]
public class GoogleFitController : ControllerBase
{
    private readonly IGoogleFitService _googleFitService;
    private readonly ICharacterService _characterService;

    public GoogleFitController(IGoogleFitService googleFitService, ICharacterService characterService)
    {
        _googleFitService = googleFitService;
        _characterService = characterService;
    }

    [HttpGet("auth-url")]
    [Authorize]
    public async Task<ActionResult<GoogleFitAuthUrlResponse>> GetAuthUrl()
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        var authUrl = _googleFitService.GetAuthUrl(characterId.Value);
        return Ok(new GoogleFitAuthUrlResponse(authUrl));
    }

    [HttpGet("callback")]
    public async Task<IActionResult> Callback(
        [FromQuery] string? code,
        [FromQuery] string? state,
        [FromQuery] string? error)
    {
        var frontendOrigin = _googleFitService.FrontendOrigin;

        if (error is not null || code is null || state is null)
            return Redirect($"{frontendOrigin}/dashboard?googlefit=error");

        try
        {
            await _googleFitService.ExchangeCodeAsync(code, state);
            return Redirect($"{frontendOrigin}/dashboard?googlefit=connected");
        }
        catch (Exception)
        {
            return Redirect($"{frontendOrigin}/dashboard?googlefit=error");
        }
    }

    [HttpGet("status")]
    [Authorize]
    public async Task<ActionResult<GoogleFitStatusResponse>> GetStatus()
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        var status = await _googleFitService.GetStatusAsync(characterId.Value);
        return Ok(status);
    }

    [HttpPost("sync")]
    [Authorize]
    public async Task<ActionResult<ActivityResponse>> SyncNow()
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        var result = await _googleFitService.SyncTodayAsync(characterId.Value);
        if (result is null) return BadRequest("Google Fit is not connected.");

        return Ok(result);
    }

    [HttpDelete("disconnect")]
    [Authorize]
    public async Task<IActionResult> Disconnect()
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        await _googleFitService.DisconnectAsync(characterId.Value);
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
