using Hollowmarch.Models;
using Microsoft.EntityFrameworkCore;

namespace Hollowmarch.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<PlayerSession> PlayerSessions => Set<PlayerSession>();
    public DbSet<WorldMessage> WorldMessages => Set<WorldMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PlayerSession>()
            .Property(p => p.Username)
            .HasMaxLength(32)
            .IsRequired();

        modelBuilder.Entity<WorldMessage>()
            .Property(m => m.Content)
            .HasMaxLength(280)
            .IsRequired();
    }
}
