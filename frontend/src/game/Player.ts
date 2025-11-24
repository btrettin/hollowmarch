import { BoxGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three';

export interface Collider {
  position: Vector3;
  radius: number;
}

export interface Updatable {
  update(dt: number): void;
}

export class Player implements Updatable {
  readonly mesh: Group;
  private heading = new Vector3(0, 0, -1);
  private target: Vector3 | null = null;
  private path: Vector3[] = [];
  private readonly speed = 6;
  private readonly arrivalThreshold = 0.1;
  private readonly radius = 0.7;
  private colliders: Collider[] = [];
  private heightSampler: (x: number, z: number) => number = () => 0;

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
    leftEye.position.set(-0.18, 2.75, 0.38);
    this.mesh.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.x = 0.18;
    this.mesh.add(rightEye);

    const mouth = new Mesh(new BoxGeometry(0.35, 0.08, 0.05), new MeshStandardMaterial({ color: 0xcc6155 }));
    mouth.position.set(0, 2.45, 0.37);
    this.mesh.add(mouth);
  }

  setDestination(position: Vector3) {
    const destination = new Vector3(position.x, 0, position.z);
    const start = this.mesh.position.clone();

    this.path = this.findPath(start, destination);
    this.target = this.path.shift() ?? null;
  }

  setColliders(colliders: Collider[]) {
    this.colliders = colliders;
  }

  setHeightSampler(heightSampler: (x: number, z: number) => number) {
    this.heightSampler = heightSampler;
    this.mesh.position.y = this.heightSampler(this.mesh.position.x, this.mesh.position.z);
  }

  update(dt: number) {
    this.mesh.position.y = this.heightSampler(this.mesh.position.x, this.mesh.position.z);

    while (this.target) {
      const toTarget = new Vector3().subVectors(this.target, this.mesh.position);
      toTarget.y = 0;
      const distance = toTarget.length();

      if (distance < this.arrivalThreshold) {
        this.mesh.position.set(
          this.target.x,
          this.heightSampler(this.target.x, this.target.z),
          this.target.z,
        );
        this.target = this.path.shift() ?? null;
        continue;
      }

      const direction = toTarget.normalize();
      this.heading.copy(direction);

      const step = Math.min(this.speed * dt, distance);
      const safeStep = this.getSafeStep(direction, step);

      if (safeStep <= 0.0001) {
        this.target = null;
        return;
      }

      this.mesh.position.addScaledVector(direction, safeStep);
      this.mesh.position.y = this.heightSampler(this.mesh.position.x, this.mesh.position.z);

      const lookTarget = this.mesh.position.clone().add(new Vector3(direction.x, 0, direction.z));
      this.mesh.lookAt(lookTarget);
      return;
    }
  }

  get direction(): Vector3 {
    return this.heading.clone();
  }

  get position(): Vector3 {
    return this.mesh.position;
  }

  private getSafeStep(direction: Vector3, desiredStep: number): number {
    let maxStep = desiredStep;

    for (const collider of this.colliders) {
      const toCollider = collider.position.clone().sub(this.mesh.position);
      toCollider.y = 0;

      const along = toCollider.dot(direction);
      if (along <= 0) continue;

      const lateralSq = Math.max(0, toCollider.lengthSq() - along * along);
      const combinedRadius = this.radius + collider.radius;

      if (lateralSq >= combinedRadius * combinedRadius) continue;

      const offset = Math.sqrt(combinedRadius * combinedRadius - lateralSq);
      const collisionDistance = along - offset;

      if (collisionDistance < maxStep) {
        maxStep = Math.max(0, collisionDistance - 0.02);
      }
    }

    return maxStep;
  }

  private findPath(start: Vector3, destination: Vector3): Vector3[] {
    if (this.hasLineOfSight(start, destination)) {
      return [destination];
    }

    const cellSize = 1;
    const padding = this.radius + 0.25;

    let minX = Math.min(start.x, destination.x);
    let maxX = Math.max(start.x, destination.x);
    let minZ = Math.min(start.z, destination.z);
    let maxZ = Math.max(start.z, destination.z);

    for (const collider of this.colliders) {
      const extent = collider.radius + this.radius + 2;
      minX = Math.min(minX, collider.position.x - extent);
      maxX = Math.max(maxX, collider.position.x + extent);
      minZ = Math.min(minZ, collider.position.z - extent);
      maxZ = Math.max(maxZ, collider.position.z + extent);
    }

    const clampRange = 98; // Keep search inside the ground plane bounds.
    minX = Math.max(minX - 2, -clampRange);
    maxX = Math.min(maxX + 2, clampRange);
    minZ = Math.max(minZ - 2, -clampRange);
    maxZ = Math.min(maxZ + 2, clampRange);

    const cols = Math.max(2, Math.ceil((maxX - minX) / cellSize) + 1);
    const rows = Math.max(2, Math.ceil((maxZ - minZ) / cellSize) + 1);

    const toGrid = (point: Vector3) => ({
      x: Math.min(cols - 1, Math.max(0, Math.round((point.x - minX) / cellSize))),
      z: Math.min(rows - 1, Math.max(0, Math.round((point.z - minZ) / cellSize))),
    });

    const toWorld = (x: number, z: number) =>
      new Vector3(minX + x * cellSize, 0, minZ + z * cellSize);

    const startCell = toGrid(start);
    const goalCell = toGrid(destination);

    const blocked = (x: number, z: number) => {
      const worldPos = toWorld(x, z);
      for (const collider of this.colliders) {
        const inflated = collider.radius + this.radius + padding;
        if (worldPos.distanceToSquared(collider.position) <= inflated * inflated) {
          return true;
        }
      }
      return false;
    };

    const key = (x: number, z: number) => `${x},${z}`;

    type Node = { x: number; z: number; g: number; f: number; parent?: string };
    const openSet = new Map<string, Node>();
    const closedSet = new Map<string, Node>();

    const heuristic = (x: number, z: number) => {
      const dx = goalCell.x - x;
      const dz = goalCell.z - z;
      return Math.hypot(dx, dz);
    };

    const startKey = key(startCell.x, startCell.z);
    openSet.set(startKey, { x: startCell.x, z: startCell.z, g: 0, f: heuristic(startCell.x, startCell.z) });

    const neighborOffsets = [
      { x: 1, z: 0, cost: 1 },
      { x: -1, z: 0, cost: 1 },
      { x: 0, z: 1, cost: 1 },
      { x: 0, z: -1, cost: 1 },
      { x: 1, z: 1, cost: Math.SQRT2 },
      { x: 1, z: -1, cost: Math.SQRT2 },
      { x: -1, z: 1, cost: Math.SQRT2 },
      { x: -1, z: -1, cost: Math.SQRT2 },
    ];

    while (openSet.size > 0) {
      let currentKey: string | null = null;
      let lowestF = Number.POSITIVE_INFINITY;

      for (const [candidateKey, node] of openSet.entries()) {
        if (node.f < lowestF) {
          lowestF = node.f;
          currentKey = candidateKey;
        }
      }

      if (!currentKey) break;

      const current = openSet.get(currentKey)!;
      openSet.delete(currentKey);
      closedSet.set(currentKey, current);

      if (current.x === goalCell.x && current.z === goalCell.z) {
        const path: Vector3[] = [];
        let traceKey: string | undefined = currentKey;

        while (traceKey) {
          const [px, pz] = traceKey.split(',').map((n) => parseInt(n, 10));
          path.unshift(toWorld(px, pz));
          traceKey = closedSet.get(traceKey)?.parent;
        }

        if (path.length > 0) {
          path.shift();
        }

        path.push(destination);
        return this.smoothPath(start, path);
      }

      for (const offset of neighborOffsets) {
        const nx = current.x + offset.x;
        const nz = current.z + offset.z;

        if (nx < 0 || nz < 0 || nx >= cols || nz >= rows) continue;
        if (blocked(nx, nz)) continue;

        const neighborKey = key(nx, nz);
        if (closedSet.has(neighborKey)) continue;

        const tentativeG = current.g + offset.cost;
        const existing = openSet.get(neighborKey);

        if (!existing || tentativeG < existing.g) {
          openSet.set(neighborKey, {
            x: nx,
            z: nz,
            g: tentativeG,
            f: tentativeG + heuristic(nx, nz),
            parent: currentKey,
          });
        }
      }
    }

    return [destination];
  }

  private smoothPath(start: Vector3, path: Vector3[]): Vector3[] {
    if (path.length <= 2) return path;

    const points = [start.clone(), ...path.map((p) => p.clone())];
    const smoothed: Vector3[] = [];

    let anchorIndex = 0;

    while (anchorIndex < points.length - 1) {
      let nextIndex = anchorIndex + 1;

      for (let test = anchorIndex + 2; test < points.length; test++) {
        if (!this.hasLineOfSight(points[anchorIndex], points[test])) {
          break;
        }
        nextIndex = test;
      }

      smoothed.push(points[nextIndex]);
      anchorIndex = nextIndex;
    }

    return smoothed;
  }

  private hasLineOfSight(start: Vector3, end: Vector3) {
    const direction = new Vector3().subVectors(end, start);
    const length = direction.length();
    direction.normalize();

    for (const collider of this.colliders) {
      const toCollider = collider.position.clone().sub(start);
      const projection = toCollider.dot(direction);
      if (projection < 0 || projection > length) continue;

      const closestPoint = start.clone().addScaledVector(direction, projection);
      const distanceSq = closestPoint.distanceToSquared(collider.position);
      const clearance = collider.radius + this.radius + 0.05;
      if (distanceSq <= clearance * clearance) {
        return false;
      }
    }

    return true;
  }
}
