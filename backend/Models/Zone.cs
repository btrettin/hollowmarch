namespace Hollowmarch.Models;

public class Zone
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public int MinLevel { get; set; }

    public int MaxLevel { get; set; }

    public string MetadataJson { get; set; } = string.Empty;

    public ICollection<Character> Characters { get; set; } = new List<Character>();
}
