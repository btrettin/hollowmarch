using Hollowmarch.Models;
using Hollowmarch.Repositories;

namespace Hollowmarch.Services;

public class InventoryService
{
    private readonly IInventoryRepository _inventory;

    public InventoryService(IInventoryRepository inventory)
    {
        _inventory = inventory;
    }

    public Task<InventoryItem> AddItemAsync(InventoryItem item, CancellationToken cancellationToken = default)
    {
        item.CreatedAt = DateTime.UtcNow;
        return _inventory.AddAsync(item, cancellationToken);
    }

    public Task<List<InventoryItem>> GetInventoryAsync(Guid characterId, CancellationToken cancellationToken = default)
    {
        return _inventory.GetByCharacterAsync(characterId, cancellationToken);
    }

    public Task<InventoryItem?> GetInventoryItemAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _inventory.GetByIdAsync(id, cancellationToken);
    }

    public Task UpdateItemAsync(InventoryItem item, CancellationToken cancellationToken = default)
    {
        return _inventory.UpdateAsync(item, cancellationToken);
    }
}
