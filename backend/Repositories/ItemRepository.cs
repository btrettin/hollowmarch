using Hollowmarch.Data;
using Hollowmarch.Models;
using Microsoft.EntityFrameworkCore;

namespace Hollowmarch.Repositories;

public class ItemRepository : IItemRepository
{
    private readonly AppDbContext _dbContext;

    public ItemRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Item> AddAsync(Item item, CancellationToken cancellationToken = default)
    {
        _dbContext.Items.Add(item);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return item;
    }

    public Task<List<Item>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.Items.ToListAsync(cancellationToken);
    }

    public Task<Item?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Items.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    }

    public async Task UpdateAsync(Item item, CancellationToken cancellationToken = default)
    {
        _dbContext.Items.Update(item);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
