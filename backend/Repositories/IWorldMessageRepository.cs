using Hollowmarch.Models;

namespace Hollowmarch.Repositories;

public interface IWorldMessageRepository
{
    Task<WorldMessage> AddAsync(WorldMessage message, CancellationToken cancellationToken = default);
}
