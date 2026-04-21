namespace Zivara.Api.Features.Rewards;

public record WishListItemDto(
    Guid Id,
    string Label,
    decimal? EstimatedCost,
    string? MilestoneTrigger,
    bool IsUnlocked,
    DateTime? UnlockedAt,
    DateTime CreatedAt
);

public record CreateWishListItemRequest(
    string Label,
    decimal? EstimatedCost,
    string? MilestoneTrigger
);

public record UpdateWishListItemRequest(
    string Label,
    decimal? EstimatedCost,
    string? MilestoneTrigger
);