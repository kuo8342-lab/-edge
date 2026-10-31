/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CharacterConfig, ObstacleType, ItemType, RampType } from '../types/game';
import { createEyeTexture, createRampChevronTexture } from './proceduralAssets';

// Helper for standard PBR materials
const sharedMaterials = {
  sand: new THREE.MeshStandardMaterial({ color: 0xf6d365, roughness: 0.9 }),
  palmTrunk: new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 }),
  palmLeaf: new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.5, side: THREE.DoubleSide }),
  coconut: new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 }),
  rock: new THREE.MeshStandardMaterial({ color: 0x57606f, roughness: 0.85 }),
  coral: new THREE.MeshStandardMaterial({ color: 0xff4757, roughness: 0.7 }),
  buoyRed: new THREE.MeshStandardMaterial({ color: 0xeb2f06, roughness: 0.4 }),
  buoyWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
  buoyLantern: new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.2, emissive: 0xf1c40f, emissiveIntensity: 0.6 }),
  pineTrunk: new THREE.MeshStandardMaterial({ color: 0x4a2f13, roughness: 0.9 }),
  pineNeedles: new THREE.MeshStandardMaterial({ color: 0x1b4d3e, roughness: 0.7 }),
  snowCap: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 }),
  iceRock: new THREE.MeshStandardMaterial({ color: 0x74b9ff, roughness: 0.5, metalness: 0.1 }),
  slalomRed: new THREE.MeshStandardMaterial({ color: 0xff3838, roughness: 0.4 }),
  slalomBlue: new THREE.MeshStandardMaterial({ color: 0x1e90ff, roughness: 0.4 }),
  whirlpoolRing: new THREE.MeshBasicMaterial({ color: 0x00d2d3, transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
  goldStar: new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.6, roughness: 0.2, emissive: 0xf39c12, emissiveIntensity: 0.4 }),
  boostCyan: new THREE.MeshStandardMaterial({ color: 0x00d2d3, metalness: 0.3, roughness: 0.2, emissive: 0x00cec9, emissiveIntensity: 0.8 }),
  heartRed: new THREE.MeshStandardMaterial({ color: 0xff4757, metalness: 0.2, roughness: 0.3, emissive: 0xff3838, emissiveIntensity: 0.5 })
};

/**
 * Creates 3-12 part procedural player model (Surfboard + Character)
 */
export function createPlayerMesh(config: CharacterConfig): THREE.Group {
  const root = new THREE.Group();

  // 1. SURFBOARD (Primary subject base)
  const boardGroup = new THREE.Group();
  boardGroup.name = 'surfboard';

  // Board deck with nose rocker curve
  const boardShape = new THREE.Shape();
  boardShape.moveTo(0, -1.8);
  boardShape.bezierCurveTo(0.65, -1.3, 0.75, 0.6, 0.55, 1.4);
  boardShape.bezierCurveTo(0.4, 2.0, 0, 2.3, 0, 2.3);
  boardShape.bezierCurveTo(0, 2.3, -0.4, 2.0, -0.55, 1.4);
  boardShape.bezierCurveTo(-0.75, 0.6, -0.65, -1.3, 0, -1.8);

  const extrudeSettings = {
    steps: 1,
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 3
  };

  const boardGeom = new THREE.ExtrudeGeometry(boardShape, extrudeSettings);
  boardGeom.center();
  // Rotate so board lies flat on X-Z plane with nose pointing forward (-Z)
  boardGeom.rotateX(Math.PI / 2);
  boardGeom.rotateY(Math.PI);

  const boardMat = new THREE.MeshStandardMaterial({
    color: config.boardColor,
    roughness: 0.2,
    metalness: 0.1
  });
  const boardMesh = new THREE.Mesh(boardGeom, boardMat);
  boardMesh.castShadow = true;
  boardMesh.receiveShadow = true;
  boardMesh.position.y = 0.12;
  boardGroup.add(boardMesh);

  // Center stringer / racing stripe
  const stripeGeom = new THREE.BoxGeometry(0.12, 0.05, 3.6);
  const stripeMat = new THREE.MeshStandardMaterial({
    color: config.boardStripeColor,
    roughness: 0.3
  });
  const stripeMesh = new THREE.Mesh(stripeGeom, stripeMat);
  stripeMesh.position.y = 0.22;
  boardGroup.add(stripeMesh);

  // Underside Thruster Fins (3 fins)
  const finGeom = new THREE.BoxGeometry(0.04, 0.25, 0.3);
  const finMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
  const centerFin = new THREE.Mesh(finGeom, finMat);
  centerFin.position.set(0, -0.05, 1.3);
  boardGroup.add(centerFin);

  const leftFin = new THREE.Mesh(finGeom, finMat);
  leftFin.position.set(-0.35, -0.05, 1.1);
  leftFin.rotation.y = 0.1;
  boardGroup.add(leftFin);

  const rightFin = new THREE.Mesh(finGeom, finMat);
  rightFin.position.set(0.35, -0.05, 1.1);
  rightFin.rotation.y = -0.1;
  boardGroup.add(rightFin);

  root.add(boardGroup);

  // 2. CHARACTER MODEL (Human, Penguin, or Yeti)
  const charGroup = new THREE.Group();
  charGroup.name = 'character';

  if (config.type === 'human') {
    // Torso / Wetsuit
    const torsoGeom = new THREE.CylinderGeometry(0.32, 0.26, 0.9, 8);
    const torsoMat = new THREE.MeshStandardMaterial({ color: config.suitColor, roughness: 0.6 });
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.set(0, 1.25, 0);
    torso.castShadow = true;
    charGroup.add(torso);

    // Head
    const headGeom = new THREE.SphereGeometry(0.26, 12, 10);
    const headMat = new THREE.MeshStandardMaterial({ color: config.skinColor, roughness: 0.7 });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.set(0, 1.95, 0);
    head.castShadow = true;
    charGroup.add(head);

    // Hair / Cap
    const hairGeom = new THREE.SphereGeometry(0.28, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairMat = new THREE.MeshStandardMaterial({ color: config.hairColor, roughness: 0.8 });
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.position.set(0, 2.05, 0);
    charGroup.add(hair);

    // Sunglasses / Visor
    const glassesGeom = new THREE.BoxGeometry(0.36, 0.1, 0.12);
    const glassesMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 });
    const glasses = new THREE.Mesh(glassesGeom, glassesMat);
    glasses.position.set(0, 1.98, -0.22);
    charGroup.add(glasses);

    // Left Arm (Out for balance)
    const armGeom = new THREE.CylinderGeometry(0.1, 0.08, 0.85, 6);
    const armMat = new THREE.MeshStandardMaterial({ color: config.skinColor, roughness: 0.7 });
    
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.55, 1.35, 0.15);
    leftArm.rotation.set(0.4, 0.2, 0.9);
    charGroup.add(leftArm);

    // Right Arm
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.55, 1.35, -0.15);
    rightArm.rotation.set(-0.3, -0.2, -0.9);
    charGroup.add(rightArm);

    // Legs in athletic surf stance (bent knees)
    const legGeom = new THREE.CylinderGeometry(0.13, 0.11, 0.7, 6);
    const shortsMat = new THREE.MeshStandardMaterial({ color: config.suitColor, roughness: 0.5 });
    
    const frontLeg = new THREE.Mesh(legGeom, shortsMat);
    frontLeg.position.set(-0.25, 0.55, -0.4);
    frontLeg.rotation.set(0.25, 0, -0.2);
    charGroup.add(frontLeg);

    const backLeg = new THREE.Mesh(legGeom, shortsMat);
    backLeg.position.set(0.25, 0.55, 0.45);
    backLeg.rotation.set(-0.25, 0, 0.2);
    charGroup.add(backLeg);

  } else if (config.type === 'penguin') {
    // Tuxedo body
    const bodyGeom = new THREE.SphereGeometry(0.55, 14, 12);
    bodyGeom.scale(0.8, 1.25, 0.9);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222f3e, roughness: 0.5 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.set(0, 1.0, 0);
    body.castShadow = true;
    charGroup.add(body);

    // White belly
    const bellyGeom = new THREE.SphereGeometry(0.48, 12, 10);
    bellyGeom.scale(0.65, 1.05, 0.5);
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xf1f2f6, roughness: 0.6 });
    const belly = new THREE.Mesh(bellyGeom, bellyMat);
    belly.position.set(0, 0.95, -0.4);
    charGroup.add(belly);

    // Yellow beak
    const beakGeom = new THREE.ConeGeometry(0.16, 0.4, 6);
    beakGeom.rotateX(-Math.PI / 2);
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xffa502, roughness: 0.4 });
    const beak = new THREE.Mesh(beakGeom, beakMat);
    beak.position.set(0, 1.35, -0.7);
    charGroup.add(beak);

    // Cute Sunglasses
    const shadesGeom = new THREE.BoxGeometry(0.5, 0.12, 0.1);
    const shadesMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, metalness: 0.8, roughness: 0.2 });
    const shades = new THREE.Mesh(shadesGeom, shadesMat);
    shades.position.set(0, 1.48, -0.58);
    charGroup.add(shades);

    // Flipper wings
    const wingGeom = new THREE.BoxGeometry(0.12, 0.7, 0.35);
    const leftWing = new THREE.Mesh(wingGeom, bodyMat);
    leftWing.position.set(-0.55, 1.0, 0);
    leftWing.rotation.set(0.2, 0, 0.6);
    charGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeom, bodyMat);
    rightWing.position.set(0.55, 1.0, 0);
    rightWing.rotation.set(0.2, 0, -0.6);
    charGroup.add(rightWing);

  } else {
    // Yeti character
    const yetiBodyGeom = new THREE.SphereGeometry(0.65, 12, 10);
    yetiBodyGeom.scale(1.1, 1.2, 0.95);
    const yetiMat = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.9 });
    const yetiBody = new THREE.Mesh(yetiBodyGeom, yetiMat);
    yetiBody.position.set(0, 1.15, 0);
    yetiBody.castShadow = true;
    charGroup.add(yetiBody);

    // Horns
    const hornGeom = new THREE.ConeGeometry(0.12, 0.45, 6);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x74b9ff, roughness: 0.3 });
    const leftHorn = new THREE.Mesh(hornGeom, hornMat);
    leftHorn.position.set(-0.45, 1.85, 0);
    leftHorn.rotation.set(0, 0, 0.6);
    charGroup.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeom, hornMat);
    rightHorn.position.set(0.45, 1.85, 0);
    rightHorn.rotation.set(0, 0, -0.6);
    charGroup.add(rightHorn);

    // Cool sunglasses
    const shadesGeom = new THREE.BoxGeometry(0.55, 0.15, 0.12);
    const shadesMat = new THREE.MeshStandardMaterial({ color: 0x0984e3, metalness: 0.8, roughness: 0.2 });
    const shades = new THREE.Mesh(shadesGeom, shadesMat);
    shades.position.set(0, 1.5, -0.58);
    charGroup.add(shades);
  }

  // Slight athletic surf angle
  charGroup.rotation.y = 0.45;
  root.add(charGroup);

  return root;
}

/**
 * Creates the Sea Monster (Kraken / Giant Octopus)
 */
export function createKrakenMesh(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'kraken';

  // 1. Massive Kraken Mantle / Head
  const headGeom = new THREE.SphereGeometry(2.8, 16, 14);
  headGeom.scale(1.1, 1.4, 1.1);
  const krakenMat = new THREE.MeshStandardMaterial({
    color: 0x6c2f7e, // Deep predatory violet
    roughness: 0.35,
    metalness: 0.15
  });
  const head = new THREE.Mesh(headGeom, krakenMat);
  head.position.set(0, 2.5, 0);
  head.castShadow = true;
  root.add(head);

  // 2. Head Ridges & Spines
  const spineGeom = new THREE.ConeGeometry(0.35, 1.4, 6);
  const spineMat = new THREE.MeshStandardMaterial({ color: 0x9b59b6, roughness: 0.4 });
  for (let i = 0; i < 5; i++) {
    const spine = new THREE.Mesh(spineGeom, spineMat);
    const ang = -0.6 + i * 0.3;
    spine.position.set(0, 4.6 + Math.cos(ang) * 0.8, Math.sin(ang) * 1.8);
    spine.rotation.x = -ang - 0.4;
    root.add(spine);
  }

  // 3. Glowing Predatory Eyes
  const eyeTex = createEyeTexture();
  const eyeMat = new THREE.MeshStandardMaterial({
    map: eyeTex,
    emissive: 0xffaa00,
    emissiveIntensity: 0.6,
    roughness: 0.1
  });
  const eyeGeom = new THREE.SphereGeometry(0.7, 12, 10);

  const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
  leftEye.position.set(-1.6, 2.8, -1.8);
  leftEye.rotation.y = -0.5;
  root.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
  rightEye.position.set(1.6, 2.8, -1.8);
  rightEye.rotation.y = 0.5;
  root.add(rightEye);

  // 4. Multiple articulated tentacles emerging around
  const tentacleGroup = new THREE.Group();
  tentacleGroup.name = 'tentacles';

  const tentacleCount = 6;
  const suctionMat = new THREE.MeshStandardMaterial({ color: 0xff7675, roughness: 0.6 });

  for (let i = 0; i < tentacleCount; i++) {
    const tGroup = new THREE.Group();
    const angle = (i / tentacleCount) * Math.PI * 2;
    const rad = 3.6 + (i % 2) * 1.0;

    // Segmented curved arm
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0.5, 2.5, 0.5),
      new THREE.Vector3(0.8, 5.0, -1.0),
      new THREE.Vector3(0.2, 6.5, -2.5)
    ]);

    const tubeGeom = new THREE.TubeGeometry(curve, 16, 0.65, 8, false);
    const tentacleMesh = new THREE.Mesh(tubeGeom, krakenMat);
    tentacleMesh.castShadow = true;
    tGroup.add(tentacleMesh);

    // Suction cups along inside of tentacle
    for (let s = 1; s <= 4; s++) {
      const cupGeom = new THREE.CylinderGeometry(0.25, 0.28, 0.15, 8);
      const cup = new THREE.Mesh(cupGeom, suctionMat);
      cup.position.set(0.6, s * 1.3, -s * 0.5);
      cup.rotation.x = Math.PI / 4;
      tGroup.add(cup);
    }

    tGroup.position.set(Math.cos(angle) * rad, 0, Math.sin(angle) * rad);
    tGroup.rotation.y = angle;
    tentacleGroup.add(tGroup);
  }

  root.add(tentacleGroup);

  // 5. Churning Vortex Water Splash Ring
  const vortexGeom = new THREE.TorusGeometry(4.8, 0.8, 8, 24);
  vortexGeom.rotateX(Math.PI / 2);
  const vortexMat = new THREE.MeshStandardMaterial({
    color: 0x81ecec,
    transparent: true,
    opacity: 0.75,
    roughness: 0.2
  });
  const vortex = new THREE.Mesh(vortexGeom, vortexMat);
  vortex.position.y = 0.1;
  root.add(vortex);

  return root;
}

/**
 * Creates the Snow Monster (Abominable Yeti)
 */
export function createYetiMonsterMesh(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'yeti_monster';

  // 1. Massive Muscular Fur Torso
  const torsoGeom = new THREE.SphereGeometry(3.2, 16, 12);
  torsoGeom.scale(1.2, 1.3, 1.0);
  const yetiMat = new THREE.MeshStandardMaterial({
    color: 0xecf0f1,
    roughness: 0.95
  });
  const torso = new THREE.Mesh(torsoGeom, yetiMat);
  torso.position.set(0, 3.8, 0);
  torso.castShadow = true;
  root.add(torso);

  // Chest muscle ridge / bluish frost
  const chestGeom = new THREE.SphereGeometry(2.0, 12, 10);
  chestGeom.scale(1.1, 0.9, 0.6);
  const chestMat = new THREE.MeshStandardMaterial({ color: 0xa5b1c2, roughness: 0.85 });
  const chest = new THREE.Mesh(chestGeom, chestMat);
  chest.position.set(0, 3.8, -1.8);
  root.add(chest);

  // 2. Fierce Yeti Head
  const headGeom = new THREE.SphereGeometry(2.0, 14, 12);
  const head = new THREE.Mesh(headGeom, yetiMat);
  head.position.set(0, 6.4, -0.6);
  head.castShadow = true;
  root.add(head);

  // Blue Icy Horns
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x45aaf2, roughness: 0.3, metalness: 0.2 });
  const hornGeom = new THREE.ConeGeometry(0.6, 2.8, 8);
  
  const leftHorn = new THREE.Mesh(hornGeom, hornMat);
  leftHorn.position.set(-1.8, 7.8, -0.5);
  leftHorn.rotation.set(0.3, 0, 0.85);
  root.add(leftHorn);

  const rightHorn = new THREE.Mesh(hornGeom, hornMat);
  rightHorn.position.set(1.8, 7.8, -0.5);
  rightHorn.rotation.set(0.3, 0, -0.85);
  root.add(rightHorn);

  // Glowing Icy Eyes
  const eyeGeom = new THREE.SphereGeometry(0.45, 10, 8);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x00d2d3,
    emissive: 0x00d2d3,
    emissiveIntensity: 0.9,
    roughness: 0.1
  });
  const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
  leftEye.position.set(-0.85, 6.6, -2.1);
  root.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
  rightEye.position.set(0.85, 6.6, -2.1);
  root.add(rightEye);

  // Roaring mouth & fangs
  const mouthGeom = new THREE.BoxGeometry(1.6, 0.7, 0.8);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 });
  const mouth = new THREE.Mesh(mouthGeom, mouthMat);
  mouth.position.set(0, 5.5, -2.1);
  root.add(mouth);

  const fangGeom = new THREE.ConeGeometry(0.2, 0.5, 4);
  fangGeom.rotateX(Math.PI);
  const fangMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const leftFang = new THREE.Mesh(fangGeom, fangMat);
  leftFang.position.set(-0.45, 5.7, -2.35);
  root.add(leftFang);

  const rightFang = new THREE.Mesh(fangGeom, fangMat);
  rightFang.position.set(0.45, 5.7, -2.35);
  root.add(rightFang);

  // 3. Huge Arms Ready to Slam
  const armGroup = new THREE.Group();
  armGroup.name = 'yeti_arms';

  const armGeom = new THREE.CylinderGeometry(0.8, 0.7, 4.2, 8);
  const leftArm = new THREE.Mesh(armGeom, yetiMat);
  leftArm.position.set(-3.4, 4.5, -0.5);
  leftArm.rotation.set(-0.6, 0, 0.5);
  armGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeom, yetiMat);
  rightArm.position.set(3.4, 4.5, -0.5);
  rightArm.rotation.set(0.6, 0, -0.5);
  armGroup.add(rightArm);

  root.add(armGroup);

  // 4. Stomping Snow Blast Shockwave
  const shockGeom = new THREE.RingGeometry(2.5, 4.5, 16);
  shockGeom.rotateX(-Math.PI / 2);
  const shockMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
  const shock = new THREE.Mesh(shockGeom, shockMat);
  shock.position.y = 0.05;
  root.add(shock);

  return root;
}

/**
 * Creates modular obstacles (Rock, Buoy, Island, Pine Tree, etc.)
 */
export function createObstacleMesh(type: ObstacleType): THREE.Group {
  const group = new THREE.Group();

  switch (type) {
    case 'ROCK': {
      // 3-part rock cluster
      const rockGeom1 = new THREE.DodecahedronGeometry(1.4, 1);
      const rock1 = new THREE.Mesh(rockGeom1, sharedMaterials.rock);
      rock1.position.set(0, 0.8, 0);
      rock1.scale.set(1.2, 0.8, 1.0);
      rock1.castShadow = true;
      group.add(rock1);

      const rockGeom2 = new THREE.DodecahedronGeometry(0.8, 1);
      const rock2 = new THREE.Mesh(rockGeom2, sharedMaterials.rock);
      rock2.position.set(1.1, 0.5, 0.4);
      group.add(rock2);
      break;
    }
    case 'CORAL': {
      const coralBase = new THREE.CylinderGeometry(0.4, 0.7, 1.2, 7);
      const m1 = new THREE.Mesh(coralBase, sharedMaterials.coral);
      m1.position.y = 0.6;
      group.add(m1);

      const branchGeom = new THREE.ConeGeometry(0.3, 1.1, 5);
      const b1 = new THREE.Mesh(branchGeom, sharedMaterials.coral);
      b1.position.set(0.3, 1.4, 0.2);
      b1.rotation.set(0.3, 0, 0.4);
      group.add(b1);

      const b2 = new THREE.Mesh(branchGeom, sharedMaterials.coral);
      b2.position.set(-0.3, 1.3, -0.2);
      b2.rotation.set(-0.2, 0, -0.5);
      group.add(b2);
      break;
    }
    case 'BUOY': {
      // Cylindrical striped navigation buoy
      const base = new THREE.CylinderGeometry(0.7, 0.85, 1.1, 12);
      const mBase = new THREE.Mesh(base, sharedMaterials.buoyRed);
      mBase.position.y = 0.55;
      group.add(mBase);

      const mid = new THREE.CylinderGeometry(0.65, 0.7, 0.7, 12);
      const mMid = new THREE.Mesh(mid, sharedMaterials.buoyWhite);
      mMid.position.y = 1.45;
      group.add(mMid);

      const lantern = new THREE.SphereGeometry(0.3, 8, 8);
      const mLantern = new THREE.Mesh(lantern, sharedMaterials.buoyLantern);
      mLantern.position.y = 2.05;
      group.add(mLantern);
      break;
    }
    case 'ISLAND': {
      // Sand dune
      const sandGeom = new THREE.CylinderGeometry(2.4, 3.2, 0.7, 16);
      const sand = new THREE.Mesh(sandGeom, sharedMaterials.sand);
      sand.position.y = 0.35;
      group.add(sand);

      // Curved Palm Trunk
      const trunkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(0.3, 2.0, 0.1),
        new THREE.Vector3(0.8, 3.8, 0.3)
      ]);
      const trunkGeom = new THREE.TubeGeometry(trunkCurve, 8, 0.26, 8, false);
      const trunk = new THREE.Mesh(trunkGeom, sharedMaterials.palmTrunk);
      group.add(trunk);

      // Palm Fronds
      for (let i = 0; i < 5; i++) {
        const leafGeom = new THREE.BoxGeometry(0.35, 0.05, 2.2);
        const leaf = new THREE.Mesh(leafGeom, sharedMaterials.palmLeaf);
        const ang = (i / 5) * Math.PI * 2;
        leaf.position.set(0.8, 3.8, 0.3);
        leaf.rotation.set(0.4, ang, 0.3);
        group.add(leaf);
      }
      break;
    }
    case 'WHIRLPOOL': {
      for (let r = 0; r < 3; r++) {
        const ringGeom = new THREE.RingGeometry(1.2 + r * 0.9, 1.4 + r * 0.9, 16);
        ringGeom.rotateX(-Math.PI / 2);
        const ring = new THREE.Mesh(ringGeom, sharedMaterials.whirlpoolRing);
        ring.position.y = 0.04 + r * 0.01;
        group.add(ring);
      }
      break;
    }
    case 'PINE_TREE': {
      // Brown trunk
      const trunkGeom = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
      const trunk = new THREE.Mesh(trunkGeom, sharedMaterials.pineTrunk);
      trunk.position.y = 0.6;
      group.add(trunk);

      // 3 Tiers of snow-dusted green cones
      for (let t = 0; t < 3; t++) {
        const coneGeom = new THREE.ConeGeometry(1.8 - t * 0.4, 1.4, 8);
        const cone = new THREE.Mesh(coneGeom, sharedMaterials.pineNeedles);
        cone.position.y = 1.6 + t * 0.9;
        cone.castShadow = true;
        group.add(cone);

        // Snow rim
        const snowGeom = new THREE.ConeGeometry(1.85 - t * 0.4, 0.4, 8);
        const snow = new THREE.Mesh(snowGeom, sharedMaterials.snowCap);
        snow.position.y = 1.35 + t * 0.9;
        group.add(snow);
      }
      break;
    }
    case 'SNOW_ROCK': {
      const rockGeom = new THREE.DodecahedronGeometry(1.3, 1);
      const rock = new THREE.Mesh(rockGeom, sharedMaterials.iceRock);
      rock.position.y = 0.9;
      rock.scale.set(1.2, 0.9, 1.1);
      group.add(rock);

      const capGeom = new THREE.SphereGeometry(1.0, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.4);
      const cap = new THREE.Mesh(capGeom, sharedMaterials.snowCap);
      cap.position.y = 1.5;
      group.add(cap);
      break;
    }
    case 'SLALOM_FLAG': {
      const poleGeom = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6);
      const p1 = new THREE.Mesh(poleGeom, sharedMaterials.slalomRed);
      p1.position.set(-1.2, 1.2, 0);
      group.add(p1);

      const p2 = new THREE.Mesh(poleGeom, sharedMaterials.slalomBlue);
      p2.position.set(1.2, 1.2, 0);
      group.add(p2);

      const flagGeom = new THREE.BoxGeometry(0.6, 0.4, 0.05);
      const flag1 = new THREE.Mesh(flagGeom, sharedMaterials.slalomRed);
      flag1.position.set(-0.85, 2.0, 0);
      group.add(flag1);

      const flag2 = new THREE.Mesh(flagGeom, sharedMaterials.slalomBlue);
      flag2.position.set(0.85, 2.0, 0);
      group.add(flag2);
      break;
    }
    case 'ICE_CHASM': {
      const chasmGeom = new THREE.BoxGeometry(4.0, 0.3, 1.5);
      const chasmMat = new THREE.MeshBasicMaterial({ color: 0x0f2027 });
      const chasm = new THREE.Mesh(chasmGeom, chasmMat);
      chasm.position.y = 0.02;
      group.add(chasm);
      break;
    }
  }

  return group;
}

/**
 * Creates Jump Ramps (Kickers)
 */
export function createRampMesh(type: RampType, isSnow: boolean): THREE.Group {
  const group = new THREE.Group();
  const width = type === 'MEGA_RAMP' ? 4.5 : 3.0;
  const length = type === 'MEGA_RAMP' ? 5.0 : 3.6;
  const height = type === 'MEGA_RAMP' ? 1.6 : 1.1;

  // Wedge ramp shape
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, height);
  shape.lineTo(length, 0);
  shape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: width,
    bevelEnabled: false
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  geom.rotateY(Math.PI / 2); // align along Z

  const chevronTex = createRampChevronTexture(isSnow);
  const rampMat = new THREE.MeshStandardMaterial({
    map: chevronTex,
    roughness: 0.4
  });

  const ramp = new THREE.Mesh(geom, rampMat);
  ramp.position.y = height / 2;
  ramp.castShadow = true;
  group.add(ramp);

  // Wooden / Metal Support rails on side
  const railGeom = new THREE.BoxGeometry(0.15, height, length);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.6 });

  const leftRail = new THREE.Mesh(railGeom, railMat);
  leftRail.position.set(-width / 2, height / 2, 0);
  group.add(leftRail);

  const rightRail = new THREE.Mesh(railGeom, railMat);
  rightRail.position.set(width / 2, height / 2, 0);
  group.add(rightRail);

  return group;
}

/**
 * Creates Collectible items (Stars, Boost Canisters, Extra Hearts)
 */
export function createItemMesh(type: ItemType): THREE.Group {
  const group = new THREE.Group();

  if (type === 'STAR') {
    // 5-pointed star
    const starShape = new THREE.Shape();
    const points = 5;
    const outerR = 0.65;
    const innerR = 0.3;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const starGeom = new THREE.ExtrudeGeometry(starShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04 });
    starGeom.center();
    const star = new THREE.Mesh(starGeom, sharedMaterials.goldStar);
    group.add(star);

  } else if (type === 'BOOST') {
    // Lightning bolt / Energy cell
    const cellGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.9, 8);
    const cell = new THREE.Mesh(cellGeom, sharedMaterials.boostCyan);
    group.add(cell);

    const ringGeom = new THREE.TorusGeometry(0.42, 0.08, 6, 12);
    const ring = new THREE.Mesh(ringGeom, sharedMaterials.goldStar);
    group.add(ring);

  } else if (type === 'HEART') {
    // 3D Heart shape
    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
    heartShape.moveTo(x + 0.25, y + 0.25);
    heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 1.0);
    heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const heartGeom = new THREE.ExtrudeGeometry(heartShape, { depth: 0.25, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05 });
    heartGeom.center();
    heartGeom.rotateZ(Math.PI);
    heartGeom.scale(0.8, 0.8, 0.8);
    const heart = new THREE.Mesh(heartGeom, sharedMaterials.heartRed);
    group.add(heart);
  }

  return group;
}
