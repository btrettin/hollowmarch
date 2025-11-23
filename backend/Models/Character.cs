namespace Hollowmarch.Models;

public class Character
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PlayerId { get; set; }

    public Player? Player { get; set; }

    public string Name { get; set; } = string.Empty;

    public int Level { get; set; }

    public long XP { get; set; }

    public int Health { get; set; }

    public int Stamina { get; set; }

    public float PosX { get; set; }

    public float PosY { get; set; }

    public float PosZ { get; set; }

    public int? ZoneId { get; set; }

    public Zone? Zone { get; set; }

    public string AppearanceData { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
}
