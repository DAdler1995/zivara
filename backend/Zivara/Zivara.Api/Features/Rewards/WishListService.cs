using Microsoft.EntityFrameworkCore;
using Zivara.Api.Data;

namespace Zivara.Api.Features.Rewards;

public interface IWishListService
{
    Task<IEnumerable<WishListItemDto>> GetItemsAsync(Guid characterId);
    Task<WishListItemDto> CreateItemAsync(Guid characterId, CreateWishListItemRequest request);
    Task<WishListItemDto?> UpdateItemAsync(Guid characterId, Guid itemId, UpdateWishListItemRequest request);
    Task<bool> DeleteItemAsync(Guid characterId, Guid itemId);
}

public class WishListService : IWishListService
{
    private readonly ZivaraDbContext _db;

    public WishListService(ZivaraDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<WishListItemDto>> GetItemsAsync(Guid characterId)
    {
        var items = await _db.WishListItems
            .Where(w => w.CharacterId == characterId)
            .OrderBy(w => w.CreatedAt)
            .ToListAsync();

        return items.Select(MapToDto);
    }

    public async Task<WishListItemDto> CreateItemAsync(Guid characterId, CreateWishListItemRequest request)
    {
        var item = new WishListItem
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            Label = request.Label,
            EstimatedCost = request.EstimatedCost,
            MilestoneTrigger = request.MilestoneTrigger,
            IsUnlocked = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.WishListItems.Add(item);
        await _db.SaveChangesAsync();

        return MapToDto(item);
    }

    public async Task<WishListItemDto?> UpdateItemAsync(Guid characterId, Guid itemId, UpdateWishListItemRequest request)
    {
        var item = await _db.WishListItems
            .FirstOrDefaultAsync(w => w.Id == itemId && w.CharacterId == characterId);

        if (item is null) return null;

        item.Label = request.Label;
        item.EstimatedCost = request.EstimatedCost;
        item.MilestoneTrigger = request.MilestoneTrigger;

        await _db.SaveChangesAsync();

        return MapToDto(item);
    }

    public async Task<bool> DeleteItemAsync(Guid characterId, Guid itemId)
    {
        var item = await _db.WishListItems
            .FirstOrDefaultAsync(w => w.Id == itemId && w.CharacterId == characterId);

        if (item is null) return false;

        _db.WishListItems.Remove(item);
        await _db.SaveChangesAsync();

        return true;
    }

    private static WishListItemDto MapToDto(WishListItem item) => new(
        item.Id,
        item.Label,
        item.EstimatedCost,
        item.MilestoneTrigger,
        item.IsUnlocked,
        item.UnlockedAt,
        item.CreatedAt
    );
}