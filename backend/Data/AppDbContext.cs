using Hollowmarch.Models;
using Microsoft.EntityFrameworkCore;

namespace Hollowmarch.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Player> Players => Set<Player>();
    public DbSet<Character> Characters => Set<Character>();
    public DbSet<PlayerSession> PlayerSessions => Set<PlayerSession>();
    public DbSet<WorldMessage> WorldMessages => Set<WorldMessage>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<Zone> Zones => Set<Zone>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Player>()
            .HasIndex(p => p.Username)
            .IsUnique();

        modelBuilder.Entity<Player>()
            .Property(p => p.Username)
            .HasMaxLength(32)
            .IsRequired();

        modelBuilder.Entity<Player>()
            .Property(p => p.PasswordHash)
            .HasMaxLength(256)
            .IsRequired();

        modelBuilder.Entity<Character>()
            .Property(c => c.Name)
            .HasMaxLength(64)
            .IsRequired();

        modelBuilder.Entity<Character>()
            .HasOne(c => c.Player)
            .WithMany(p => p.Characters)
            .HasForeignKey(c => c.PlayerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Character>()
            .HasOne(c => c.Zone)
            .WithMany(z => z.Characters)
            .HasForeignKey(c => c.ZoneId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<PlayerSession>()
            .HasOne(s => s.Player)
            .WithMany(p => p.Sessions)
            .HasForeignKey(s => s.PlayerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PlayerSession>()
            .Property(s => s.IPAddress)
            .HasMaxLength(64)
            .IsRequired();

        modelBuilder.Entity<WorldMessage>()
            .Property(m => m.Message)
            .HasMaxLength(280)
            .IsRequired();

        modelBuilder.Entity<WorldMessage>()
            .Property(m => m.MessageType)
            .HasMaxLength(32)
            .IsRequired();

        modelBuilder.Entity<WorldMessage>()
            .HasOne(m => m.Player)
            .WithMany(p => p.Messages)
            .HasForeignKey(m => m.PlayerId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Item>()
            .Property(i => i.Name)
            .HasMaxLength(128)
            .IsRequired();

        modelBuilder.Entity<Item>()
            .Property(i => i.ItemType)
            .HasMaxLength(64)
            .IsRequired();

        modelBuilder.Entity<InventoryItem>()
            .HasOne(ii => ii.Character)
            .WithMany(c => c.InventoryItems)
            .HasForeignKey(ii => ii.CharacterId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InventoryItem>()
            .HasOne(ii => ii.Item)
            .WithMany(i => i.InventoryItems)
            .HasForeignKey(ii => ii.ItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Zone>()
            .Property(z => z.Name)
            .HasMaxLength(128)
            .IsRequired();

        modelBuilder.Entity<Zone>()
            .Property(z => z.Type)
            .HasMaxLength(32)
            .IsRequired();
    }
}
