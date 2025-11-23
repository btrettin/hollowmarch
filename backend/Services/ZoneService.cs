using Hollowmarch.Models;
using Hollowmarch.Repositories;

namespace Hollowmarch.Services;

public class ZoneService
{
    private readonly IZoneRepository _zones;

    public ZoneService(IZoneRepository zones)
    {
        _zones = zones;
    }

    public Task<Zone> CreateZoneAsync(Zone zone, CancellationToken cancellationToken = default)
    {
        return _zones.AddAsync(zone, cancellationToken);
    }

    public Task<List<Zone>> GetZonesAsync(CancellationToken cancellationToken = default)
    {
        return _zones.GetAllAsync(cancellationToken);
    }

    public Task<Zone?> GetZoneAsync(int id, CancellationToken cancellationToken = default)
    {
        return _zones.GetByIdAsync(id, cancellationToken);
    }

    public Task UpdateZoneAsync(Zone zone, CancellationToken cancellationToken = default)
    {
        return _zones.UpdateAsync(zone, cancellationToken);
    }
}
