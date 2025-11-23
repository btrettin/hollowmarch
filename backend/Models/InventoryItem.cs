namespace Hollowmarch.Models;

public class InventoryItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CharacterId { get; set; }

    public Character? Character { get; set; }

    public int ItemId { get; set; }

    public Item? Item { get; set; }

    public int Quantity { get; set; }

    public int? Slot { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
