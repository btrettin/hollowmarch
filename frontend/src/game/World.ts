import {
  Color,
  HemisphereLight,
  DirectionalLight,
  CylinderGeometry,
  ConeGeometry,
  DodecahedronGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { Input } from './Input';
import { Player, Updatable } from './Player';

export class World {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private input: Input;
  private updatables: Updatable[] = [];
  private player: Player | null = null;
  private lastTime = 0;
  private animationFrame = 0;

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

    this.input = new Input();

    this.addLighting();
    this.addGround();
    this.populateEnvironment();
    window.addEventListener('resize', this.handleResize);
  }

  addPlayer(player: Player) {
    this.player = player;
    this.updatables.push(player);
    this.scene.add(player.mesh);
  }

  start() {
    this.lastTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  dispose() {
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener('resize', this.handleResize);
    this.input.dispose();
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
    const groundGeometry = new PlaneGeometry(200, 200);
    const groundMaterial = new MeshStandardMaterial({ color: 0x2e7d32 });
    const ground = new Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private populateEnvironment() {
    this.addTrees();
    this.addRocks();
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
      rock.position.set(x, 0.8, z);
      rock.scale.setScalar(scale);
      rock.rotation.set(Math.random() * 0.5, Math.random() * Math.PI * 2, Math.random() * 0.5);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
    });
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

    if (this.player) {
      this.applyInput(this.player);
    }

    this.updatables.forEach((entity) => entity.update(dt));

    if (this.player) {
      this.updateCamera(this.player);
    }

    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.loop);
  };

  private applyInput(player: Player) {
    const movement = this.input.getMovementVector();

    if (movement.z < 0) player.moveForward();
    if (movement.z > 0) player.moveBackward();
    if (movement.x < 0) player.moveLeft();
    if (movement.x > 0) player.moveRight();
  }

  private updateCamera(player: Player) {
    const followHeight = new Vector3(0, 6, 0);
    const backward = player.direction.clone().normalize().multiplyScalar(-10);
    const offset = followHeight.add(backward);

    const desiredPosition = player.position.clone().add(offset);
    this.camera.position.lerp(desiredPosition, 0.1);
    this.camera.lookAt(player.position);
  }
}
