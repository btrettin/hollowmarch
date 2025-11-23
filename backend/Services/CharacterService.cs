using Hollowmarch.Models;
using Hollowmarch.Repositories;

namespace Hollowmarch.Services;

public class CharacterService
{
    private readonly ICharacterRepository _characters;

    public CharacterService(ICharacterRepository characters)
    {
        _characters = characters;
    }

    public Task<Character> CreateCharacterAsync(Character character, CancellationToken cancellationToken = default)
    {
        character.CreatedAt = DateTime.UtcNow;
        character.UpdatedAt = DateTime.UtcNow;
        return _characters.AddAsync(character, cancellationToken);
    }

    public Task<Character?> GetCharacterAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _characters.GetByIdAsync(id, cancellationToken);
    }

    public Task<List<Character>> GetCharactersForPlayerAsync(Guid playerId, CancellationToken cancellationToken = default)
    {
        return _characters.GetByPlayerAsync(playerId, cancellationToken);
    }

    public async Task UpdateCharacterAsync(Character character, CancellationToken cancellationToken = default)
    {
        character.UpdatedAt = DateTime.UtcNow;
        await _characters.UpdateAsync(character, cancellationToken);
    }
}
