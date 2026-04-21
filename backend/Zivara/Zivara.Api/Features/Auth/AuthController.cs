using Microsoft.AspNetCore.Mvc;

namespace Zivara.Api.Features.Auth;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Username and password are required.");

        var result = await _authService.RegisterAsync(request);
        if (result is null)
            return Conflict("Username is already taken.");

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (result is null)
            return Unauthorized("Invalid username or password.");

        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] string refreshToken)
    {
        var result = await _authService.RefreshAsync(refreshToken);
        if (result is null)
            return Unauthorized("Invalid or expired refresh token.");

        return Ok(result);
    }
}