using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Activity;

[ApiController]
[Route("api/v1/activity")]
[Authorize]
public class ActivityController : ControllerBase
{
    private readonly IActivityService _activityService;
    private readonly ICharacterService _characterService;

    public ActivityController(IActivityService activityService, ICharacterService characterService)
    {
        _activityService = activityService;
        _characterService = characterService;
    }

    [HttpPost("meal")]
    public async Task<ActionResult<ActivityResponse>> LogMeal(LogMealRequest request)
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        var result = await _activityService.LogMealAsync(characterId.Value, request);
        return Ok(result);
    }

    [HttpPost("workout")]
    public async Task<ActionResult<ActivityResponse>> LogWorkout(LogWorkoutRequest request)
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        if (request.DurationMinutes < 15)
            return BadRequest("Workouts must be at least 15 minutes to earn XP.");

        var result = await _activityService.LogWorkoutAsync(characterId.Value, request);
        return Ok(result);
    }

    [HttpPost("weight")]
    public async Task<ActionResult<ActivityResponse>> LogWeight(LogWeightRequest request)
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        if (request.WeightLbs <= 0)
            return BadRequest("Weight must be a positive value.");

        var result = await _activityService.LogWeightAsync(characterId.Value, request);
        return Ok(result);
    }

    [HttpPost("water")]
    public async Task<ActionResult<ActivityResponse>> LogWater(LogWaterRequest request)
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        if (request.Glasses <= 0)
            return BadRequest("Glasses must be a positive value.");

        var result = await _activityService.LogWaterAsync(characterId.Value, request);
        return Ok(result);
    }

    [HttpDelete("water/today/last")]
    public async Task<IActionResult> RemoveLastWater()
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        var removed = await _activityService.RemoveLastWaterLogAsync(characterId.Value);
        if (!removed) return NotFound("No water logged today to remove.");

        return NoContent();
    }

    [HttpPost("checkin")]
    public async Task<ActionResult<ActivityResponse>> CheckIn()
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        var result = await _activityService.CheckInAsync(characterId.Value);
        if (result is null)
            return Conflict("You have already checked in today, adventurer.");

        return Ok(result);
    }

    [HttpGet("today")]
    public async Task<ActionResult<TodayActivityResponse>> GetTodayActivity()
    {
        var characterId = await GetCharacterIdAsync();
        if (characterId is null) return NotFound("No character found for this account.");

        var result = await _activityService.GetTodayActivityAsync(characterId.Value);
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