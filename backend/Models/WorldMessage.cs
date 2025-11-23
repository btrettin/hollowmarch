namespace Hollowmarch.Models;

public class WorldMessage
{
    public int Id { get; set; }

    public Guid? PlayerId { get; set; }

    public Player? Player { get; set; }

    public string Message { get; set; } = string.Empty;

    public string MessageType { get; set; } = "chat";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
