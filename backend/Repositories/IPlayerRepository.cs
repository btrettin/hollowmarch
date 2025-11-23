using Hollowmarch.Models;

namespace Hollowmarch.Repositories;

public interface IPlayerRepository
{
    Task<Player> AddAsync(Player player, CancellationToken cancellationToken = default);

    Task<Player?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<List<Player>> GetAllAsync(CancellationToken cancellationToken = default);

    Task UpdateAsync(Player player, CancellationToken cancellationToken = default);
}
