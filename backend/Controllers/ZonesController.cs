using Hollowmarch.Models;
using Hollowmarch.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hollowmarch.Api.Controllers;

[ApiController]
[Route("api/zones")]
public class ZonesController : ControllerBase
{
    private readonly ZoneService _zones;

    public ZonesController(ZoneService zones)
    {
        _zones = zones;
    }

    [HttpGet]
    public async Task<IActionResult> GetZones(CancellationToken cancellationToken)
    {
        var zones = await _zones.GetZonesAsync(cancellationToken);
        return Ok(zones);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetZone(int id, CancellationToken cancellationToken)
    {
        var zone = await _zones.GetZoneAsync(id, cancellationToken);
        if (zone is null)
        {
            return NotFound();
        }

        return Ok(zone);
    }

    [HttpPost]
    public async Task<IActionResult> CreateZone([FromBody] Zone zone, CancellationToken cancellationToken)
    {
        var created = await _zones.CreateZoneAsync(zone, cancellationToken);
        return Created($"/api/zones/{created.Id}", created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateZone(int id, [FromBody] Zone updated, CancellationToken cancellationToken)
    {
        var existing = await _zones.GetZoneAsync(id, cancellationToken);
        if (existing is null)
        {
            return NotFound();
        }

        existing.Name = updated.Name;
        existing.Type = updated.Type;
        existing.MinLevel = updated.MinLevel;
        existing.MaxLevel = updated.MaxLevel;
        existing.MetadataJson = updated.MetadataJson;

        await _zones.UpdateZoneAsync(existing, cancellationToken);
        return Ok(existing);
    }
}
