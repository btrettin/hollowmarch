using Hollowmarch.Models;

namespace Hollowmarch.Repositories;

public interface IPlayerSessionRepository
{
    Task<PlayerSession> AddAsync(PlayerSession session, CancellationToken cancellationToken = default);
    Task<PlayerSession?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task UpdateAsync(PlayerSession session, CancellationToken cancellationToken = default);
}
