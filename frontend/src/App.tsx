import { useEffect, useRef } from 'react';
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
        <p>Move with WASD and explore a minimal Three.js world.</p>
      </header>
      <canvas ref={canvasRef} className="game-canvas" />
      <div className="controls">
        <span>W/A/S/D</span>
        <span>to move the player</span>
      </div>
    </div>
  );
}

export default App;
