namespace Zivara.Api.Features.Auth;

public class User
{
    public Guid Id { get; set; }
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Settings { get; set; } // JSON blob
}