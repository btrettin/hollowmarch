using Hollowmarch.Data;
using Hollowmarch.Models;
using Microsoft.EntityFrameworkCore;

namespace Hollowmarch.Repositories;

public class PlayerSessionRepository : IPlayerSessionRepository
{
    private readonly AppDbContext _dbContext;

    public PlayerSessionRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PlayerSession> AddAsync(PlayerSession session, CancellationToken cancellationToken = default)
    {
        _dbContext.PlayerSessions.Add(session);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return session;
    }

    public Task<PlayerSession?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.PlayerSessions.FirstOrDefaultAsync(session => session.Id == id, cancellationToken);
    }

    public async Task UpdateAsync(PlayerSession session, CancellationToken cancellationToken = default)
    {
        _dbContext.PlayerSessions.Update(session);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
