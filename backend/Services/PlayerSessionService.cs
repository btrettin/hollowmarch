using Hollowmarch.Models;
using Hollowmarch.Repositories;

namespace Hollowmarch.Services;

public class PlayerSessionService
{
    private readonly IPlayerSessionRepository _sessions;

    public PlayerSessionService(IPlayerSessionRepository sessions)
    {
        _sessions = sessions;
    }

    public Task<PlayerSession> StartSessionAsync(PlayerSession session, CancellationToken cancellationToken = default)
    {
        session.StartedAt = DateTime.UtcNow;
        session.IsActive = true;
        return _sessions.AddAsync(session, cancellationToken);
    }

    public Task<PlayerSession?> GetSessionAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _sessions.GetByIdAsync(id, cancellationToken);
    }

    public async Task RecordHeartbeatAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var session = await _sessions.GetByIdAsync(id, cancellationToken);
        if (session is null)
        {
            return;
        }

        session.LastHeartbeat = DateTime.UtcNow;
        await _sessions.UpdateAsync(session, cancellationToken);
    }

    public async Task<PlayerSession?> EndSessionAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var session = await _sessions.GetByIdAsync(id, cancellationToken);
        if (session is null)
        {
            return null;
        }

        session.EndedAt = DateTime.UtcNow;
        session.IsActive = false;
        await _sessions.UpdateAsync(session, cancellationToken);

        return session;
    }
}
