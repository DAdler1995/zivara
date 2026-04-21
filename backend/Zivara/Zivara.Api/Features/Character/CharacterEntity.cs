using Zivara.Api.Features.Auth;

namespace Zivara.Api.Features.Character;

public class CharacterEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public required string Name { get; set; }
    public string? TitleEquipped { get; set; }
    public string? AvatarCosmetics { get; set; } // JSON blob
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Skill> Skills { get; set; } = [];
}