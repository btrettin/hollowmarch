using Hollowmarch.Models;
using Hollowmarch.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hollowmarch.Api.Controllers;

[ApiController]
[Route("api/sessions")]
public class PlayerSessionsController : ControllerBase
{
    private readonly PlayerSessionService _sessions;
    private readonly GameEventService _events;

    public PlayerSessionsController(PlayerSessionService sessions, GameEventService events)
    {
        _sessions = sessions;
        _events = events;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] PlayerSession session, CancellationToken cancellationToken)
    {
        var created = await _sessions.StartSessionAsync(session, cancellationToken);

        await _events.BroadcastAsync(new GameEvent("player-joined", new
        {
            created.Id,
            created.PlayerId,
            created.IPAddress,
            created.StartedAt
        }));

        return Created($"/api/sessions/{created.Id}", created);
    }

    [HttpPut("{id:guid}/heartbeat")]
    public async Task<IActionResult> RecordHeartbeat(Guid id, CancellationToken cancellationToken)
    {
        await _sessions.RecordHeartbeatAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:guid}/disconnect")]
    public async Task<IActionResult> DisconnectSession(Guid id, CancellationToken cancellationToken)
    {
        var session = await _sessions.GetSessionAsync(id, cancellationToken);
        if (session is null)
        {
            return NotFound();
        }

        var endedSession = await _sessions.EndSessionAsync(id, cancellationToken);

        if (endedSession is not null)
        {
            await _events.BroadcastAsync(new GameEvent("player-left", new
            {
                endedSession.Id,
                endedSession.PlayerId,
                endedSession.IPAddress,
                endedSession.EndedAt
            }));
        }

        return NoContent();
    }
}
