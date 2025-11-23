using Hollowmarch.Data;
using Hollowmarch.Models;
using Microsoft.EntityFrameworkCore;

namespace Hollowmarch.Repositories;

public class ZoneRepository : IZoneRepository
{
    private readonly AppDbContext _dbContext;

    public ZoneRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Zone> AddAsync(Zone zone, CancellationToken cancellationToken = default)
    {
        _dbContext.Zones.Add(zone);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return zone;
    }

    public Task<List<Zone>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return _dbContext.Zones.ToListAsync(cancellationToken);
    }

    public Task<Zone?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Zones.FirstOrDefaultAsync(zone => zone.Id == id, cancellationToken);
    }

    public async Task UpdateAsync(Zone zone, CancellationToken cancellationToken = default)
    {
        _dbContext.Zones.Update(zone);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
