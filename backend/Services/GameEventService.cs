using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace Hollowmarch.Services;

public record GameEvent(string Type, object Payload);

public class GameEventService
{
    private readonly ConcurrentDictionary<Guid, WebSocket> _sockets = new();

    public Guid Register(WebSocket socket)
    {
        var id = Guid.NewGuid();
        _sockets[id] = socket;
        return id;
    }

    public async Task RemoveAsync(Guid id)
    {
        if (_sockets.TryRemove(id, out var socket))
        {
            await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
            socket.Dispose();
        }
    }

    public async Task BroadcastAsync(GameEvent gameEvent)
    {
        var payload = JsonSerializer.Serialize(gameEvent);
        var buffer = Encoding.UTF8.GetBytes(payload);
        var segment = new ArraySegment<byte>(buffer);

        foreach (var socket in _sockets.Values)
        {
            if (socket.State == WebSocketState.Open)
            {
                await socket.SendAsync(segment, WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
    }
}
