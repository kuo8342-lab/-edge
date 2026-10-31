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
      {/* Top Left Status Cluster - High Contrast Dark Backplate for Snow & Ocean */}
      <div className="flex items-start gap-3">
        <div className="pointer-events-auto bg-slate-950/95 border-2 border-slate-700/80 rounded-2xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.7)] backdrop-blur-md flex flex-col gap-2.5 min-w-[230px]">
          {/* Score & Distance */}
          <div className="flex items-baseline justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-[11px] uppercase font-black text-slate-300 tracking-wider block drop-shadow-sm">
                分數 SCORE
              </span>
              <span className="text-2xl font-black text-amber-300 tabular-nums font-['Chakra_Petch',sans-serif] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {metrics.score.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase font-black text-slate-300 tracking-wider block drop-shadow-sm">
                距離 DIST
              </span>
              <span className="text-lg font-black text-cyan-300 tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {metrics.distance.toLocaleString()} <span className="text-xs text-slate-300 font-bold">m</span>
              </span>
            </div>
          </div>

          {/* Lives (Hearts) & Speed */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800">
              {[...Array(metrics.maxLives)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-transform duration-200 ${
                    i < metrics.lives 
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-105' 
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-slate-100 text-xs font-bold tabular-nums bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>{metrics.speed} km/h</span>
            </div>
          </div>

          {/* Nitro Boost Meter */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase mb-1 text-slate-200">
              <span className="flex items-center gap-1 text-cyan-300">
                <Zap className="w-3.5 h-3.5 fill-cyan-400" /> 衝刺能量 BOOST
              </span>
              <span className="text-cyan-300 font-bold tabular-nums">{metrics.boostMeter}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-cyan-800/60 shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-75 ${
                  metrics.isBoosting 
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.9)]' 
                    : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                }`}
                style={{ width: `${metrics.boostMeter}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pause Button */}
        <button
          onClick={onPause}
          className="pointer-events-auto bg-slate-950/95 hover:bg-slate-900 border-2 border-slate-700/80 text-white p-3 rounded-2xl transition shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md active:scale-95"
          title="暫停遊戲 (Esc / P)"
        >
          <Pause className="w-5 h-5 fill-current text-cyan-400" />
        </button>
      </div>

      {/* Center Event Notifications (Air tricks, monster escape) with solid high-contrast borders */}
      <div className="flex flex-col items-center gap-2 mb-20 pointer-events-none">
        {metrics.isInAir && (
          <div className="bg-amber-400 text-slate-950 font-black px-5 py-2 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.7)] border-2 border-slate-950 text-sm tracking-wider uppercase animate-bounce flex items-center gap-2">
            <Award className="w-4 h-4 fill-slate-950" /> 360° 空中特技 JUMP TRICK! (+350)
          </div>
        )}
        {metrics.isBoosting && (
          <div className="bg-cyan-400 text-slate-950 font-black px-4 py-1.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.7)] border-2 border-slate-950 text-xs tracking-wider uppercase animate-pulse flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-slate-950" /> NITRO 極速衝刺 BOOSTING!
          </div>
        )}
      </div>
    </div>
  );
};
