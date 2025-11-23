using Hollowmarch.Models;
using Hollowmarch.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hollowmarch.Api.Controllers;

[ApiController]
[Route("api/characters")]
public class CharactersController : ControllerBase
{
    private readonly CharacterService _characters;

    public CharactersController(CharacterService characters)
    {
        _characters = characters;
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCharacter(Guid id, CancellationToken cancellationToken)
    {
        var character = await _characters.GetCharacterAsync(id, cancellationToken);
        if (character is null)
        {
            return NotFound();
        }

        return Ok(character);
    }

    [HttpGet("player/{playerId:guid}")]
    public async Task<IActionResult> GetCharactersForPlayer(Guid playerId, CancellationToken cancellationToken)
    {
        var characters = await _characters.GetCharactersForPlayerAsync(playerId, cancellationToken);
        return Ok(characters);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCharacter([FromBody] Character character, CancellationToken cancellationToken)
    {
        var created = await _characters.CreateCharacterAsync(character, cancellationToken);
        return Created($"/api/characters/{created.Id}", created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCharacter(Guid id, [FromBody] Character updated, CancellationToken cancellationToken)
    {
        var existing = await _characters.GetCharacterAsync(id, cancellationToken);
        if (existing is null)
        {
            return NotFound();
        }

        existing.Name = updated.Name;
        existing.Level = updated.Level;
        existing.XP = updated.XP;
        existing.Health = updated.Health;
        existing.Stamina = updated.Stamina;
        existing.PosX = updated.PosX;
        existing.PosY = updated.PosY;
        existing.PosZ = updated.PosZ;
        existing.ZoneId = updated.ZoneId;
        existing.AppearanceData = updated.AppearanceData;

        await _characters.UpdateCharacterAsync(existing, cancellationToken);
        return Ok(existing);
    }
}
