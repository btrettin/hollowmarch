using Hollowmarch.Models;
using Hollowmarch.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hollowmarch.Api.Controllers;

[ApiController]
[Route("api/characters/{characterId:guid}/inventory")]
public class InventoriesController : ControllerBase
{
    private readonly InventoryService _inventory;

    public InventoriesController(InventoryService inventory)
    {
        _inventory = inventory;
    }

    [HttpGet]
    public async Task<IActionResult> GetInventory(Guid characterId, CancellationToken cancellationToken)
    {
        var items = await _inventory.GetInventoryAsync(characterId, cancellationToken);
        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> AddInventoryItem(Guid characterId, [FromBody] InventoryItem item, CancellationToken cancellationToken)
    {
        item.CharacterId = characterId;
        var created = await _inventory.AddItemAsync(item, cancellationToken);
        return Created($"/api/characters/{characterId}/inventory/{created.Id}", created);
    }

    [HttpPut("{inventoryItemId:guid}")]
    public async Task<IActionResult> UpdateInventoryItem(Guid characterId, Guid inventoryItemId, [FromBody] InventoryItem updated, CancellationToken cancellationToken)
    {
        var existing = await _inventory.GetInventoryItemAsync(inventoryItemId, cancellationToken);
        if (existing is null || existing.CharacterId != characterId)
        {
            return NotFound();
        }

        existing.ItemId = updated.ItemId;
        existing.Quantity = updated.Quantity;
        existing.Slot = updated.Slot;

        await _inventory.UpdateItemAsync(existing, cancellationToken);
        return Ok(existing);
    }
}
