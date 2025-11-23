using Hollowmarch.Data;
using Hollowmarch.Models;

namespace Hollowmarch.Repositories;

public class WorldMessageRepository : IWorldMessageRepository
{
    private readonly AppDbContext _dbContext;

    public WorldMessageRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<WorldMessage> AddAsync(WorldMessage message, CancellationToken cancellationToken = default)
    {
        _dbContext.WorldMessages.Add(message);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return message;
    }
}
