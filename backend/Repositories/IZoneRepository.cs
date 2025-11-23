using Hollowmarch.Models;

namespace Hollowmarch.Repositories;

public interface IZoneRepository
{
    Task<Zone> AddAsync(Zone zone, CancellationToken cancellationToken = default);

    Task<List<Zone>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<Zone?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task UpdateAsync(Zone zone, CancellationToken cancellationToken = default);
}
