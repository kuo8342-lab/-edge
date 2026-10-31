/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { 
  GameStatus, 
  GameTheme, 
  CameraViewMode, 
  CharacterConfig, 
  ActiveObstacle, 
  ActiveItem, 
  ActiveRamp, 
  MonsterData, 
  GameMetrics,
  ObstacleType
} from '../types/game';
import { soundManager } from '../audio/soundManager';
import { 
  createPlayerMesh, 
  createKrakenMesh, 
  createYetiMonsterMesh, 
  createObstacleMesh, 
  createRampMesh, 
  createItemMesh 
} from './modelFactory';
import { createWaterFoamTexture, createSnowTexture } from './proceduralAssets';

// Reusable math vectors for zero-garbage collection in the render loop
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _camPosTarget = new THREE.Vector3();

export interface EngineCallbacks {
  onMetricsUpdate: (metrics: GameMetrics) => void;
  onRadarUpdate: (
    playerPos: { x: number; z: number; rotationY: number },
    monster: MonsterData | null,
    obstacles: ActiveObstacle[],
    items: ActiveItem[],
    ramps: ActiveRamp[]
  ) => void;
  onGameOver: (finalScore: number, distance: number) => void;
}

export class SurfGameEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private isSoftwareGl: boolean = false;
  private animationFrameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  // Terrain
  private terrainGroup!: THREE.Group;
  private terrainPlanes: THREE.Mesh[] = [];
  private waterTexture!: THREE.CanvasTexture;
  private snowTexture!: THREE.CanvasTexture;

  // Player state
  private playerGroup!: THREE.Group;
  private playerShieldMesh!: THREE.Mesh;
  private playerX: number = 0;
  private playerZ: number = 0;
  private playerY: number = 0;
  private playerVy: number = 0;
  private playerTilt: number = 0;
  private playerPitch: number = 0;
  private playerSpinAngle: number = 0;
  private isGrounded: boolean = true;
  private isInvulnerable: boolean = false;
  private invulnerableTimer: number = 0;

  // Movement & physics
  private baseSpeed: number = 22; // forward units / sec
  private currentSpeed: number = 22;
  private maxBoostSpeed: number = 38;
  private boostMeter: number = 100;
  private isBoosting: boolean = false;
  private score: number = 0;
  private distance: number = 0;
  private lives: number = 3;
  private maxLives: number = 3;
  private airTricksCount: number = 0;
  private monstersEscaped: number = 0;

  // Inputs
  private keysHeld: { [key: string]: boolean } = {};
  private steeringInput: number = 0; // -1 to 1

  // Monster state
  private monsterGroup: THREE.Group | null = null;
  private monsterData: MonsterData = {
    state: 'DORMANT',
    x: 0,
    z: 35,
    targetX: 0,
    speed: 24,
    distanceToPlayer: 40,
    attackTimer: 0,
    surfaceRatio: 0,
    warningCountdown: 0,
    activeType: 'KRAKEN'
  };
  private monsterSpawnTimer: number = 18; // spawns every ~25-30s

  // Spawners & Objects
  private obstacles: { mesh: THREE.Group; data: ActiveObstacle }[] = [];
  private items: { mesh: THREE.Group; data: ActiveItem }[] = [];
  private ramps: { mesh: THREE.Group; data: ActiveRamp }[] = [];
  private nextObstacleZ: number = -40;
  private nextId: number = 1;

  // Particle System (Water spray / snow powder / speed lines)
  private particleCount: number = 160;
  private particleGeom!: THREE.BufferGeometry;
  private particlePositions!: Float32Array;
  private particleVelocities!: Float32Array;
  private particleLifes!: Float32Array;
  private particlePoints!: THREE.Points;

  // Configuration
  private currentTheme: GameTheme = 'OCEAN';
  private currentCameraMode: CameraViewMode = 'CHASE';
  private currentCharacter!: CharacterConfig;
  private gameStatus: GameStatus = 'TITLE';

  // Environmental lighting references
  private keyLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;

  constructor(container: HTMLElement, character: CharacterConfig, callbacks: EngineCallbacks) {
    this.container = container;
    this.currentCharacter = character;
    this.callbacks = callbacks;

    this.checkSoftwareGl();
    this.initThree();
    this.initEnvironment();
    this.initTerrain();
    this.initPlayer();
    this.initParticles();
    this.bindEvents();

    this.applyTheme(this.currentTheme);
    this.startLoop();
  }

  private checkSoftwareGl() {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) {
      this.isSoftwareGl = true;
      return;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  }

  private initThree() {
    this.scene = new THREE.Scene();
    
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(58, width / height, 0.2, 350);
    this.camera.position.set(0, 5, 12);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Procedural Studio Environment for realistic PBR reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();
  }

  private initEnvironment() {
    // Key Light
    this.keyLight = new THREE.DirectionalLight(0xfff3e0, 2.2);
    this.keyLight.position.set(25, 45, 15);
    this.keyLight.castShadow = !this.isSoftwareGl;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 10;
    this.keyLight.shadow.camera.far = 130;
    const d = 30;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.keyLight.shadow.bias = -0.0004;
    this.scene.add(this.keyLight);

    // Hemisphere Light (Sky cool, ground warm)
    this.hemiLight = new THREE.HemisphereLight(0x81ecec, 0x0984e3, 1.2);
    this.scene.add(this.hemiLight);

    // Horizon matched Fog
    this.scene.fog = new THREE.FogExp2(0x0288d1, 0.008);
  }

  private initTerrain() {
    this.terrainGroup = new THREE.Group();
    this.scene.add(this.terrainGroup);

    this.waterTexture = createWaterFoamTexture();
    this.snowTexture = createSnowTexture();

    // We tile 3 large continuous terrain segments along Z for seamless scrolling
    const segmentLength = 160;
    const terrainWidth = 120;
    const geom = new THREE.PlaneGeometry(terrainWidth, segmentLength, 32, 32);
    geom.rotateX(-Math.PI / 2);

    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshStandardMaterial({
        map: this.waterTexture,
        roughness: 0.15,
        metalness: 0.25,
      });
      const plane = new THREE.Mesh(geom, mat);
      plane.receiveShadow = true;
      plane.position.set(0, 0, -i * segmentLength);
      this.terrainPlanes.push(plane);
      this.terrainGroup.add(plane);
    }
  }

  private initPlayer() {
    this.playerGroup = createPlayerMesh(this.currentCharacter);
    this.playerGroup.position.set(0, 0, 0);
    this.scene.add(this.playerGroup);

    // Shield mesh for invulnerability bubble
    const shieldGeom = new THREE.SphereGeometry(2.0, 16, 12);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00d2d3,
      transparent: true,
      opacity: 0,
      wireframe: true
    });
    this.playerShieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
    this.playerShieldMesh.position.y = 1.0;
    this.playerGroup.add(this.playerShieldMesh);
  }

  private initParticles() {
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleVelocities = new Float32Array(this.particleCount * 3);
    this.particleLifes = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      this.particlePositions[i * 3 + 1] = -100; // start hidden
      this.particleLifes[i] = 0;
    }

    this.particleGeom = new THREE.BufferGeometry();
    this.particleGeom.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.45,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.particlePoints = new THREE.Points(this.particleGeom, pMat);
    this.scene.add(this.particlePoints);
  }

  private emitWaterOrSnowSpray(x: number, y: number, z: number, count: number = 3, isBoost: boolean = false) {
    let emitted = 0;
    for (let i = 0; i < this.particleCount && emitted < count; i++) {
      if (this.particleLifes[i] <= 0) {
        this.particlePositions[i * 3] = x + (Math.random() - 0.5) * 0.8;
        this.particlePositions[i * 3 + 1] = y + 0.1 + Math.random() * 0.2;
        this.particlePositions[i * 3 + 2] = z + 1.2 + Math.random() * 0.5;

        this.particleVelocities[i * 3] = (Math.random() - 0.5) * (isBoost ? 6 : 3);
        this.particleVelocities[i * 3 + 1] = 2.0 + Math.random() * (isBoost ? 5 : 2.5);
        this.particleVelocities[i * 3 + 2] = 4.0 + Math.random() * 4;

        this.particleLifes[i] = 0.4 + Math.random() * 0.3;
        emitted++;
      }
    }
  }

  public applyTheme(theme: GameTheme) {
    this.currentTheme = theme;
    const isSnow = theme === 'SNOW';

    // Update terrain texture & materials
    const activeTex = isSnow ? this.snowTexture : this.waterTexture;
    activeTex.repeat.set(isSnow ? 8 : 6, isSnow ? 14 : 10);

    this.terrainPlanes.forEach(plane => {
      const mat = plane.material as THREE.MeshStandardMaterial;
      mat.map = activeTex;
      mat.roughness = isSnow ? 0.85 : 0.15;
      mat.metalness = isSnow ? 0.05 : 0.25;
      mat.needsUpdate = true;
    });

    // Update background & fog with high-contrast alpine sky for snow
    const bgColor = isSnow ? 0x608aa8 : 0x0288d1;
    this.scene.background = new THREE.Color(bgColor);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(bgColor);
      this.scene.fog.density = isSnow ? 0.0075 : 0.008;
    }

    // Update hemisphere lighting
    if (isSnow) {
      this.hemiLight.color.setHex(0xe8f0f8);
      this.hemiLight.groundColor.setHex(0x54728c);
    } else {
      this.hemiLight.color.setHex(0x81ecec);
      this.hemiLight.groundColor.setHex(0x0984e3);
    }

    // Recreate Monster mesh for active theme if existing
    if (this.monsterGroup) {
      this.scene.remove(this.monsterGroup);
      this.monsterGroup = null;
    }
    this.monsterData.activeType = isSnow ? 'YETI' : 'KRAKEN';
  }

  public setCharacter(charConfig: CharacterConfig) {
    this.currentCharacter = charConfig;
    if (this.playerGroup) {
      this.scene.remove(this.playerGroup);
    }
    this.initPlayer();
  }

  public setCameraMode(mode: CameraViewMode) {
    this.currentCameraMode = mode;
  }

  public cycleCameraMode(): CameraViewMode {
    const modes: CameraViewMode[] = ['CHASE', 'RETRO_TOP', 'FIRST_PERSON', 'CINEMATIC'];
    const idx = modes.indexOf(this.currentCameraMode);
    const nextMode = modes[(idx + 1) % modes.length];
    this.setCameraMode(nextMode);
    return nextMode;
  }

  public setSteering(val: number) {
    this.steeringInput = Math.max(-1, Math.min(1, val));
  }

  public setBoosting(boosting: boolean) {
    this.isBoosting = boosting && this.boostMeter > 5;
  }

  public setGameStatus(status: GameStatus) {
    this.gameStatus = status;
    if (status === 'PLAYING') {
      this.clock.start();
    }
  }

  public resetGame() {
    this.playerX = 0;
    this.playerZ = 0;
    this.playerY = 0;
    this.playerVy = 0;
    this.playerTilt = 0;
    this.playerPitch = 0;
    this.playerSpinAngle = 0;
    this.isGrounded = true;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.score = 0;
    this.distance = 0;
    this.lives = 3;
    this.boostMeter = 100;
    this.isBoosting = false;
    this.airTricksCount = 0;
    this.monstersEscaped = 0;
    this.nextObstacleZ = -40;

    // Clear obstacles & items
    this.obstacles.forEach(o => this.scene.remove(o.mesh));
    this.items.forEach(i => this.scene.remove(i.mesh));
    this.ramps.forEach(r => this.scene.remove(r.mesh));
    this.obstacles = [];
    this.items = [];
    this.ramps = [];

    // Reset Monster
    if (this.monsterGroup) {
      this.scene.remove(this.monsterGroup);
      this.monsterGroup = null;
    }
    this.monsterData.state = 'DORMANT';
    this.monsterData.z = 40;
    this.monsterData.warningCountdown = 0;
    this.monsterSpawnTimer = 16;

    // Reset player position
    this.playerGroup.position.set(0, 0, 0);
    this.playerGroup.rotation.set(0, 0, 0);

    this.setGameStatus('PLAYING');
  }

  private bindEvents() {
    window.addEventListener('keydown', (e) => {
      this.keysHeld[e.code] = true;
      if (e.code === 'KeyV') {
        this.cycleCameraMode();
      }
      if (e.code === 'KeyM') {
        soundManager.toggleMute();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keysHeld = {};
      this.steeringInput = 0;
      this.isBoosting = false;
    });

    // Pointer / mouse drag steering for smooth browser and mobile play
    let isPointerDown = false;
    let startX = 0;

    this.container.addEventListener('pointerdown', (e) => {
      isPointerDown = true;
      startX = e.clientX;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      const dx = e.clientX - startX;
      // Proportional steering from drag offset
      const sensitivity = 0.012;
      this.steeringInput = Math.max(-1, Math.min(1, dx * sensitivity));
    });

    const pointerEnd = () => {
      isPointerDown = false;
      this.steeringInput = 0;
    };
    window.addEventListener('pointerup', pointerEnd);
    window.addEventListener('pointercancel', pointerEnd);

    const onResize = () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);
  }

  private updateInput(dt: number) {
    if (this.gameStatus !== 'PLAYING') return;

    // Keyboard steering
    let steer = 0;
    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) steer -= 1;
    if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) steer += 1;

    // Touch / mouse fallback
    if (steer === 0 && this.steeringInput !== 0) {
      steer = this.steeringInput;
    }

    // Smooth steering response
    const steerSpeed = 22;
    this.playerX += steer * steerSpeed * dt;
    // Bounds clamping (-22 to 22)
    this.playerX = Math.max(-22, Math.min(22, this.playerX));

    // Target tilt roll when carving
    const targetTilt = -steer * 0.45;
    this.playerTilt = THREE.MathUtils.damp(this.playerTilt, targetTilt, 12, dt);

    // Boost key
    const boostRequested = this.keysHeld['Space'] || this.isBoosting;
    if (boostRequested && this.boostMeter > 2) {
      this.isBoosting = true;
      this.boostMeter = Math.max(0, this.boostMeter - dt * 26);
      if (Math.random() < 0.25) soundManager.playBoostThrust();
    } else {
      this.isBoosting = false;
      // Passive recharge
      this.boostMeter = Math.min(100, this.boostMeter + dt * 8);
    }

    // Speed calculation
    const accelSpeed = this.keysHeld['KeyW'] || this.keysHeld['ArrowUp'] ? 4 : 0;
    const brakeSpeed = this.keysHeld['KeyS'] || this.keysHeld['ArrowDown'] ? -8 : 0;
    const targetSpeed = (this.isBoosting ? this.maxBoostSpeed : this.baseSpeed) + accelSpeed + brakeSpeed;
    this.currentSpeed = THREE.MathUtils.damp(this.currentSpeed, targetSpeed, 6, dt);
  }

  private updatePlayerPhysics(dt: number) {
    // Forward progression (-Z)
    this.playerZ -= this.currentSpeed * dt;
    this.distance = Math.floor(Math.abs(this.playerZ));
    this.score += Math.floor(this.currentSpeed * dt * 2.5);

    // Air physics & jumps
    if (!this.isGrounded) {
      const gravity = 28;
      this.playerVy -= gravity * dt;
      this.playerY += this.playerVy * dt;

      // Air trick spin!
      this.playerSpinAngle += dt * 14;
      this.playerPitch = Math.sin(this.playerSpinAngle) * 0.3;

      if (this.playerY <= 0) {
        // Landing!
        this.playerY = 0;
        this.playerVy = 0;
        this.isGrounded = true;
        this.playerSpinAngle = 0;
        this.playerPitch = 0;
        soundManager.playLanding();
        this.emitWaterOrSnowSpray(this.playerX, 0, this.playerZ, 12, false);
      }
    } else {
      // Gentle surface wave bobbing
      const bobFreq = this.currentSpeed * 0.4;
      this.playerY = Math.sin(this.distance * 0.15 + bobFreq) * 0.08;
    }

    // Invulnerability flashing
    if (this.isInvulnerable) {
      this.invulnerableTimer -= dt;
      const flash = Math.sin(this.invulnerableTimer * 20) > 0;
      (this.playerShieldMesh.material as THREE.MeshBasicMaterial).opacity = flash ? 0.6 : 0.2;

      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        (this.playerShieldMesh.material as THREE.MeshBasicMaterial).opacity = 0;
      }
    }

    // Update 3D player group transform
    this.playerGroup.position.set(this.playerX, this.playerY, this.playerZ);
    this.playerGroup.rotation.z = this.playerTilt;
    this.playerGroup.rotation.x = this.playerPitch;
    if (!this.isGrounded) {
      this.playerGroup.rotation.y = this.playerSpinAngle;
    } else {
      this.playerGroup.rotation.y = -this.playerTilt * 0.35;
    }

    // Audio & particles
    soundManager.updateGlideSound(this.currentSpeed / this.baseSpeed, !this.isGrounded, this.isBoosting);
    if (this.isGrounded && Math.random() < 0.6) {
      this.emitWaterOrSnowSpray(this.playerX, this.playerY, this.playerZ, this.isBoosting ? 4 : 2, this.isBoosting);
    }
  }

  private updateTerrain() {
    // Continuously cycle the 3 terrain segments ahead
    const segmentLength = 160;
    this.terrainPlanes.forEach(plane => {
      if (plane.position.z > this.playerZ + segmentLength * 0.7) {
        plane.position.z -= segmentLength * 3;
      }
    });

    // Move Key Light along with player
    this.keyLight.position.z = this.playerZ + 15;
    this.keyLight.target.position.set(this.playerX, 0, this.playerZ - 10);
    this.keyLight.target.updateMatrixWorld();
  }

  private spawnProceduralChunks() {
    const spawnHorizon = this.playerZ - 180;
    const isSnow = this.currentTheme === 'SNOW';

    while (this.nextObstacleZ > spawnHorizon) {
      this.nextObstacleZ -= 18 + Math.random() * 12;

      // 1. Roll for Jump Ramp
      if (Math.random() < 0.16) {
        const rampType = Math.random() < 0.3 ? 'MEGA_RAMP' : 'STANDARD_RAMP';
        const rampMesh = createRampMesh(rampType, isSnow);
        const rampX = (Math.random() - 0.5) * 28;
        rampMesh.position.set(rampX, 0, this.nextObstacleZ);
        this.scene.add(rampMesh);

        this.ramps.push({
          mesh: rampMesh,
          data: {
            id: this.nextId++,
            type: rampType,
            x: rampX,
            z: this.nextObstacleZ,
            width: rampType === 'MEGA_RAMP' ? 4.5 : 3.0,
            length: rampType === 'MEGA_RAMP' ? 5.0 : 3.6,
            height: rampType === 'MEGA_RAMP' ? 1.6 : 1.1
          }
        });
      }

      // 2. Roll for Collectible Item (Star, Boost, Heart)
      if (Math.random() < 0.45) {
        const rand = Math.random();
        const itemType = rand < 0.65 ? 'STAR' : rand < 0.9 ? 'BOOST' : 'HEART';
        const itemMesh = createItemMesh(itemType);
        const itemX = (Math.random() - 0.5) * 32;
        itemMesh.position.set(itemX, 0.9, this.nextObstacleZ + 6);
        this.scene.add(itemMesh);

        this.items.push({
          mesh: itemMesh,
          data: {
            id: this.nextId++,
            type: itemType,
            x: itemX,
            z: this.nextObstacleZ + 6,
            radius: 1.1,
            collected: false,
            bobPhase: Math.random() * Math.PI * 2
          }
        });
      }

      // 3. Roll for 1 to 3 Obstacles
      const count = Math.floor(1 + Math.random() * 2.5);
      const types: ObstacleType[] = isSnow 
        ? ['PINE_TREE', 'SNOW_ROCK', 'SLALOM_FLAG', 'ICE_CHASM']
        : ['ROCK', 'CORAL', 'BUOY', 'ISLAND', 'WHIRLPOOL'];

      for (let c = 0; c < count; c++) {
        const obsType = types[Math.floor(Math.random() * types.length)];
        const mesh = createObstacleMesh(obsType);
        const ox = (Math.random() - 0.5) * 36;
        const oz = this.nextObstacleZ + (Math.random() - 0.5) * 8;
        mesh.position.set(ox, 0, oz);
        mesh.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(mesh);

        const radius = obsType === 'ISLAND' ? 3.0 : obsType === 'ICE_CHASM' ? 2.5 : 1.4;
        this.obstacles.push({
          mesh,
          data: {
            id: this.nextId++,
            type: obsType,
            x: ox,
            z: oz,
            radius,
            rotationY: mesh.rotation.y,
            scale: 1.0
          }
        });
      }
    }

    // Cleanup objects behind player (Z > playerZ + 40)
    const purgeZ = this.playerZ + 45;
    this.obstacles = this.obstacles.filter(o => {
      if (o.data.z > purgeZ) {
        this.scene.remove(o.mesh);
        return false;
      }
      return true;
    });

    this.items = this.items.filter(i => {
      if (i.data.z > purgeZ || i.data.collected) {
        this.scene.remove(i.mesh);
        return false;
      }
      return true;
    });

    this.ramps = this.ramps.filter(r => {
      if (r.data.z > purgeZ) {
        this.scene.remove(r.mesh);
        return false;
      }
      return true;
    });
  }

  private updateObstaclesAndItems(dt: number) {
    // Animate items bobbing and rotating
    const now = performance.now() * 0.003;
    this.items.forEach(i => {
      i.mesh.rotation.y += dt * 2.5;
      i.mesh.position.y = 0.9 + Math.sin(now + i.data.bobPhase) * 0.25;

      // Check pickup collision
      const dx = this.playerX - i.data.x;
      const dz = this.playerZ - i.data.z;
      const distSq = dx * dx + dz * dz;

      if (!i.data.collected && distSq < (i.data.radius + 1.2) * (i.data.radius + 1.2)) {
        i.data.collected = true;
        this.scene.remove(i.mesh);

        if (i.data.type === 'STAR') {
          this.score += 250;
          soundManager.playCollectStar();
        } else if (i.data.type === 'BOOST') {
          this.boostMeter = Math.min(100, this.boostMeter + 40);
          this.score += 150;
          soundManager.playCollectBoost();
        } else if (i.data.type === 'HEART') {
          if (this.lives < this.maxLives) this.lives++;
          this.score += 300;
          soundManager.playCollectHeart();
        }
      }
    });

    // Check Ramp Jumps
    this.ramps.forEach(r => {
      const dx = Math.abs(this.playerX - r.data.x);
      const dz = this.playerZ - r.data.z;

      if (dx < r.data.width * 0.55 && dz > -r.data.length * 0.5 && dz < r.data.length * 0.5) {
        if (this.isGrounded) {
          // Launch into the sky!
          this.isGrounded = false;
          const jumpPower = r.data.type === 'MEGA_RAMP' ? 18 : 13;
          this.playerVy = jumpPower;
          this.airTricksCount++;
          this.score += r.data.type === 'MEGA_RAMP' ? 600 : 350;
          soundManager.playRampJump();
          soundManager.playTrickSpin();
        }
      }
    });

    // Check Obstacle Collisions
    if (!this.isInvulnerable && this.isGrounded) {
      for (const obs of this.obstacles) {
        const dx = this.playerX - obs.data.x;
        const dz = this.playerZ - obs.data.z;
        const distSq = dx * dx + dz * dz;
        const minDist = obs.data.radius + 0.8;

        if (distSq < minDist * minDist) {
          // Crash!
          this.handleCrash();
          break;
        }
      }
    }
  }

  private handleCrash() {
    this.lives -= 1;
    this.currentSpeed = Math.max(8, this.currentSpeed * 0.35);
    this.isInvulnerable = true;
    this.invulnerableTimer = 2.4;
    soundManager.playCrash();
    this.emitWaterOrSnowSpray(this.playerX, 0, this.playerZ, 16, true);

    if (this.lives <= 0) {
      this.gameStatus = 'GAMEOVER';
      this.callbacks.onGameOver(this.score, this.distance);
    }
  }

  /**
   * Monster Logic (Kraken 🐙 or Yeti ❄️)
   * The monster stalks, warns, hunts, and can be escaped!
   */
  private updateMonster(dt: number) {
    const isSnow = this.currentTheme === 'SNOW';

    if (this.monsterData.state === 'DORMANT') {
      this.monsterSpawnTimer -= dt;
      if (this.monsterSpawnTimer <= 0) {
        // Monster begins hunting!
        this.monsterData.state = 'WARNING';
        this.monsterData.warningCountdown = 4.0;
        this.monsterData.z = this.playerZ + 60; // behind player
        this.monsterData.x = this.playerX + (Math.random() - 0.5) * 15;
        this.monsterData.targetX = this.playerX;
        this.monsterData.activeType = isSnow ? 'YETI' : 'KRAKEN';
        this.monsterData.surfaceRatio = 0.1;
        this.monsterData.attackTimer = 16.0; // survival time needed to escape
        soundManager.playMonsterWarning();
      }
      return;
    }

    // Ensure 3D monster mesh exists
    if (!this.monsterGroup) {
      this.monsterGroup = isSnow ? createYetiMonsterMesh() : createKrakenMesh();
      this.scene.add(this.monsterGroup);
    }

    if (this.monsterData.state === 'WARNING') {
      this.monsterData.warningCountdown -= dt;
      // Stalking behind at distance
      this.monsterData.z = this.playerZ + 48;
      this.monsterData.x = THREE.MathUtils.damp(this.monsterData.x, this.playerX, 3, dt);

      if (this.monsterData.warningCountdown <= 0) {
        this.monsterData.state = 'HUNTING';
        this.monsterData.speed = this.baseSpeed + 4.5; // catches up unless player boosts!
        soundManager.playMonsterRoar(this.monsterData.activeType === 'KRAKEN');
      }
    } else if (this.monsterData.state === 'HUNTING') {
      this.monsterData.attackTimer -= dt;

      // Monster charges forward!
      this.monsterData.z -= this.monsterData.speed * dt;
      this.monsterData.x = THREE.MathUtils.damp(this.monsterData.x, this.playerX, 2.5, dt);
      this.monsterData.surfaceRatio = Math.min(1.0, this.monsterData.surfaceRatio + dt * 0.8);

      // Distance to player
      const dz = this.monsterData.z - this.playerZ;
      const dx = this.monsterData.x - this.playerX;
      this.monsterData.distanceToPlayer = Math.sqrt(dx * dx + dz * dz);

      // Animate tentacles or Yeti arms
      const tentacleGroup = this.monsterGroup.getObjectByName('tentacles');
      if (tentacleGroup) {
        const time = performance.now() * 0.005;
        tentacleGroup.children.forEach((t, idx) => {
          t.rotation.x = Math.sin(time + idx) * 0.35 + 0.2;
          t.rotation.z = Math.cos(time * 0.8 + idx) * 0.25;
        });
      }

      const yetiArms = this.monsterGroup.getObjectByName('yeti_arms');
      if (yetiArms) {
        const time = performance.now() * 0.008;
        yetiArms.children.forEach((arm, idx) => {
          arm.rotation.x = Math.sin(time + idx * Math.PI) * 0.8;
        });
      }

      // Check if monster caught the player!
      if (dz <= 3.0 && Math.abs(dx) < 3.2) {
        if (!this.isInvulnerable) {
          this.handleCrash();
          // Monster strikes and pauses
          this.monsterData.z = this.playerZ + 25;
          soundManager.playMonsterRoar(this.monsterData.activeType === 'KRAKEN');
        }
      }

      // Did player outrun & escape the monster?
      if (this.monsterData.attackTimer <= 0 || dz > 55) {
        this.monsterData.state = 'RETREATING';
        this.monstersEscaped++;
        this.score += 1000;
        soundManager.playMonsterEscape();
      }
    } else if (this.monsterData.state === 'RETREATING') {
      // Monster submerges / slows down
      this.monsterData.surfaceRatio = Math.max(0, this.monsterData.surfaceRatio - dt * 1.2);
      this.monsterData.z += 15 * dt;

      if (this.monsterData.surfaceRatio <= 0.02) {
        this.monsterData.state = 'DORMANT';
        this.monsterSpawnTimer = 24 + Math.random() * 10;
        if (this.monsterGroup) {
          this.scene.remove(this.monsterGroup);
          this.monsterGroup = null;
        }
      }
    }

    // Update 3D monster transform
    if (this.monsterGroup) {
      const sinkY = (1.0 - this.monsterData.surfaceRatio) * -7.0;
      this.monsterGroup.position.set(this.monsterData.x, sinkY, this.monsterData.z);
    }
  }

  private updateParticles(dt: number) {
    for (let i = 0; i < this.particleCount; i++) {
      if (this.particleLifes[i] > 0) {
        this.particleLifes[i] -= dt;
        this.particlePositions[i * 3] += this.particleVelocities[i * 3] * dt;
        this.particlePositions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * dt;
        this.particlePositions[i * 3 + 2] += this.particleVelocities[i * 3 + 2] * dt;
        this.particleVelocities[i * 3 + 1] -= 9.8 * dt; // gravity
      } else {
        this.particlePositions[i * 3 + 1] = -100; // hide
      }
    }
    this.particleGeom.attributes.position.needsUpdate = true;
  }

  private updateCamera(dt: number) {
    const px = this.playerX;
    const py = this.playerY;
    const pz = this.playerZ;

    switch (this.currentCameraMode) {
      case 'CHASE': {
        // Dynamic over-the-shoulder follow cam
        _camPosTarget.set(px * 0.45, py + 4.6, pz + 10.5);
        _camTarget.set(px, py + 1.2, pz - 12);
        this.camera.fov = this.isBoosting ? 64 : 58;
        break;
      }
      case 'RETRO_TOP': {
        // Vintage isometric Edge Surf angle
        _camPosTarget.set(px * 0.25, 17.5, pz + 15.0);
        _camTarget.set(px, 0.5, pz - 8.0);
        this.camera.fov = 54;
        break;
      }
      case 'FIRST_PERSON': {
        // Cockpit / board nose view
        _camPosTarget.set(px, py + 1.35, pz - 0.7);
        _camTarget.set(px + this.playerTilt * 2.5, py + 1.0, pz - 25);
        this.camera.fov = this.isBoosting ? 74 : 68;
        break;
      }
      case 'CINEMATIC': {
        // Low action dynamic tracker
        _camPosTarget.set(px - 4.2, py + 2.4, pz + 7.5);
        _camTarget.set(px + 1.0, py + 1.0, pz - 9);
        this.camera.fov = 62;
        break;
      }
    }

    this.camera.updateProjectionMatrix();
    this.camera.position.lerp(_camPosTarget, Math.min(1.0, 10 * dt));
    _v1.lerp(_camTarget, Math.min(1.0, 12 * dt));
    this.camera.lookAt(_v1);
  }

  private startLoop() {
    const tick = () => {
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      if (this.gameStatus === 'PLAYING') {
        this.updateInput(dt);
        this.updatePlayerPhysics(dt);
        this.updateTerrain();
        this.spawnProceduralChunks();
        this.updateObstaclesAndItems(dt);
        this.updateMonster(dt);
        this.updateParticles(dt);

        // Notify React HUD metrics
        this.callbacks.onMetricsUpdate({
          score: this.score,
          distance: this.distance,
          highScore: 0, // provided by caller
          lives: this.lives,
          maxLives: this.maxLives,
          speed: Math.round(this.currentSpeed * 3.6), // km/h representation
          boostMeter: Math.round(this.boostMeter),
          isBoosting: this.isBoosting,
          isInAir: !this.isGrounded,
          airTricksCount: this.airTricksCount,
          monstersEscaped: this.monstersEscaped,
          theme: this.currentTheme,
          character: this.currentCharacter,
          cameraMode: this.currentCameraMode
        });

        // Notify Top-Right Radar Mini-Map
        this.callbacks.onRadarUpdate(
          { x: this.playerX, z: this.playerZ, rotationY: this.playerGroup.rotation.y },
          this.monsterData.state !== 'DORMANT' ? this.monsterData : null,
          this.obstacles.map(o => o.data),
          this.items.map(i => i.data),
          this.ramps.map(r => r.data)
        );
      } else if (this.gameStatus === 'TITLE') {
        // Atmospheric live-world camera pan on title screen!
        const t = performance.now() * 0.0006;
        this.camera.position.set(Math.sin(t) * 16, 8 + Math.cos(t * 0.5) * 2, Math.cos(t) * 16);
        this.camera.lookAt(0, 1.2, 0);
      }

      if (this.gameStatus !== 'TITLE') {
        this.updateCamera(dt);
      }

      this.renderer.render(this.scene, this.camera);

      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  public dispose() {
    cancelAnimationFrame(this.animationFrameId);
    if (this.renderer) {
      this.renderer.dispose();
      if (this.container && this.renderer.domElement) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
  }
}
