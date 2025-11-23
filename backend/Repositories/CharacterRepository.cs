using Hollowmarch.Data;
using Hollowmarch.Models;
using Microsoft.EntityFrameworkCore;

namespace Hollowmarch.Repositories;

public class CharacterRepository : ICharacterRepository
{
    private readonly AppDbContext _dbContext;

    public CharacterRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Character> AddAsync(Character character, CancellationToken cancellationToken = default)
    {
        _dbContext.Characters.Add(character);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return character;
    }

    public Task<Character?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _dbContext.Characters
            .Include(c => c.Zone)
            .Include(c => c.InventoryItems)
            .FirstOrDefaultAsync(character => character.Id == id, cancellationToken);
    }

    public Task<List<Character>> GetByPlayerAsync(Guid playerId, CancellationToken cancellationToken = default)
    {
        return _dbContext.Characters
            .Where(character => character.PlayerId == playerId)
            .Include(c => c.Zone)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(Character character, CancellationToken cancellationToken = default)
    {
        _dbContext.Characters.Update(character);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
