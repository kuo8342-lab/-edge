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

      // 1. Radar Circular Background (Deep solid dark)
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#060c14';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = monster?.state === 'HUNTING' ? '#ff3838' : '#00d2d3';
      ctx.stroke();

      // 2. Range Rings (20m, 40m, 60m)
      ctx.strokeStyle = 'rgba(0, 210, 211, 0.35)';
      ctx.lineWidth = 1.2;
      [0.35, 0.65, 0.95].forEach(ratio => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * ratio, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Crosshairs
      ctx.strokeStyle = 'rgba(0, 210, 211, 0.4)';
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
      sweepGrad.addColorStop(1, monster?.state === 'HUNTING' ? 'rgba(255, 71, 87, 0.4)' : 'rgba(0, 210, 211, 0.35)');

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

      // 4. Draw Obstacles (Crisp dots)
      ctx.fillStyle = '#ffffff';
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
          ctx.moveTo(rx, ry - 3.5);
          ctx.lineTo(rx - 3.5, ry + 2.5);
          ctx.lineTo(rx + 3.5, ry + 2.5);
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
          ctx.fillStyle = item.type === 'HEART' ? '#ff3838' : item.type === 'BOOST' ? '#00d2d3' : '#f1c40f';
          ctx.beginPath();
          ctx.arc(rx, ry, 4, 0, Math.PI * 2);
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
          ctx.strokeStyle = isHunting ? `rgba(255, 56, 56, ${0.6 + pulse * 0.4})` : 'rgba(255, 165, 2, 0.9)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(mx, my, 9 + pulse * 6, 0, Math.PI * 2);
          ctx.stroke();

          // Monster Core
          ctx.fillStyle = isHunting ? '#ff3838' : '#e67e22';
          ctx.beginPath();
          ctx.arc(mx, my, 7, 0, Math.PI * 2);
          ctx.fill();

          // Monster Icon
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(monster.activeType === 'KRAKEN' ? '🐙' : '👹', mx, my);
        } else {
          // Edge indicator
          const angle = Math.atan2(my - cy, mx - cx);
          const edgeX = cx + Math.cos(angle) * (radius - 9);
          const edgeY = cy + Math.sin(angle) * (radius - 9);

          ctx.fillStyle = isHunting ? '#ff3838' : '#ffa502';
          ctx.beginPath();
          ctx.arc(edgeX, edgeY, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(monster.activeType === 'KRAKEN' ? '🐙' : '👹', edgeX, edgeY);
        }
      }

      // 8. Player Center Marker (Cyan Arrow pointing UP)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(playerPos.rotationY);
      ctx.fillStyle = '#00d2d3';
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(5, 5);
      ctx.lineTo(0, 3);
      ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
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
  const monsterName = monster?.activeType === 'KRAKEN' ? '海怪 (克拉肯)' : '雪怪 (狂暴雪人)';

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col items-end pointer-events-auto select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Radar Canvas Card - High Contrast Deep Solid Black & Border */}
      <div className={`p-3 rounded-2xl border-2 transition-colors duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.7)] backdrop-blur-md ${
        isHunting 
          ? 'bg-rose-950/95 border-rose-500 shadow-rose-900/50 animate-pulse'
          : isWarning
          ? 'bg-amber-950/95 border-amber-500 shadow-amber-900/40'
          : 'bg-slate-950/95 border-slate-700/80 shadow-slate-950/50'
      }`}>
        <div className="flex items-center justify-between w-full mb-1.5 px-1 text-[11px] font-black uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Compass className="w-4 h-4 animate-spin text-cyan-400" style={{ animationDuration: '8s' }} />
            <span>3D 雷達探測儀</span>
          </div>
          <span className="text-[10px] text-slate-200 font-extrabold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 tabular-nums">
            範圍 60m
          </span>
        </div>

        {/* 2D Canvas Viewport */}
        <div className="relative rounded-xl overflow-hidden bg-black border-2 border-slate-800">
          <canvas
            ref={canvasRef}
            style={{ width: 180, height: 180 }}
            className="block"
          />

          {/* Compass labels with high contrast backings */}
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-black text-cyan-300 bg-slate-950/80 px-1.5 py-0.2 rounded border border-cyan-800/60">
            前進 (N)
          </span>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-300 bg-slate-950/80 px-1.5 py-0.2 rounded border border-slate-800">
            後方 (S)
          </span>
        </div>

        {/* Monster Status Bar */}
        <div className="mt-2.5 w-full pt-2 border-t border-slate-800 text-[11px]">
          {isHunting ? (
            <div className="flex items-center justify-between text-rose-300 font-black animate-bounce bg-rose-900/40 px-2 py-1 rounded-lg border border-rose-500/60">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 fill-rose-500/30" />
                <span>{monsterName} 突襲中！</span>
              </span>
              <span className="tabular-nums bg-rose-500 text-white font-black px-2 py-0.5 rounded text-xs shadow-md">
                {monsterDist}m
              </span>
            </div>
          ) : isWarning ? (
            <div className="flex items-center justify-between text-amber-300 font-bold bg-amber-900/40 px-2 py-1 rounded-lg border border-amber-500/50">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>聲納鎖定：{monster?.activeType === 'KRAKEN' ? '海怪逼近' : '雪怪現身'}</span>
              </span>
              <span className="tabular-nums text-amber-200 font-black text-xs bg-amber-950 px-1.5 py-0.5 rounded border border-amber-700/60">
                {monster?.warningCountdown ? monster.warningCountdown.toFixed(1) : '3.0'}s
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-slate-200 font-bold px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
                <span>雷達巡航中 (巨怪沉睡)</span>
              </span>
              <span className="text-emerald-300 font-mono text-xs bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                安全
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
