using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Zivara.Api.Features.Character;

[ApiController]
[Route("api/v1/character")]
[Authorize]
public class CharacterController : ControllerBase
{
    private readonly ICharacterService _characterService;

    public CharacterController(ICharacterService characterService)
    {
        _characterService = characterService;
    }

    [HttpGet]
    public async Task<ActionResult<CharacterDto>> GetCharacter()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var character = await _characterService.GetCharacterAsync(userId.Value);
        if (character is null) return NotFound("No character found for this account.");

        return Ok(character);
    }

    [HttpGet("name/availability/{name}")]
    [AllowAnonymous]
    public async Task<ActionResult<NameAvailabilityResponse>> CheckNameAvailability(string name)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length > 20)
            return BadRequest("Name must be between 1 and 20 characters.");

        var available = await _characterService.IsNameAvailableAsync(name);
        return Ok(new NameAvailabilityResponse(available));
    }

    [HttpPut("name")]
    public async Task<ActionResult<CharacterDto>> UpdateName(UpdateNameRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 20)
            return BadRequest("Name must be between 1 and 20 characters.");

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _characterService.UpdateNameAsync(userId.Value, request.Name);
        if (result is null)
            return Conflict("Name is unavailable or you must wait 30 days between name changes.");

        return Ok(result);
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}