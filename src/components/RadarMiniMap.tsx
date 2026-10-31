/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { ActiveItem, ActiveObstacle, ActiveRamp, MonsterData } from '../types/game';
import { AlertTriangle, Compass, ShieldAlert } from 'lucide-react';

interface RadarMiniMapProps {
  playerPos: { x: number; z: number; rotationY: number };
  monster: MonsterData | null;
  obstacles: ActiveObstacle[];
  items: ActiveItem[];
  ramps: ActiveRamp[];
}

export const RadarMiniMap: React.FC<RadarMiniMapProps> = ({
  playerPos,
  monster,
  obstacles,
  items,
  ramps
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarSweepAngle = useRef<number>(0);

  useEffect(() => {
    let animId = 0;

    const renderRadar = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 180;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
        canvas.width = size * dpr;
        canvas.height = size * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const radius = size / 2 - 8;

      // 1. Radar Circular Background
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 20, 30, 0.88)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = monster?.state === 'HUNTING' ? '#ff4757' : '#00d2d3';
      ctx.stroke();

      // 2. Range Rings (20m, 40m, 60m)
      ctx.strokeStyle = 'rgba(0, 210, 211, 0.2)';
      ctx.lineWidth = 1;
      [0.35, 0.65, 0.95].forEach(ratio => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * ratio, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();

      // 3. Rotating Sweep Beam
      radarSweepAngle.current += 0.04;
      const sweepEnd = radarSweepAngle.current;
      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      sweepGrad.addColorStop(0, 'rgba(0, 210, 211, 0)');
      sweepGrad.addColorStop(1, monster?.state === 'HUNTING' ? 'rgba(255, 71, 87, 0.25)' : 'rgba(0, 210, 211, 0.25)');

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, sweepEnd - 0.5, sweepEnd);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // World units to radar scale: Radar radius = 60 units
      const radarRange = 60;
      const toRadarX = (wx: number) => cx + ((wx - playerPos.x) / radarRange) * radius;
      // In world, forward is -Z. On radar screen, UP is forward (-Z)
      const toRadarY = (wz: number) => cy + ((wz - playerPos.z) / radarRange) * radius;

      // 4. Draw Obstacles (Gray / Orange dots)
      ctx.fillStyle = 'rgba(200, 214, 229, 0.5)';
      obstacles.forEach(obs => {
        const rx = toRadarX(obs.x);
        const ry = toRadarY(obs.z);
        const dSq = (rx - cx) * (rx - cx) + (ry - cy) * (ry - cy);
        if (dSq < radius * radius) {
          ctx.beginPath();
          ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 5. Draw Jump Ramps (Golden chevrons)
      ctx.fillStyle = '#f1c40f';
      ramps.forEach(ramp => {
        const rx = toRadarX(ramp.x);
        const ry = toRadarY(ramp.z);
        const dSq = (rx - cx) * (rx - cx) + (ry - cy) * (ry - cy);
        if (dSq < radius * radius) {
          ctx.beginPath();
          ctx.moveTo(rx, ry - 3);
          ctx.lineTo(rx - 3, ry + 2);
          ctx.lineTo(rx + 3, ry + 2);
          ctx.closePath();
          ctx.fill();
        }
      });

      // 6. Draw Collectible Items (Cyan / Red dots)
      items.forEach(item => {
        if (item.collected) return;
        const rx = toRadarX(item.x);
        const ry = toRadarY(item.z);
        const dSq = (rx - cx) * (rx - cx) + (ry - cy) * (ry - cy);
        if (dSq < radius * radius) {
          ctx.fillStyle = item.type === 'HEART' ? '#ff4757' : item.type === 'BOOST' ? '#00d2d3' : '#f1c40f';
          ctx.beginPath();
          ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 7. PROMINENT MONSTER MARKER (KRAKEN 🐙 / YETI ❄️)
      if (monster && monster.state !== 'DORMANT') {
        const mx = toRadarX(monster.x);
        const my = toRadarY(monster.z);
        const distFromCenter = Math.sqrt((mx - cx) * (mx - cx) + (my - cy) * (my - cy));

        const isHunting = monster.state === 'HUNTING';
        const pulse = Math.sin(performance.now() * 0.012) * 0.5 + 0.5;

        if (distFromCenter < radius - 4) {
          // Inside radar circle
          // Pulsing danger rings
          ctx.strokeStyle = isHunting ? `rgba(255, 71, 87, ${0.4 + pulse * 0.6})` : 'rgba(255, 165, 2, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(mx, my, 8 + pulse * 6, 0, Math.PI * 2);
          ctx.stroke();

          // Monster Core
          ctx.fillStyle = isHunting ? '#ff3838' : '#e67e22';
          ctx.beginPath();
          ctx.arc(mx, my, 6, 0, Math.PI * 2);
          ctx.fill();

          // Monster Icon / Text label
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(monster.activeType === 'KRAKEN' ? '🐙' : '👹', mx, my);
        } else {
          // Clamped to outer edge with directional indicator arrow
          const angle = Math.atan2(my - cy, mx - cx);
          const edgeX = cx + Math.cos(angle) * (radius - 8);
          const edgeY = cy + Math.sin(angle) * (radius - 8);

          ctx.fillStyle = isHunting ? '#ff4757' : '#ffa502';
          ctx.beginPath();
          ctx.arc(edgeX, edgeY, 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(monster.activeType === 'KRAKEN' ? '🐙' : '👹', edgeX, edgeY);
        }
      }

      // 8. Player Center Marker (Cyan Arrow pointing UP)
      ctx.save();
      ctx.translate(cx, cy);
      // forward is up
      ctx.rotate(playerPos.rotationY);
      ctx.fillStyle = '#00d2d3';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4, 5);
      ctx.lineTo(0, 3);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      animId = requestAnimationFrame(renderRadar);
    };

    animId = requestAnimationFrame(renderRadar);
    return () => cancelAnimationFrame(animId);
  }, [playerPos, monster, obstacles, items, ramps]);

  const isHunting = monster?.state === 'HUNTING';
  const isWarning = monster?.state === 'WARNING';
  const monsterDist = monster ? Math.round(monster.distanceToPlayer) : 0;
  const monsterName = monster?.activeType === 'KRAKEN' ? '海怪 (巨型克拉肯)' : '雪人 (狂暴雪怪)';

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col items-end pointer-events-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Radar Canvas Card */}
      <div className={`p-2.5 rounded-2xl border backdrop-blur-md transition-colors duration-300 shadow-2xl ${
        isHunting 
          ? 'bg-rose-950/80 border-rose-500/70 shadow-rose-900/40 animate-pulse'
          : isWarning
          ? 'bg-amber-950/80 border-amber-500/60 shadow-amber-900/30'
          : 'bg-slate-900/80 border-cyan-500/30 shadow-cyan-950/30'
      }`}>
        <div className="flex items-center justify-between w-full mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
            <span>3D 雷達探測儀</span>
          </div>
          <span className="text-[10px] text-slate-400 tabular-nums">範圍 60m</span>
        </div>

        {/* 2D Canvas Viewport */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950/70 border border-slate-800">
          <canvas
            ref={canvasRef}
            style={{ width: 180, height: 180 }}
            className="block"
          />

          {/* Compass labels */}
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-cyan-400/70">前進 (N)</span>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">後方 (S)</span>
        </div>

        {/* Monster Status Bar */}
        <div className="mt-2 w-full pt-1.5 border-t border-slate-800/80 text-[11px]">
          {isHunting ? (
            <div className="flex items-center justify-between text-rose-400 font-bold animate-bounce">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{monsterName} 突襲中！</span>
              </span>
              <span className="tabular-nums bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-300 border border-rose-500/40">
                {monsterDist}m
              </span>
            </div>
          ) : isWarning ? (
            <div className="flex items-center justify-between text-amber-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>聲納鎖定：{monster?.activeType === 'KRAKEN' ? '海怪逼近' : '雪怪現身'}</span>
              </span>
              <span className="tabular-nums text-amber-300 text-[10px]">
                {monster?.warningCountdown ? monster.warningCountdown.toFixed(1) : '3.0'}s
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                <span>雷達巡航中 (海怪沉睡)</span>
              </span>
              <span className="text-emerald-400/80 font-mono text-[10px]">安全</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
