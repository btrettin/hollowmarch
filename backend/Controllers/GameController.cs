using Hollowmarch.Models;
using Hollowmarch.Repositories;
using Hollowmarch.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hollowmarch.Api.Controllers;

[ApiController]
[Route("api")]
public class GameController : ControllerBase
{
    private readonly GameEventService _events;
    private readonly IWorldMessageRepository _worldMessages;
    private readonly IPlayerSessionRepository _playerSessions;

    public GameController(
        GameEventService events,
        IWorldMessageRepository worldMessages,
        IPlayerSessionRepository playerSessions)
    {
        _events = events;
        _worldMessages = worldMessages;
        _playerSessions = playerSessions;
    }

    // GET /api/world
    [HttpGet("world")]
    public async Task<IActionResult> GetWorld()
    {
        return Ok(new
        {
            // onlinePlayers,
            serverTime = DateTime.UtcNow,
            motd =  "Welcome to Hollowmarch number 4!"
        });
    }

    // POST /api/world/messages
    [HttpPost("world/messages")]
    public async Task<IActionResult> PostWorldMessage([FromBody] WorldMessage message)
    {
        message.CreatedAt = DateTime.UtcNow;
        await _worldMessages.AddAsync(message);

        await _events.BroadcastAsync(new GameEvent("world-message", new
        {
            message.Id,
            message.Content,
            message.CreatedAt
        }));

        return Created($"/api/world/messages/{message.Id}", message);
    }

    // POST /api/sessions
    [HttpPost("sessions")]
    public async Task<IActionResult> CreateSession([FromBody] PlayerSession session)
    {
        session.ConnectedAt = DateTime.UtcNow;
        await _playerSessions.AddAsync(session);

        await _events.BroadcastAsync(new GameEvent("player-joined", new
        {
            session.Id,
            session.Username,
            session.ConnectedAt
        }));

        return Created($"/api/sessions/{session.Id}", session);
    }

    // PUT /api/sessions/{id}/disconnect
    [HttpPut("sessions/{id:guid}/disconnect")]
    public async Task<IActionResult> DisconnectSession(Guid id)
    {
        var session = await _playerSessions.GetByIdAsync(id);
        if (session is null)
        {
            return NotFound();
        }

        session.DisconnectedAt = DateTime.UtcNow;
        await _playerSessions.UpdateAsync(session);

        await _events.BroadcastAsync(new GameEvent("player-left", new
        {
            session.Id,
            session.Username,
            session.DisconnectedAt
        }));

        return NoContent();
    }
}
