namespace Hollowmarch.Models;

public class PlayerSession
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PlayerId { get; set; }

    public Player? Player { get; set; }

    public string IPAddress { get; set; } = string.Empty;

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    public DateTime? EndedAt { get; set; }

    public DateTime? LastHeartbeat { get; set; }

    public bool IsActive { get; set; } = true;
}
