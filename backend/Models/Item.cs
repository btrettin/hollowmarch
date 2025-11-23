namespace Hollowmarch.Models;

public class Item
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string ItemType { get; set; } = string.Empty;

    public bool Stackable { get; set; }

    public int Value { get; set; }

    public string StatsJson { get; set; } = string.Empty;

    public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
}
