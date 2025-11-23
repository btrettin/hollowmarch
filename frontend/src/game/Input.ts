import { Vector3 } from 'three';

const KEY_W = 'KeyW';
const KEY_A = 'KeyA';
const KEY_S = 'KeyS';
const KEY_D = 'KeyD';

export class Input {
  private pressed = new Set<string>();

  private handleKeyDown = (event: KeyboardEvent) => {
    this.pressed.add(event.code);
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.pressed.delete(event.code);
  };

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  getMovementVector(): Vector3 {
    const direction = new Vector3();

    if (this.pressed.has(KEY_W)) direction.z -= 1;
    if (this.pressed.has(KEY_S)) direction.z += 1;
    if (this.pressed.has(KEY_A)) direction.x -= 1;
    if (this.pressed.has(KEY_D)) direction.x += 1;

    return direction;
  }

  dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.pressed.clear();
  }
}
