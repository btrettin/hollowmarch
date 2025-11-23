using Hollowmarch.Models;

namespace Hollowmarch.Repositories;

public interface IItemRepository
{
    Task<Item> AddAsync(Item item, CancellationToken cancellationToken = default);

    Task<Item?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<List<Item>> GetAllAsync(CancellationToken cancellationToken = default);

    Task UpdateAsync(Item item, CancellationToken cancellationToken = default);
}
