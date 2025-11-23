namespace Hollowmarch.Models;

public class Player
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }

    public ICollection<Character> Characters { get; set; } = new List<Character>();

    public ICollection<PlayerSession> Sessions { get; set; } = new List<PlayerSession>();

    public ICollection<WorldMessage> Messages { get; set; } = new List<WorldMessage>();
}
