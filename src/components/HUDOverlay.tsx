/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameMetrics } from '../types/game';
import { Heart, Zap, Gauge, Award, Pause } from 'lucide-react';

interface HUDOverlayProps {
  metrics: GameMetrics;
  onPause: () => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({ metrics, onPause }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Left Status Cluster */}
      <div className="flex items-start gap-4">
        <div className="pointer-events-auto bg-slate-900/80 border border-slate-700/60 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-2 min-w-[220px]">
          {/* Score & Distance */}
          <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">分數 SCORE</span>
              <span className="text-2xl font-extrabold text-amber-400 tabular-nums font-['Chakra_Petch',sans-serif]">
                {metrics.score.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">距離 DIST</span>
              <span className="text-lg font-bold text-cyan-300 tabular-nums">
                {metrics.distance.toLocaleString()} <span className="text-xs text-slate-400">m</span>
              </span>
            </div>
          </div>

          {/* Lives (Hearts) & Speed */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-1">
              {[...Array(metrics.maxLives)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-transform duration-200 ${
                    i < metrics.lives 
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                      : 'text-slate-600/40'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold tabular-nums">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>{metrics.speed} km/h</span>
            </div>
          </div>

          {/* Nitro Boost Meter */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase mb-1">
              <span className="flex items-center gap-1 text-cyan-400">
                <Zap className="w-3 h-3 fill-cyan-400" /> 衝刺能量 BOOST
              </span>
              <span className="text-cyan-300 tabular-nums">{metrics.boostMeter}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden p-0.5 border border-cyan-900/40">
              <div 
                className={`h-full rounded-full transition-all duration-75 ${
                  metrics.isBoosting 
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-400'
                }`}
                style={{ width: `${metrics.boostMeter}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pause Button */}
        <button
          onClick={onPause}
          className="pointer-events-auto bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 p-2.5 rounded-xl transition shadow-lg backdrop-blur-md active:scale-95"
          title="暫停遊戲 (Esc / P)"
        >
          <Pause className="w-5 h-5" />
        </button>
      </div>

      {/* Center Event Notifications (Air tricks, monster escape) */}
      <div className="flex flex-col items-center gap-2 mb-20 pointer-events-none">
        {metrics.isInAir && (
          <div className="bg-amber-500/90 text-slate-950 font-black px-4 py-1.5 rounded-full shadow-lg border border-amber-300 text-sm tracking-wider uppercase animate-bounce flex items-center gap-1.5">
            <Award className="w-4 h-4" /> 360° 空中特技 JUMP TRICK! (+350)
          </div>
        )}
        {metrics.isBoosting && (
          <div className="bg-cyan-500/90 text-slate-950 font-black px-3.5 py-1 rounded-full shadow-lg border border-cyan-200 text-xs tracking-wider uppercase animate-pulse flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-current" /> NITRO 極速衝刺 BOOSTING!
          </div>
        )}
      </div>
    </div>
  );
};
