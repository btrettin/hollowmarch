using Hollowmarch.Models;

namespace Hollowmarch.Repositories;

public interface ICharacterRepository
{
    Task<Character> AddAsync(Character character, CancellationToken cancellationToken = default);

    Task<Character?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<List<Character>> GetByPlayerAsync(Guid playerId, CancellationToken cancellationToken = default);

    Task UpdateAsync(Character character, CancellationToken cancellationToken = default);
}
