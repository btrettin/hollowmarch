using System.Net.WebSockets;
using System.Text.Json;
using Hollowmarch.Data;
using Hollowmarch.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        configuration.GetConnectionString("Database")
        ?? "Host=localhost;Port=5432;Database=hollowmarch;Username=postgres;Password=postgres"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            // TODO: set this to your actual frontend URL
            .WithOrigins("http://localhost:5173") // e.g. Vite default
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Game event hub
builder.Services.AddSingleton<GameEventService>();

// MVC / Controllers
builder.Services.AddControllers();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseWebSockets();

app.UseRouting();

app.UseCors("FrontendPolicy");

app.MapControllers();


// WebSocket endpoint stays mapped here
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
        await events.BroadcastAsync(new GameEvent("echo", received ?? new Dictionary<string, object>()));
    }
    while (!result.CloseStatus.HasValue);

    await events.RemoveAsync(connectionId);
});

app.Run();