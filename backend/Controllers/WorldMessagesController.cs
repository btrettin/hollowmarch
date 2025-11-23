using Hollowmarch.Models;
using Hollowmarch.Repositories;
using Hollowmarch.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hollowmarch.Api.Controllers;

[ApiController]
[Route("api/world/messages")]
public class WorldMessagesController : ControllerBase
{
    private readonly IWorldMessageRepository _worldMessages;
    private readonly GameEventService _events;

    public WorldMessagesController(IWorldMessageRepository worldMessages, GameEventService events)
    {
        _worldMessages = worldMessages;
        _events = events;
    }

    [HttpPost]
    public async Task<IActionResult> PostMessage([FromBody] WorldMessage message, CancellationToken cancellationToken)
    {
        message.CreatedAt = DateTime.UtcNow;
        var saved = await _worldMessages.AddAsync(message, cancellationToken);

        await _events.BroadcastAsync(new GameEvent("world-message", new
        {
            saved.Id,
            saved.PlayerId,
            saved.Message,
            saved.MessageType,
            saved.CreatedAt
        }));

        return Created($"/api/world/messages/{saved.Id}", saved);
    }
}
