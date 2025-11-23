using Hollowmarch.Models;
using Hollowmarch.Repositories;

namespace Hollowmarch.Services;

public class PlayerService
{
    private readonly IPlayerRepository _players;

    public PlayerService(IPlayerRepository players)
    {
        _players = players;
    }

    public Task<List<Player>> GetPlayersAsync(CancellationToken cancellationToken = default)
    {
        return _players.GetAllAsync(cancellationToken);
    }

    public Task<Player?> GetPlayerAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _players.GetByIdAsync(id, cancellationToken);
    }

    public Task<Player> CreatePlayerAsync(Player player, CancellationToken cancellationToken = default)
    {
        player.CreatedAt = DateTime.UtcNow;
        return _players.AddAsync(player, cancellationToken);
    }

    public async Task UpdateLastLoginAsync(Guid playerId, CancellationToken cancellationToken = default)
    {
        var player = await _players.GetByIdAsync(playerId, cancellationToken);
        if (player is null)
        {
            return;
        }

        player.LastLoginAt = DateTime.UtcNow;
        await _players.UpdateAsync(player, cancellationToken);
    }
}
