import {
  Color,
  CanvasTexture,
  HemisphereLight,
  DirectionalLight,
  CylinderGeometry,
  ConeGeometry,
  DodecahedronGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  RepeatWrapping,
  DoubleSide,
  Scene,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { Collider, Player, Updatable } from './Player';

export class World {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private updatables: Updatable[] = [];
  private player: Player | null = null;
  private lastTime = 0;
  private animationFrame = 0;
  private cameraYaw = 0;
  private cameraPitch = 0.45;
  private cameraDistance = 12;
  private isDragging = false;
  private previousMouse = { x: 0, y: 0 };
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private groundPlane = new Plane(new Vector3(0, 1, 0), 0);
  private smoothedFocus = new Vector3();
  private handleContextMenu = (event: Event) => event.preventDefault();
  private colliders: Collider[] = [];

  constructor(private canvas: HTMLCanvasElement) {
    this.scene = new Scene();
    this.scene.background = new Color(0x87ceeb);

    this.camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500,
    );
    this.camera.position.set(0, 6, 12);

    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('contextmenu', this.handleContextMenu);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('wheel', this.handleWheel, { passive: false });

    this.addLighting();
    this.addGround();
    this.populateEnvironment();
    window.addEventListener('resize', this.handleResize);
  }

  addPlayer(player: Player) {
    this.player = player;
    player.setColliders(this.colliders);
    player.setHeightSampler((x, z) => this.sampleTerrainHeight(x, z));
    this.updatables.push(player);
    this.scene.add(player.mesh);
    player.mesh.position.y = this.sampleTerrainHeight(player.mesh.position.x, player.mesh.position.z);
    this.smoothedFocus.copy(player.position);
  }

  start() {
    this.lastTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  dispose() {
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener('resize', this.handleResize);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('wheel', this.handleWheel);
    this.renderer.dispose();
  }

  private addLighting() {
    const hemisphere = new HemisphereLight(0xddeeff, 0x6688aa, 0.7);
    this.scene.add(hemisphere);

    const sun = new DirectionalLight(0xfff1c1, 1.2);
    sun.castShadow = true;
    sun.position.set(-12, 18, 10);
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 60;
    this.scene.add(sun);

    const sunSphere = new Mesh(
      new SphereGeometry(1.5, 24, 24),
      new MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffd27f, emissiveIntensity: 0.8 }),
    );
    sunSphere.position.copy(sun.position.clone().normalize().multiplyScalar(30));
    sunSphere.position.y = 25;
    this.scene.add(sunSphere);
  }

  private addGround() {
    const groundTexture = this.createGrassTexture();
    groundTexture.wrapS = RepeatWrapping;
    groundTexture.wrapT = RepeatWrapping;
    groundTexture.repeat.set(40, 40);

    const groundGeometry = new PlaneGeometry(200, 200, 100, 100);
    groundGeometry.rotateX(-Math.PI / 2);

    const position = groundGeometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const height = this.sampleTerrainHeight(x, z);
      position.setY(i, height);
    }
    position.needsUpdate = true;
    groundGeometry.computeVertexNormals();

    const groundMaterial = new MeshStandardMaterial({
      color: 0x2b6b33,
      map: groundTexture,
      roughness: 0.95,
      metalness: 0.05,
    });

    const ground = new Mesh(groundGeometry, groundMaterial);
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private populateEnvironment() {
    this.addPaths();
    this.addTrees();
    this.addRocks();
    this.addMedievalDetails();
  }

  private registerCollider(position: Vector3, radius: number) {
    this.colliders.push({ position: position.clone(), radius });
  }

  private createGrassTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new CanvasTexture(canvas);

    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#2f7d3a');
    gradient.addColorStop(0.5, '#347b36');
    gradient.addColorStop(1, '#2a6b31');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 800; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const alpha = 0.1 + Math.random() * 0.15;
      ctx.fillStyle = `rgba(${60 + Math.random() * 20}, ${120 + Math.random() * 30}, ${60 + Math.random() * 20}, ${alpha})`;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 60; i++) {
      ctx.beginPath();
      const startX = Math.random() * size;
      const startY = Math.random() * size;
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + (Math.random() - 0.5) * 30, startY - 20 - Math.random() * 20);
      ctx.stroke();
    }

    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private addTrees() {
    const trunkMaterial = new MeshStandardMaterial({ color: 0x8d6e63 });
    const leafMaterial = new MeshStandardMaterial({ color: 0x3e9b4f });

    const treePositions: Array<{ x: number; z: number; scale?: number }> = [
      { x: -35, z: -20, scale: 1.2 },
      { x: -10, z: -45, scale: 1 },
      { x: 25, z: -35, scale: 1.1 },
      { x: 45, z: -5, scale: 1.3 },
      { x: -50, z: 15, scale: 0.9 },
      { x: -20, z: 35, scale: 1.25 },
      { x: 10, z: 50, scale: 1 },
      { x: 35, z: 30, scale: 1.15 },
      { x: -5, z: 5, scale: 0.95 },
      { x: 55, z: 55, scale: 1.3 },
    ];

    treePositions.forEach(({ x, z, scale = 1 }) => {
      const tree = this.createTree(trunkMaterial, leafMaterial, scale);
      tree.position.set(x, 0, z);
      this.alignToTerrain(tree);
      this.registerCollider(new Vector3(x, 0, z), 2.6 * scale);
      this.scene.add(tree);
    });
  }

  private createTree(
    trunkMaterial: MeshStandardMaterial,
    leafMaterial: MeshStandardMaterial,
    scale: number,
  ): Group {
    const tree = new Mesh(new CylinderGeometry(0.5, 0.6, 3.2, 10), trunkMaterial);
    tree.castShadow = true;
    tree.receiveShadow = true;

    const foliage = new Mesh(new ConeGeometry(2.4, 4, 10), leafMaterial);
    foliage.position.y = 3.6;
    foliage.castShadow = true;
    foliage.receiveShadow = true;

    const midFoliage = foliage.clone();
    midFoliage.scale.setScalar(0.8);
    midFoliage.position.y = 5.0;

    const topFoliage = foliage.clone();
    topFoliage.scale.setScalar(0.55);
    topFoliage.position.y = 6.2;

    const treeGroup = new Group();
    treeGroup.add(tree);
    treeGroup.add(foliage);
    treeGroup.add(midFoliage);
    treeGroup.add(topFoliage);

    treeGroup.scale.setScalar(scale);
    treeGroup.rotation.y = Math.random() * Math.PI * 2;

    return treeGroup;
  }

  private addRocks() {
    const rockMaterial = new MeshStandardMaterial({ color: 0x8c8c8c, roughness: 0.95, metalness: 0.05 });
    const rockGeometry = new DodecahedronGeometry(1.6, 0);

    const rockPositions: Array<{ x: number; z: number; scale?: number }> = [
      { x: -42, z: -32, scale: 1.1 },
      { x: 8, z: -25, scale: 0.9 },
      { x: 32, z: 12, scale: 1.4 },
      { x: -28, z: 42, scale: 0.85 },
      { x: 48, z: 48, scale: 1.2 },
      { x: -12, z: 24, scale: 0.95 },
    ];

    rockPositions.forEach(({ x, z, scale = 1 }) => {
      const rock = new Mesh(rockGeometry.clone(), rockMaterial);
      rock.position.set(x, 0, z);
      this.alignToTerrain(rock, 0.8);
      rock.scale.setScalar(scale);
      rock.rotation.set(Math.random() * 0.5, Math.random() * Math.PI * 2, Math.random() * 0.5);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.registerCollider(new Vector3(x, 0, z), 1.5 * scale);
      this.scene.add(rock);
    });
  }

  private addPaths() {
    const pathMaterial = this.createStonePathMaterial();

    const segments: Array<{ start: Vector3; end: Vector3; width: number }> = [
      { start: new Vector3(-40, 0, -30), end: new Vector3(0, 0, 0), width: 5 },
      { start: new Vector3(0, 0, 0), end: new Vector3(0, 0, 45), width: 4 },
      { start: new Vector3(0, 0, 0), end: new Vector3(35, 0, -12), width: 4.5 },
      { start: new Vector3(-10, 0, 35), end: new Vector3(18, 0, 20), width: 3.5 },
      { start: new Vector3(-28, 0, 15), end: new Vector3(-8, 0, -10), width: 3.8 },
    ];

    segments.forEach(({ start, end, width }) => {
      const delta = new Vector2(end.x - start.x, end.z - start.z);
      const length = delta.length();
      const midPoint = start.clone().add(end).multiplyScalar(0.5);
      const geometry = new PlaneGeometry(length, width, Math.max(2, Math.floor(length / 5)), 2);
      geometry.rotateX(-Math.PI / 2);
      const yaw = Math.atan2(delta.x, delta.y);

      const position = geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        const edgeFactor = Math.abs(position.getZ(i)) / (width / 2);
        const wobble = (Math.random() - 0.5) * 0.2 + (edgeFactor > 0.8 ? (Math.random() - 0.5) * 0.4 : 0);
        const localX = position.getX(i);
        const localZ = position.getZ(i);
        const worldX = midPoint.x + localX * Math.cos(yaw) - localZ * Math.sin(yaw);
        const worldZ = midPoint.z + localX * Math.sin(yaw) + localZ * Math.cos(yaw);
        const baseHeight = this.sampleTerrainHeight(worldX, worldZ);

        position.setY(i, baseHeight + wobble + 0.03);
      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();

      const path = new Mesh(geometry, pathMaterial);
      path.position.copy(midPoint);
      path.rotation.y = Math.atan2(delta.x, delta.y);
      path.receiveShadow = true;
      this.scene.add(path);
    });

    const plazaGeometry = new CylinderGeometry(0.1, 0.1, 0.1, 6);
    const plaza = new Mesh(plazaGeometry, pathMaterial);
    plaza.scale.set(10, 0.2, 10);
    this.alignToTerrain(plaza, 0.07);
    plaza.receiveShadow = true;
    this.scene.add(plaza);
  }

  private createStonePathMaterial() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new MeshStandardMaterial({ color: 0x9d9487 });

    ctx.fillStyle = '#9d9487';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 140; i++) {
      const stoneWidth = 18 + Math.random() * 28;
      const stoneHeight = 12 + Math.random() * 20;
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.6);
      ctx.fillStyle = `rgba(${140 + Math.random() * 30}, ${135 + Math.random() * 25}, ${120 + Math.random() * 20}, 0.95)`;
      ctx.fillRect(-stoneWidth / 2, -stoneHeight / 2, stoneWidth, stoneHeight);
      ctx.strokeStyle = 'rgba(60, 55, 45, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(-stoneWidth / 2, -stoneHeight / 2, stoneWidth, stoneHeight);
      ctx.restore();
    }

    ctx.globalCompositeOperation = 'multiply';
    const vignette = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 1.2);
    vignette.addColorStop(0, 'rgba(255,255,255,0.25)');
    vignette.addColorStop(1, 'rgba(90,80,70,0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, size, size);

    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.needsUpdate = true;

    return new MeshStandardMaterial({
      map: texture,
      color: 0xa19688,
      roughness: 0.8,
      metalness: 0.05,
    });
  }

  private addMedievalDetails() {
    const props = new Group();

    const well = this.createStoneWell();
    well.position.set(5, 0, 5);
    this.alignToTerrain(well);
    this.registerCollider(new Vector3(5, 0, 5), 2.6);
    props.add(well);

    const camp = this.createCampfire();
    camp.position.set(-12, 0, 18);
    this.alignToTerrain(camp);
    this.registerCollider(new Vector3(-12, 0, 18), 1.9);
    props.add(camp);

    const crates = this.createCrateStack();
    crates.position.set(14, 0, -6);
    this.alignToTerrain(crates);
    this.registerCollider(new Vector3(14, 0, -6), 2.2);
    props.add(crates);

    this.scene.add(props);
  }

  private createStoneWell() {
    const baseMaterial = new MeshStandardMaterial({ color: 0x7f7b76, roughness: 0.9, metalness: 0.05 });
    const roofMaterial = new MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });

    const wall = new Mesh(new CylinderGeometry(2.2, 2.4, 1.6, 12, 1, true), baseMaterial);
    wall.position.y = 0.8;
    wall.castShadow = true;
    wall.receiveShadow = true;

    const cap = new Mesh(new CylinderGeometry(2.6, 2.6, 0.3, 12), baseMaterial);
    cap.position.y = 1.7;
    cap.castShadow = true;
    cap.receiveShadow = true;

    const roof = new Mesh(new ConeGeometry(2.8, 2.2, 4), roofMaterial);
    roof.position.y = 3.2;
    roof.castShadow = true;
    roof.receiveShadow = true;

    const well = new Group();
    well.add(wall);
    well.add(cap);
    well.add(roof);
    return well;
  }

  private createCampfire() {
    const firewoodMaterial = new MeshStandardMaterial({ color: 0x6e4b2a, roughness: 0.85 });
    const flameMaterial = new MeshStandardMaterial({ color: 0xffb347, emissive: 0xff6b1a, emissiveIntensity: 0.9 });

    const logGeometry = new CylinderGeometry(0.25, 0.25, 2, 8);
    const logs = new Group();
    const rotations = [0, Math.PI / 3, (2 * Math.PI) / 3];
    rotations.forEach((rot, i) => {
      const log = new Mesh(logGeometry, firewoodMaterial);
      log.position.y = 0.35;
      log.rotation.z = 0.3;
      log.rotation.y = rot;
      log.castShadow = true;
      log.receiveShadow = true;
      logs.add(log);
    });

    const flame = new Mesh(new ConeGeometry(0.8, 1.4, 8), flameMaterial);
    flame.position.y = 1;
    flame.castShadow = true;

    const stones = new Mesh(new CylinderGeometry(1.4, 1.4, 0.25, 10), new MeshStandardMaterial({ color: 0x7d7068 }));
    stones.position.y = 0.15;
    stones.receiveShadow = true;

    const campfire = new Group();
    campfire.add(stones);
    campfire.add(logs);
    campfire.add(flame);

    return campfire;
  }

  private createCrateStack() {
    const crateMaterial = new MeshStandardMaterial({ color: 0x8b6f4b, roughness: 0.8 });
    const crateGeometry = new DodecahedronGeometry(1.2, 0);

    const stack = new Group();
    const positions = [
      new Vector3(0, 0.9, 0),
      new Vector3(1.5, 0.9, -0.6),
      new Vector3(0.7, 2.1, -0.3),
    ];

    positions.forEach((pos) => {
      const crate = new Mesh(crateGeometry.clone(), crateMaterial);
      crate.position.copy(pos);
      crate.castShadow = true;
      crate.receiveShadow = true;
      stack.add(crate);
    });

    const banner = new Mesh(new CylinderGeometry(0.06, 0.06, 3, 6), new MeshStandardMaterial({ color: 0x5c3b1a }));
    banner.position.set(-1.2, 1.5, 0.4);
    banner.castShadow = true;
    banner.receiveShadow = true;

    const flag = new Mesh(
      new PlaneGeometry(1.2, 1.6),
      new MeshStandardMaterial({ color: 0x9a1b1b, side: DoubleSide }),
    );
    flag.position.set(-1.2, 2.5, 0.4);
    flag.rotation.y = Math.PI / 2.2;
    flag.castShadow = true;

    stack.add(banner);
    stack.add(flag);

    return stack;
  }

  private alignToTerrain(object: Mesh | Group, offset = 0) {
    const position = object.position;
    position.y = this.sampleTerrainHeight(position.x, position.z) + offset;
  }

  private sampleTerrainHeight(x: number, z: number): number {
    const largeUndulation = (this.valueNoise(x, z, 0.015) - 0.5) * 4.0;
    const mediumHills = (this.valueNoise(x, z, 0.045) - 0.5) * 2.0;
    const fineDetail = (this.valueNoise(x + 200, z - 120, 0.12) - 0.5) * 1.0;

    const distance = Math.sqrt(x * x + z * z);
    const softness = 0.3 + 0.7 * Math.min(1, distance / 80);

    return (largeUndulation + mediumHills + fineDetail) * softness;
  }

  private valueNoise(x: number, z: number, frequency: number): number {
    const sampleX = x * frequency;
    const sampleZ = z * frequency;

    const x0 = Math.floor(sampleX);
    const z0 = Math.floor(sampleZ);
    const x1 = x0 + 1;
    const z1 = z0 + 1;

    const tx = this.fade(sampleX - x0);
    const tz = this.fade(sampleZ - z0);

    const v00 = this.hash(x0, z0);
    const v10 = this.hash(x1, z0);
    const v01 = this.hash(x0, z1);
    const v11 = this.hash(x1, z1);

    const lerpX0 = v00 + (v10 - v00) * tx;
    const lerpX1 = v01 + (v11 - v01) * tx;

    return lerpX0 + (lerpX1 - lerpX0) * tz;
  }

  private fade(t: number): number {
    return t * t * (3 - 2 * t);
  }

  private hash(x: number, z: number): number {
    const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  private handleResize = () => {
    const { innerWidth, innerHeight } = window;
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  };

  private loop = (timestamp: number) => {
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.updatables.forEach((entity) => entity.update(dt));

    if (this.player) {
      this.updateCamera(this.player);
    }

    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.loop);
  };

  private handleMouseDown = (event: MouseEvent) => {
    if (event.button === 2) {
      this.isDragging = true;
      this.previousMouse = { x: event.clientX, y: event.clientY };
      event.preventDefault();
      return;
    }

    if (event.button === 0) {
      this.setMovementTarget(event);
    }
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.previousMouse.x;
    const deltaY = event.clientY - this.previousMouse.y;
    this.previousMouse = { x: event.clientX, y: event.clientY };

    const rotationSpeed = 0.005;
    this.cameraYaw -= deltaX * rotationSpeed;
    this.cameraPitch = Math.min(Math.max(this.cameraPitch - deltaY * rotationSpeed, 0.1), 1.4);
  };

  private handleMouseUp = () => {
    this.isDragging = false;
  };

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const zoomChange = event.deltaY * 0.002;
    this.cameraDistance = Math.min(Math.max(this.cameraDistance + zoomChange, 6), 22);
  };

  private setMovementTarget(event: MouseEvent) {
    if (!this.player) return;

    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const target = new Vector3();
    const intersection = this.raycaster.ray.intersectPlane(this.groundPlane, target);

    if (intersection) {
      intersection.y = 0;
      this.player.setDestination(intersection);
    }
  }

  private updateCamera(player: Player) {
    const offset = new Vector3(
      Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch),
      Math.sin(this.cameraPitch),
      Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch),
    ).multiplyScalar(this.cameraDistance);

    this.smoothedFocus.lerp(player.position, 0.15);
    const desiredPosition = this.smoothedFocus.clone().add(offset);
    this.camera.position.lerp(desiredPosition, 0.1);
    this.camera.lookAt(this.smoothedFocus);
  }
}
