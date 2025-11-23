using Hollowmarch.Data;
using Hollowmarch.Models;
using Hollowmarch.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hollowmarch.Api.Controllers;

[ApiController]
[Route("api")]
public class GameController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly GameEventService _events;

    public GameController(AppDbContext db, GameEventService events)
    {
        _db = db;
        _events = events;
    }

    // GET /api/world
    [HttpGet("world")]
    public async Task<IActionResult> GetWorld()
    {
        // var onlinePlayers = await _db.PlayerSessions.CountAsync(p => p.DisconnectedAt == null);

        // var latestMessage = await _db.WorldMessages
            // .OrderByDescending(m => m.CreatedAt)
             // .Select(m => m.Content)
        // .FirstOrDefaultAsync();

        return Ok(new
        {
            // onlinePlayers,
            serverTime = DateTime.UtcNow,
            motd =  "Welcome to Hollowmarch number 2!"
        });
    }

    // POST /api/world/messages
    [HttpPost("world/messages")]
    public async Task<IActionResult> PostWorldMessage([FromBody] WorldMessage message)
    {
        message.CreatedAt = DateTime.UtcNow;
        _db.WorldMessages.Add(message);
        await _db.SaveChangesAsync();

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
        _db.PlayerSessions.Add(session);
        await _db.SaveChangesAsync();

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
        var session = await _db.PlayerSessions.FirstOrDefaultAsync(s => s.Id == id);;
        if (session is null)
        {
            return NotFound();
        }

        session.DisconnectedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _events.BroadcastAsync(new GameEvent("player-left", new
        {
            session.Id,
            session.Username,
            session.DisconnectedAt
        }));

        return NoContent();
    }
}
