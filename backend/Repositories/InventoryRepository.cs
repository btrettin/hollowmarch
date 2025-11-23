using Hollowmarch.Data;
using Hollowmarch.Models;
using Microsoft.EntityFrameworkCore;

namespace Hollowmarch.Repositories;

public class InventoryRepository : IInventoryRepository
{
    private readonly AppDbContext _dbContext;

    public InventoryRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<InventoryItem> AddAsync(InventoryItem item, CancellationToken cancellationToken = default)
    {
        _dbContext.InventoryItems.Add(item);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return item;
    }

    public Task<List<InventoryItem>> GetByCharacterAsync(Guid characterId, CancellationToken cancellationToken = default)
    {
        return _dbContext.InventoryItems
            .Where(i => i.CharacterId == characterId)
            .Include(i => i.Item)
            .ToListAsync(cancellationToken);
    }

    public Task<InventoryItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.InventoryItems
            .Include(i => i.Item)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task UpdateAsync(InventoryItem item, CancellationToken cancellationToken = default)
    {
        _dbContext.InventoryItems.Update(item);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
