import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';

export interface Updatable {
  update(dt: number): void;
}

export class Player implements Updatable {
  readonly mesh: Group;
  private velocity = new Vector3();
  private heading = new Vector3(0, 0, -1);
  private readonly speed = 6;

  constructor() {
    this.mesh = new Group();

    const bodyGeometry = new BoxGeometry(1, 2, 1);
    const bodyMaterial = new MeshStandardMaterial({ color: 0xff7043 });
    const body = new Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.position.y = 1;

    this.mesh.add(body);
  }

  moveForward() {
    this.velocity.z -= 1;
  }

  moveBackward() {
    this.velocity.z += 1;
  }

  moveLeft() {
    this.velocity.x -= 1;
  }

  moveRight() {
    this.velocity.x += 1;
  }

  update(dt: number) {
    if (this.velocity.lengthSq() === 0) return;

    const direction = this.velocity.normalize();
    this.heading.copy(direction);

    const displacement = direction.multiplyScalar(this.speed * dt);
    this.mesh.position.add(displacement);

    this.velocity.set(0, 0, 0);
  }

  get direction(): Vector3 {
    return this.heading.clone();
  }

  get position(): Vector3 {
    return this.mesh.position;
  }
}
