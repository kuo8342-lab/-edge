/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CharacterConfig, GameTheme } from '../types/game';
import { CHARACTERS } from '../game/characters';
import { Play, Waves, Snowflake, Compass, Zap, ShieldAlert, Award } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  selectedCharacter: CharacterConfig;
  onSelectCharacter: (char: CharacterConfig) => void;
  selectedTheme: GameTheme;
  onSelectTheme: (theme: GameTheme) => void;
  highScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  selectedCharacter,
  onSelectCharacter,
  selectedTheme,
  onSelectTheme,
  highScore
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-10 pointer-events-none select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner / Edge Offline Homage */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-700/60 shadow-lg text-xs font-semibold text-slate-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>edge://surf 3D 重製版 · 離線無網路模式啟動</span>
        </div>

        {highScore > 0 && (
          <div className="flex items-center gap-2 bg-amber-950/80 px-4 py-1.5 rounded-full border border-amber-500/40 text-xs font-bold text-amber-300 shadow-lg backdrop-blur-md">
            <Award className="w-4 h-4 text-amber-400" />
            <span>最高紀錄：{highScore.toLocaleString()} 分</span>
          </div>
        )}
      </div>

      {/* Center Hero Title Lockup (Bespoke SVG Lockup) */}
      <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center pointer-events-auto my-auto">
        {/* Inline SVG Title Lockup */}
        <div className="relative mb-3">
          <svg
            viewBox="0 0 680 140"
            className="w-full max-w-[560px] h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
          >
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d2d3" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ff9f43" />
              </linearGradient>
              <linearGradient id="subGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff4757" />
                <stop offset="100%" stopColor="#ffa502" />
              </linearGradient>
            </defs>

            {/* Edge Surf 3D Text */}
            <text
              x="50%"
              y="72"
              textAnchor="middle"
              className="font-black italic tracking-wider font-['Chakra_Petch',sans-serif]"
              fill="url(#titleGrad)"
              stroke="#0f172a"
              strokeWidth="6"
              paintOrder="stroke"
              fontSize="78"
            >
              EDGE SURF 3D
            </text>

            {/* Subtitle pill */}
            <text
              x="50%"
              y="120"
              textAnchor="middle"
              className="font-extrabold uppercase tracking-widest"
              fill="url(#subGrad)"
              fontSize="20"
            >
              ★ 經典海怪與雪山極限逃生 ★
            </text>
          </svg>
        </div>

        <p className="text-slate-200 text-sm md:text-base max-w-xl mb-6 drop-shadow-md font-medium">
          避開暗礁、滑上跳台狂飆特技！右上角雷達將鎖定
          <span className="text-rose-400 font-bold mx-1">巨型海怪 (克拉肯)</span>
          與
          <span className="text-cyan-300 font-bold mx-1">狂暴雪怪</span>
          的突襲，快加速衝刺！
        </p>

        {/* Character & Theme Selector */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 w-full max-w-2xl bg-slate-900/85 p-4 rounded-3xl border border-slate-700/60 shadow-2xl backdrop-blur-md">
          {/* Character selection */}
          <div className="flex-1 text-left">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              選擇衝浪角色 CHARACTER
            </span>
            <div className="grid grid-cols-2 gap-2">
              {CHARACTERS.map(char => (
                <button
                  key={char.id}
                  onClick={() => onSelectCharacter(char)}
                  className={`p-2 rounded-xl text-left transition border text-xs flex flex-col gap-0.5 ${
                    selectedCharacter.id === char.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="font-bold flex items-center gap-1">
                    {char.type === 'penguin' ? '🐧' : char.type === 'yeti' ? '👹' : '🏄'}
                    {char.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">{char.subtitle}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme selection */}
          <div className="md:w-56 text-left">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              選擇關卡模式 THEME
            </span>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onSelectTheme('OCEAN')}
                className={`p-2.5 rounded-xl text-left transition border text-xs flex items-center justify-between ${
                  selectedTheme === 'OCEAN'
                    ? 'bg-blue-600/30 border-cyan-400 text-cyan-200 shadow-md font-bold'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-cyan-400" />
                  <span>海洋衝浪 (海怪)</span>
                </div>
                <span>🐙</span>
              </button>

              <button
                onClick={() => onSelectTheme('SNOW')}
                className={`p-2.5 rounded-xl text-left transition border text-xs flex items-center justify-between ${
                  selectedTheme === 'SNOW'
                    ? 'bg-indigo-600/30 border-blue-400 text-blue-200 shadow-md font-bold'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Snowflake className="w-4 h-4 text-blue-300" />
                  <span>雪山極限 (雪怪)</span>
                </div>
                <span>❄️</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Start CTA Button */}
        <button
          onClick={onStart}
          className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-400 text-slate-950 font-black text-lg tracking-wider uppercase shadow-[0_0_30px_rgba(0,210,211,0.6)] hover:shadow-[0_0_45px_rgba(0,210,211,0.8)] active:scale-95 transition-all flex items-center gap-3"
        >
          <Play className="w-6 h-6 fill-slate-950 transition-transform group-hover:scale-110" />
          <span>立即開始 START SURFING</span>
          <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded text-slate-900 border border-slate-950/30 ml-2">
            SPACE / ENTER
          </span>
        </button>
      </div>

      {/* Bottom Flat Control Hint Line */}
      <div className="w-full text-center pointer-events-auto">
        <div className="inline-block bg-slate-900/80 px-6 py-2 rounded-full border border-slate-700/60 shadow-lg text-xs font-semibold text-slate-300 backdrop-blur-md">
          WASD / 方向鍵 移動轉向 · 空白鍵 極速衝刺 · V 切換3D視角 · Esc 暫停 · 右上角雷達監測海怪
        </div>
      </div>
    </div>
  );
};
