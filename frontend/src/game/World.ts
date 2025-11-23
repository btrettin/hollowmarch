import {
  Color,
  HemisphereLight,
  DirectionalLight,
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
