using System.Net.WebSockets;
using System.Text.Json;
using Hollowmarch.Data;
using Hollowmarch.Models;
using Hollowmarch.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(configuration.GetConnectionString("Database") ??
                     "Host=localhost;Port=5432;Database=hollowmarch;Username=postgres;Password=postgres"));

builder.Services.AddSingleton<GameEventService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseWebSockets();

app.MapGet("/api/world", async (AppDbContext db) =>
{
    var onlinePlayers = await db.PlayerSessions.CountAsync(p => p.DisconnectedAt == null);
    var latestMessage = await db.WorldMessages
        .OrderByDescending(m => m.CreatedAt)
        .Select(m => m.Content)
        .FirstOrDefaultAsync();

    return Results.Ok(new
    {
        onlinePlayers,
        serverTime = DateTime.UtcNow,
        motd = latestMessage ?? "Welcome to Hollowmarch!"
    });
});

app.MapPost("/api/world/messages", async (WorldMessage message, AppDbContext db, GameEventService events) =>
{
    message.CreatedAt = DateTime.UtcNow;
    db.WorldMessages.Add(message);
    await db.SaveChangesAsync();

    await events.BroadcastAsync(new GameEvent("world-message", new
    {
        message.Id,
        message.Content,
        message.CreatedAt
    }));

    return Results.Created($"/api/world/messages/{message.Id}", message);
});

app.MapPost("/api/sessions", async (PlayerSession session, AppDbContext db, GameEventService events) =>
{
    session.ConnectedAt = DateTime.UtcNow;
    db.PlayerSessions.Add(session);
    await db.SaveChangesAsync();

    await events.BroadcastAsync(new GameEvent("player-joined", new
    {
        session.Id,
        session.Username,
        session.ConnectedAt
    }));

    return Results.Created($"/api/sessions/{session.Id}", session);
});

app.MapPut("/api/sessions/{id:guid}/disconnect", async (Guid id, AppDbContext db, GameEventService events) =>
{
    var session = await db.PlayerSessions.FindAsync(id);
    if (session is null)
    {
        return Results.NotFound();
    }

    session.DisconnectedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    await events.BroadcastAsync(new GameEvent("player-left", new
    {
        session.Id,
        session.Username,
        session.DisconnectedAt
    }));

    return Results.NoContent();
});

app.Map("/ws/game", async (HttpContext context, GameEventService events) =>
{
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        return;
    }

    using var socket = await context.WebSockets.AcceptWebSocketAsync();
    var connectionId = events.Register(socket);

    await events.BroadcastAsync(new GameEvent("heartbeat", new { connectedAt = DateTime.UtcNow }));

    var buffer = new byte[1024 * 4];
    WebSocketReceiveResult? result;

    do
    {
        result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
        if (result.MessageType == WebSocketMessageType.Close)
        {
            break;
        }

        var received = JsonSerializer.Deserialize<Dictionary<string, object>>(buffer.AsSpan(0, result.Count));
        await events.BroadcastAsync(new GameEvent("echo", received ?? new {}));
    }
    while (!result.CloseStatus.HasValue);

    await events.RemoveAsync(connectionId);
});

app.Run();
