using Hollowmarch.Models;
using Hollowmarch.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hollowmarch.Api.Controllers;

[ApiController]
[Route("api/players")]
public class PlayersController : ControllerBase
{
    private readonly PlayerService _players;

    public PlayersController(PlayerService players)
    {
        _players = players;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlayers(CancellationToken cancellationToken)
    {
        var players = await _players.GetPlayersAsync(cancellationToken);
        return Ok(players);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPlayer(Guid id, CancellationToken cancellationToken)
    {
        var player = await _players.GetPlayerAsync(id, cancellationToken);
        if (player is null)
        {
            return NotFound();
        }

        return Ok(player);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePlayer([FromBody] Player player, CancellationToken cancellationToken)
    {
        var created = await _players.CreatePlayerAsync(player, cancellationToken);
        return Created($"/api/players/{created.Id}", created);
    }

    [HttpPost("{id:guid}/last-login")]
    public async Task<IActionResult> TouchLastLogin(Guid id, CancellationToken cancellationToken)
    {
        await _players.UpdateLastLoginAsync(id, cancellationToken);
        return NoContent();
    }
}
