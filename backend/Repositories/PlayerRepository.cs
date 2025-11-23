using Hollowmarch.Data;
using Hollowmarch.Models;
using Microsoft.EntityFrameworkCore;

namespace Hollowmarch.Repositories;

public class PlayerRepository : IPlayerRepository
{
    private readonly AppDbContext _dbContext;

    public PlayerRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Player> AddAsync(Player player, CancellationToken cancellationToken = default)
    {
        _dbContext.Players.Add(player);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return player;
    }

    public Task<List<Player>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.Players
            .Include(p => p.Characters)
            .ToListAsync(cancellationToken);
    }

    public Task<Player?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Players
            .Include(p => p.Characters)
            .FirstOrDefaultAsync(player => player.Id == id, cancellationToken);
    }

    public async Task UpdateAsync(Player player, CancellationToken cancellationToken = default)
    {
        _dbContext.Players.Update(player);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
