using Hollowmarch.Models;

namespace Hollowmarch.Repositories;

public interface IInventoryRepository
{
    Task<InventoryItem> AddAsync(InventoryItem item, CancellationToken cancellationToken = default);

    Task<List<InventoryItem>> GetByCharacterAsync(Guid characterId, CancellationToken cancellationToken = default);

    Task<InventoryItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task UpdateAsync(InventoryItem item, CancellationToken cancellationToken = default);
}
