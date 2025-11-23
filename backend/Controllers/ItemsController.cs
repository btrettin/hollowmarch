using Hollowmarch.Models;
using Hollowmarch.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hollowmarch.Api.Controllers;

[ApiController]
[Route("api/items")]
public class ItemsController : ControllerBase
{
    private readonly ItemService _items;

    public ItemsController(ItemService items)
    {
        _items = items;
    }

    [HttpGet]
    public async Task<IActionResult> GetItems(CancellationToken cancellationToken)
    {
        var items = await _items.GetItemsAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetItem(int id, CancellationToken cancellationToken)
    {
        var item = await _items.GetItemAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> CreateItem([FromBody] Item item, CancellationToken cancellationToken)
    {
        var created = await _items.CreateItemAsync(item, cancellationToken);
        return Created($"/api/items/{created.Id}", created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateItem(int id, [FromBody] Item updated, CancellationToken cancellationToken)
    {
        var existing = await _items.GetItemAsync(id, cancellationToken);
        if (existing is null)
        {
            return NotFound();
        }

        existing.Name = updated.Name;
        existing.Description = updated.Description;
        existing.ItemType = updated.ItemType;
        existing.Stackable = updated.Stackable;
        existing.Value = updated.Value;
        existing.StatsJson = updated.StatsJson;

        await _items.UpdateItemAsync(existing, cancellationToken);
        return Ok(existing);
    }
}
