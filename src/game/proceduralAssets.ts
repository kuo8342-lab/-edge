/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Procedural Canvas Textures generator
export function createWaterFoamTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep oceanic blue background
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#0277bd');
  grad.addColorStop(0.5, '#01579b');
  grad.addColorStop(1, '#0288d1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Sea foam caustics & organic ripples
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2.5;

  for (let i = 0; i < 90; i++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const r = 15 + Math.random() * 45;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Wave crest streaks
  ctx.fillStyle = 'rgba(224, 247, 250, 0.35)';
  for (let j = 0; j < 35; j++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = 40 + Math.random() * 120;
    const h = 4 + Math.random() * 10;
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSnowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Pristine alpine snow with subtle icy blue undertone
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#f0f3f8');
  grad.addColorStop(0.5, '#e6ecf5');
  grad.addColorStop(1, '#dce5f2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Sparkly ice crystals & powder drifts
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  for (let i = 0; i < 250; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const s = 1.5 + Math.random() * 3;
    ctx.fillRect(x, y, s, s);
  }

  // Soft ski tracks / snow grooves
  ctx.strokeStyle = 'rgba(180, 205, 230, 0.3)';
  ctx.lineWidth = 4;
  for (let k = 0; k < 12; k++) {
    const startX = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.bezierCurveTo(startX + 20, size * 0.3, startX - 20, size * 0.7, startX + 10, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createRampChevronTexture(isSnow: boolean): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base ramp color
  ctx.fillStyle = isSnow ? '#2980b9' : '#d35400';
  ctx.fillRect(0, 0, size, size);

  // Bright chevrons pointing up
  ctx.strokeStyle = '#f1c40f';
  ctx.lineWidth = 24;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let y = 60; y <= 220; y += 80) {
    ctx.beginPath();
    ctx.moveTo(40, y + 25);
    ctx.lineTo(size / 2, y - 25);
    ctx.lineTo(size - 40, y + 25);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createEyeTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Monster yellow/orange eye iris with dark slit
  ctx.fillStyle = '#ff9f1a';
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(64, 64, 45, 0, Math.PI * 2);
  ctx.fill();

  // Dark predatory pupil
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.ellipse(64, 64, 16, 46, 0, 0, Math.PI * 2);
  ctx.fill();

  // Highlight glint
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(78, 50, 10, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
