import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';
import InventoryOverlay from './InventoryOverlay';
import { Player } from './game/Player';
import { World } from './game/World';
import './index.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const world = new World(canvas);
    const player = new Player();

    world.addPlayer(player);
    world.start();

    return () => world.dispose();
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Hollowmarch 3D Starter</h1>
        <p>Click to walk the world and orbit the camera OSRS-style.</p>
      </header>
      <Box
        display="flex"
        gap={2}
        width="100%"
        justifyContent="center"
        flexWrap="wrap"
        alignItems="flex-start"
      >
        <canvas ref={canvasRef} className="game-canvas" />
        <InventoryOverlay />
      </Box>
      <div className="controls">
        <span>Left click</span>
        <span>to walk</span>
        <span>Right click + drag</span>
        <span>to orbit</span>
        <span>Scroll</span>
        <span>to zoom</span>
      </div>
    </div>
  );
}

export default App;
