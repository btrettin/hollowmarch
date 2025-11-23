import { BoxGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three';

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

    const skinMaterial = new MeshStandardMaterial({ color: 0xffd7ba });
    const shirtMaterial = new MeshStandardMaterial({ color: 0x4e7ac7 });
    const pantsMaterial = new MeshStandardMaterial({ color: 0x2b3a55 });
    const shoeMaterial = new MeshStandardMaterial({ color: 0x1f1f1f });

    const torso = new Mesh(new BoxGeometry(1.2, 1.2, 0.7), shirtMaterial);
    torso.castShadow = true;
    torso.position.y = 1.6;
    this.mesh.add(torso);

    const head = new Mesh(new BoxGeometry(0.8, 0.9, 0.75), skinMaterial);
    head.castShadow = true;
    head.position.set(0, 2.6, 0);
    this.mesh.add(head);

    const leftLeg = new Mesh(new BoxGeometry(0.45, 1.2, 0.55), pantsMaterial);
    leftLeg.castShadow = true;
    leftLeg.position.set(-0.3, 0.6, 0);
    this.mesh.add(leftLeg);

    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.3;
    this.mesh.add(rightLeg);

    const leftShoe = new Mesh(new BoxGeometry(0.5, 0.2, 0.7), shoeMaterial);
    leftShoe.castShadow = true;
    leftShoe.position.set(-0.3, 0.1, 0.05);
    this.mesh.add(leftShoe);

    const rightShoe = leftShoe.clone();
    rightShoe.position.x = 0.3;
    this.mesh.add(rightShoe);

    const leftArm = new Mesh(new BoxGeometry(0.35, 1.0, 0.45), shirtMaterial);
    leftArm.castShadow = true;
    leftArm.position.set(-0.85, 1.6, 0);
    this.mesh.add(leftArm);

    const rightArm = leftArm.clone();
    rightArm.position.x = 0.85;
    this.mesh.add(rightArm);

    const leftHand = new Mesh(new BoxGeometry(0.35, 0.25, 0.45), skinMaterial);
    leftHand.castShadow = true;
    leftHand.position.set(-0.85, 1.05, 0);
    this.mesh.add(leftHand);

    const rightHand = leftHand.clone();
    rightHand.position.x = 0.85;
    this.mesh.add(rightHand);

    const eyeMaterial = new MeshStandardMaterial({ color: 0x111111, emissive: 0x222222 });
    const leftEye = new Mesh(new SphereGeometry(0.06, 12, 12), eyeMaterial);
    leftEye.position.set(-0.18, 2.75, -0.38);
    this.mesh.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.x = 0.18;
    this.mesh.add(rightEye);

    const mouth = new Mesh(new BoxGeometry(0.35, 0.08, 0.05), new MeshStandardMaterial({ color: 0xcc6155 }));
    mouth.position.set(0, 2.45, -0.37);
    this.mesh.add(mouth);
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
