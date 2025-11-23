using Hollowmarch.Models;
using Hollowmarch.Repositories;

namespace Hollowmarch.Services;

public class ItemService
{
    private readonly IItemRepository _items;

    public ItemService(IItemRepository items)
    {
        _items = items;
    }

    public Task<Item> CreateItemAsync(Item item, CancellationToken cancellationToken = default)
    {
        return _items.AddAsync(item, cancellationToken);
    }

    public Task<Item?> GetItemAsync(int id, CancellationToken cancellationToken = default)
    {
        return _items.GetByIdAsync(id, cancellationToken);
    }

    public Task<List<Item>> GetItemsAsync(CancellationToken cancellationToken = default)
    {
        return _items.GetAllAsync(cancellationToken);
    }

    public Task UpdateItemAsync(Item item, CancellationToken cancellationToken = default)
    {
        return _items.UpdateAsync(item, cancellationToken);
    }
}
