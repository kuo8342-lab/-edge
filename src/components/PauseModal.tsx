/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Play, RotateCcw, Home, Compass, Eye, Zap } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onReturnTitle
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        onResume();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center">
        <h2 className="text-2xl font-black italic tracking-wide text-white uppercase mb-1 font-['Chakra_Petch',sans-serif]">
          遊戲暫停 PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-5">喘口氣，調整節奏再出發！</p>

        {/* Quick Controls Cheat Sheet */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 mb-5 text-left text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Zap className="w-3.5 h-3.5" /> 轉向 / 衝刺
            </span>
            <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">A / D 或 方向鍵 · Space</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Eye className="w-3.5 h-3.5" /> 切換視角
            </span>
            <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">按鍵 V</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-rose-300">
              <Compass className="w-3.5 h-3.5" /> 右上角雷達
            </span>
            <span className="text-[11px] text-slate-400">紅點標記海怪/雪人距離</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>繼續遊戲 RESUME</span>
            <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded text-slate-900 ml-1">ESC</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-700/50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重新開始 RESTART</span>
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full py-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 text-slate-400 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-800"
          >
            <Home className="w-3.5 h-3.5" />
            <span>返回主選單 TITLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
