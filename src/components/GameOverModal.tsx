/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Award, Zap, Compass, Home } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  distance: number;
  highScore: number;
  isNewRecord: boolean;
  monstersEscaped: number;
  airTricksCount: number;
  onRestart: () => void;
  onReturnTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  distance,
  highScore,
  isNewRecord,
  monstersEscaped,
  airTricksCount,
  onRestart,
  onReturnTitle
}) => {
  useEffect(() => {
    if (isNewRecord) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // confetti fallback
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewRecord, onRestart]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm select-none font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="mb-4">
          <span className="text-4xl block mb-1">💥</span>
          <h2 className="text-2xl md:text-3xl font-black italic tracking-wide text-white uppercase font-['Chakra_Petch',sans-serif]">
            衝浪結束 GAME OVER
          </h2>
          <p className="text-xs text-slate-400 mt-1">浪花滔滔，下一次一定能徹底甩開海怪！</p>
        </div>

        {/* Score & Record Display */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-5 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">本次得分 TOTAL SCORE</span>
          <div className="text-4xl font-extrabold text-amber-400 tabular-nums font-['Chakra_Petch',sans-serif]">
            {score.toLocaleString()}
          </div>

          {isNewRecord ? (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/40">
              <Trophy className="w-3.5 h-3.5" /> 刷新個人最佳歷史紀錄！
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-400">
              歷史最佳：<span className="text-slate-200 font-semibold">{highScore.toLocaleString()}</span> 分
            </div>
          )}
        </div>

        {/* Run Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-left">
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block font-semibold">衝浪距離</span>
            <span className="text-base font-bold text-cyan-300 tabular-nums">{distance}m</span>
          </div>
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block font-semibold">甩開巨怪</span>
            <span className="text-base font-bold text-rose-400 tabular-nums">{monstersEscaped} 次</span>
          </div>
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block font-semibold">空中特技</span>
            <span className="text-base font-bold text-amber-300 tabular-nums">{airTricksCount} 回</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-lg hover:shadow-cyan-400/30 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>再次挑戰 PLAY AGAIN</span>
            <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded text-slate-900 ml-1">SPACE</span>
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-700/50"
          >
            <Home className="w-4 h-4" />
            <span>返回主選單 (更換角色/主題)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
