import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppBar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { Link as RouterLink, Route, Routes } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:5000/ws/game';

interface WorldState {
  onlinePlayers: number;
  serverTime: string;
  motd: string;
}

interface LiveEvent {
  type: string;
  payload: Record<string, unknown>;
}

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
    isConnected,
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

function WorldStatus() {
  const { data, error } = useWorldState();

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="World status" subheader="Live snapshot from the backend" />
      <CardContent>
        {error && (
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        )}
        {data ? (
          <List>
            <ListItem>
              <ListItemText primary="Players online" secondary={data.onlinePlayers} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Server time"
                secondary={new Date(data.serverTime).toLocaleTimeString()}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="MOTD" secondary={data.motd} />
            </ListItem>
          </List>
        ) : (
          <Typography color="text.secondary">Loading snapshot from backend...</Typography>
        )}
      </CardContent>
    </Card>
  );
}

function LiveEvents() {
  const { events, status } = useWebSocket(WS_URL);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Live events" subheader={`WebSocket status: ${status}`} />
      <CardContent>
        {events.length === 0 ? (
          <Typography color="text.secondary">
            Waiting for events from the game server WebSocket...
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {events.map((evt, index) => (
              <Box
                key={`${evt.type}-${index}`}
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 1.25,
                  bgcolor: 'background.default',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Chip size="small" color="primary" label={evt.type} />
                  <Typography variant="caption" color="text.secondary">
                    Event {index + 1}
                  </Typography>
                </Stack>
                <Typography component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(evt.payload, null, 2)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function ArchitectureNotes() {
  return (
    <Card>
      <CardHeader
        title="Architecture notes"
        subheader="Quick overview of the stack for future customization"
      />
      <CardContent>
        <List sx={{ listStyleType: 'disc', pl: 3 }}>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Vite + React + TypeScript frontend with React Query for API data." />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary=".NET minimal API backend exposes REST endpoints under /api and a WebSocket endpoint at /ws/game." />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="PostgreSQL connection configured through appsettings.json or environment variables." />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Docker Compose orchestrates the database, backend, and frontend containers." />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" sx={{ mb: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Hollowmarch
        </Typography>
        <Typography color="text.secondary">
          A starter kit for an OSRS-inspired browser game with a React/Vite frontend, .NET backend,
          PostgreSQL persistence, REST APIs, and live WebSocket updates.
        </Typography>
      </Box>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <WorldStatus />
        </Grid>
        <Grid item xs={12} md={6}>
          <LiveEvents />
        </Grid>
        <Grid item xs={12}>
          <ArchitectureNotes />
        </Grid>
      </Grid>
    </Container>
  );
}

function ArchitecturePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Architecture details
        </Typography>
        <Typography color="text.secondary">
          Explore the technology choices and integration points that power Hollowmarch. The stack is
          intentionally lightweight so you can swap pieces as you extend the game loop.
        </Typography>
      </Box>
      <ArchitectureNotes />
    </Container>
  );
}

function App() {
  return (
    <Box>
      <AppBar position="sticky" color="transparent" enableColorOnDark sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Hollowmarch
          </Typography>
          <Stack direction="row" spacing={1}>
            <Typography
              component={RouterLink}
              to="/"
              color="inherit"
              sx={{ textDecoration: 'none', fontWeight: 600 }}
            >
              Dashboard
            </Typography>
            <Typography
              component={RouterLink}
              to="/architecture"
              color="inherit"
              sx={{ textDecoration: 'none', fontWeight: 600 }}
            >
              Architecture
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
      </Routes>
    </Box>
  );
}

export default App;
