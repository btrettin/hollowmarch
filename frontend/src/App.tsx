import { useEffect, useMemo, useRef, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5041/api';
const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:5041/ws/game';

type WorldState = {
  onlinePlayers: number;
  serverTime: string;
  motd: string;
};

type LiveEvent = {
  type: string;
  payload: Record<string, unknown>;
};

function useWebSocket(url: string) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.addEventListener('open', () => setIsConnected(true));
    socket.addEventListener('close', () => setIsConnected(false));
    socket.addEventListener('message', (event) => {
      try {
        const parsed = JSON.parse(event.data) as LiveEvent;
        setEvents((existing) => [...existing.slice(-9), parsed]);
      } catch (error) {
        console.error('Unable to parse event', error);
      }
    });

    return () => socket.close();
  }, [url]);

  const status = useMemo(() => (isConnected ? 'Connected' : 'Disconnected'), [
    isConnected
  ]);

  return { events, status } as const;
}

function useWorldState() {
  const [data, setData] = useState<WorldState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/world`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return (await res.json()) as WorldState;
      })
      .then(setData)
      .catch((err) => setError(err.message));

    return () => controller.abort();
  }, []);

  return { data, error } as const;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <header>
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  );
}

function App() {
  const { data, error } = useWorldState();
  const { events, status } = useWebSocket(WS_URL);

  return (
    <main className="layout">
      <header className="hero">
        <h1>Hollowmarch</h1>
        <p>
          A starter kit for an OSRS-inspired browser game with a React/Vite frontend, .NET
          backend, PostgreSQL persistence, REST APIs, and live WebSocket updates.
        </p>
      </header>

      <div className="grid">
        <Section title="World status">
          {error && <p className="error">{error}</p>}
          {data ? (
            <ul className="stat-list">
              <li>
                <span className="label">Players online</span>
                <span className="value">{data.onlinePlayers}</span>
              </li>
              <li>
                <span className="label">Server time</span>
                <span className="value">{new Date(data.serverTime).toLocaleTimeString()}</span>
              </li>
              <li>
                <span className="label">MOTD</span>
                <span className="value">{data.motd}</span>
              </li>
            </ul>
          ) : (
            <p>Loading snapshot from backend...</p>
          )}
        </Section>

        <Section title={`Live events (${status})`}>
          {events.length === 0 ? (
            <p>Waiting for events from the game server WebSocket...</p>
          ) : (
            <ul className="events">
              {events.map((evt, index) => (
                <li key={`${evt.type}-${index}`}>
                  <span className="pill">{evt.type}</span>
                  <pre>{JSON.stringify(evt.payload, null, 2)}</pre>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Section title="Architecture notes">
        <ul className="notes">
          <li>Vite + React + TypeScript frontend with React Query for API data.</li>
          <li>
            .NET minimal API backend exposes REST endpoints under <code>/api</code> and a
            WebSocket endpoint at <code>/ws/game</code>.
          </li>
          <li>PostgreSQL connection configured through <code>appsettings.json</code> or env vars.</li>
          <li>Docker Compose orchestrates the database, backend, and frontend containers.</li>
        </ul>
      </Section>
    </main>
  );
}

export default App;
