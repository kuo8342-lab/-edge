/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CameraViewMode, GameTheme } from '../types/game';
import { 
  Camera, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  VolumeX, 
  Waves, 
  Snowflake, 
  Flame, 
  ArrowLeft, 
  ArrowRight
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface ControlDockProps {
  currentCamera: CameraViewMode;
  onCameraChange: (mode: CameraViewMode) => void;
  currentTheme: GameTheme;
  onThemeChange: (theme: GameTheme) => void;
  onSteerTouch: (dir: number) => void;
  onBoostTouch: (boosting: boolean) => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  currentCamera,
  onCameraChange,
  currentTheme,
  onThemeChange,
  onSteerTouch,
  onBoostTouch
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyH') {
        setIsCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const cameraOptions: { id: CameraViewMode; label: string; icon: string }[] = [
    { id: 'CHASE', label: '第三人稱', icon: '🏄' },
    { id: 'RETRO_TOP', label: '經典復古俯瞰', icon: '🎮' },
    { id: 'FIRST_PERSON', label: '第一人稱極限', icon: '👀' },
    { id: 'CINEMATIC', label: '電影跟隨', icon: '🎬' },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto select-none font-['Plus_Jakarta_Sans',sans-serif] w-full max-w-[920px] px-3">
      {/* Collapse / Expand Tab - High Contrast Dark Backing */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-1.5 px-4 py-1 rounded-full bg-slate-950/95 hover:bg-slate-900 text-slate-100 border-2 border-slate-700/80 text-xs font-bold flex items-center gap-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition active:scale-95"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-4 h-4 text-cyan-400" />
            <span>展開控制台 [H]</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 text-cyan-400" />
            <span>收起控制台 [H]</span>
          </>
        )}
      </button>

      {/* Main Bottom Glass Dock - Deep Solid Dark Background */}
      <div 
        className={`w-full bg-slate-950/95 border-2 border-slate-700/80 rounded-2xl p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-300 flex flex-wrap items-center justify-between gap-2.5 ${
          isCollapsed ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Camera Views Selector Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-black text-slate-200 px-2 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">視角 [V]:</span>
          </span>
          {cameraOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => onCameraChange(opt.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                currentCamera === opt.id
                  ? 'bg-cyan-400 text-slate-950 shadow-md font-black border border-cyan-300'
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{opt.icon}</span>
              <span className="hidden md:inline">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Theme Toggle (Ocean / Snow) */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => onThemeChange('OCEAN')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              currentTheme === 'OCEAN'
                ? 'bg-blue-600 text-white shadow-md border border-cyan-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Waves className="w-4 h-4 text-cyan-300" />
            <span>海洋 (海怪)</span>
          </button>
          <button
            onClick={() => onThemeChange('SNOW')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              currentTheme === 'SNOW'
                ? 'bg-indigo-600 text-white shadow-md border border-indigo-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Snowflake className="w-4 h-4 text-blue-200" />
            <span>雪山 (雪怪)</span>
          </button>
        </div>

        {/* Audio and Controls Helper */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 transition active:scale-95"
            title="音效開關 [M]"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* On-Screen Mobile Touch Steering Bar */}
      <div className="w-full flex items-center justify-between gap-4 mt-2 px-2 pointer-events-auto sm:hidden">
        <div className="flex gap-2">
          <button
            onPointerDown={() => onSteerTouch(-1)}
            onPointerUp={() => onSteerTouch(0)}
            className="w-14 h-14 rounded-2xl bg-slate-950/95 active:bg-cyan-600 border-2 border-cyan-400/80 text-white flex items-center justify-center text-xl shadow-[0_8px_20px_rgba(0,0,0,0.6)] active:scale-90 select-none"
          >
            <ArrowLeft className="w-7 h-7 text-cyan-300" />
          </button>
          <button
            onPointerDown={() => onSteerTouch(1)}
            onPointerUp={() => onSteerTouch(0)}
            className="w-14 h-14 rounded-2xl bg-slate-950/95 active:bg-cyan-600 border-2 border-cyan-400/80 text-white flex items-center justify-center text-xl shadow-[0_8px_20px_rgba(0,0,0,0.6)] active:scale-90 select-none"
          >
            <ArrowRight className="w-7 h-7 text-cyan-300" />
          </button>
        </div>

        <button
          onPointerDown={() => onBoostTouch(true)}
          onPointerUp={() => onBoostTouch(false)}
          className="px-6 h-14 rounded-2xl bg-amber-400 active:bg-amber-500 text-slate-950 font-black flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.6)] border-2 border-slate-950 active:scale-90 select-none"
        >
          <Flame className="w-6 h-6 fill-slate-950" />
          <span>衝刺 BOOST</span>
        </button>
      </div>
    </div>
  );
};
