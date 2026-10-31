/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GameStatus, 
  GameTheme, 
  CameraViewMode, 
  CharacterConfig, 
  GameMetrics,
  ActiveObstacle,
  ActiveItem,
  ActiveRamp,
  MonsterData 
} from './types/game';
import { CHARACTERS } from './game/characters';
import { SurfGameEngine } from './game/threeEngine';
import { RadarMiniMap } from './components/RadarMiniMap';
import { HUDOverlay } from './components/HUDOverlay';
import { ControlDock } from './components/ControlDock';
import { TitleScreen } from './components/TitleScreen';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';

const HIGH_SCORE_KEY = 'edgesurf_3d_highscore';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<SurfGameEngine | null>(null);

  const [gameStatus, setGameStatus] = useState<GameStatus>('TITLE');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterConfig>(CHARACTERS[0]);
  const [selectedTheme, setSelectedTheme] = useState<GameTheme>('OCEAN');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('CHASE');
  
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Live HUD metrics
  const [metrics, setMetrics] = useState<GameMetrics>({
    score: 0,
    distance: 0,
    highScore: 0,
    lives: 3,
    maxLives: 3,
    speed: 0,
    boostMeter: 100,
    isBoosting: false,
    isInAir: false,
    airTricksCount: 0,
    monstersEscaped: 0,
    theme: 'OCEAN',
    character: CHARACTERS[0],
    cameraMode: 'CHASE'
  });

  // Radar Mini-Map live data
  const [radarData, setRadarData] = useState<{
    playerPos: { x: number; z: number; rotationY: number };
    monster: MonsterData | null;
    obstacles: ActiveObstacle[];
    items: ActiveItem[];
    ramps: ActiveRamp[];
  }>({
    playerPos: { x: 0, z: 0, rotationY: 0 },
    monster: null,
    obstacles: [],
    items: [],
    ramps: []
  });

  // Game over state
  const [gameOverData, setGameOverData] = useState<{
    finalScore: number;
    finalDistance: number;
    isNewRecord: boolean;
  }>({
    finalScore: 0,
    finalDistance: 0,
    isNewRecord: false
  });

  // Handle Game Over
  const handleGameOver = useCallback((finalScore: number, distance: number) => {
    setGameStatus('GAMEOVER');
    let isRecord = false;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      isRecord = true;
      try {
        localStorage.setItem(HIGH_SCORE_KEY, finalScore.toString());
      } catch {
        // storage ignored
      }
    }
    setGameOverData({
      finalScore,
      finalDistance: distance,
      isNewRecord: isRecord
    });
  }, [highScore]);

  // Initialize Three.js Engine once on mount
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new SurfGameEngine(
      canvasMountRef.current,
      selectedCharacter,
      {
        onMetricsUpdate: (newMetrics) => {
          setMetrics(prev => ({ ...prev, ...newMetrics, highScore }));
        },
        onRadarUpdate: (playerPos, monster, obstacles, items, ramps) => {
          setRadarData({
            playerPos,
            monster,
            obstacles,
            items,
            ramps
          });
        },
        onGameOver: handleGameOver
      }
    );

    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [handleGameOver, highScore, selectedCharacter]);

  // Handle Start Game
  const handleStartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.applyTheme(selectedTheme);
    engineRef.current.setCharacter(selectedCharacter);
    engineRef.current.resetGame();
    setGameStatus('PLAYING');
  };

  // Handle Pause / Resume
  const handlePause = () => {
    if (gameStatus === 'PLAYING') {
      if (engineRef.current) engineRef.current.setGameStatus('PAUSED');
      setGameStatus('PAUSED');
    }
  };

  const handleResume = () => {
    if (gameStatus === 'PAUSED') {
      if (engineRef.current) engineRef.current.setGameStatus('PLAYING');
      setGameStatus('PLAYING');
    }
  };

  // Handle Theme Change
  const handleThemeChange = (theme: GameTheme) => {
    setSelectedTheme(theme);
    if (engineRef.current) {
      engineRef.current.applyTheme(theme);
    }
  };

  // Handle Character Change
  const handleCharacterChange = (char: CharacterConfig) => {
    setSelectedCharacter(char);
    if (engineRef.current) {
      engineRef.current.setCharacter(char);
    }
  };

  // Handle Camera Mode Change
  const handleCameraChange = (mode: CameraViewMode) => {
    setCameraMode(mode);
    if (engineRef.current) {
      engineRef.current.setCameraMode(mode);
    }
  };

  // Global key for pause
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameStatus === 'PLAYING') handlePause();
        else if (gameStatus === 'PAUSED') handleResume();
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [gameStatus]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div 
        ref={canvasMountRef} 
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Title Screen Overlay */}
      {gameStatus === 'TITLE' && (
        <TitleScreen
          onStart={handleStartGame}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={handleCharacterChange}
          selectedTheme={selectedTheme}
          onSelectTheme={handleThemeChange}
          highScore={highScore}
        />
      )}

      {/* In-Game Active UI (Playing / Paused) */}
      {(gameStatus === 'PLAYING' || gameStatus === 'PAUSED') && (
        <>
          {/* Top Status HUD */}
          <HUDOverlay
            metrics={metrics}
            onPause={handlePause}
          />

          {/* Top-Right Radar Mini-Map (Marks Kraken & Yeti) */}
          <RadarMiniMap
            playerPos={radarData.playerPos}
            monster={radarData.monster}
            obstacles={radarData.obstacles}
            items={radarData.items}
            ramps={radarData.ramps}
          />

          {/* Sleek Bottom Control Dock (Camera / Theme / Touch Steering) */}
          <ControlDock
            currentCamera={cameraMode}
            onCameraChange={handleCameraChange}
            currentTheme={selectedTheme}
            onThemeChange={handleThemeChange}
            onSteerTouch={(dir) => engineRef.current?.setSteering(dir)}
            onBoostTouch={(boosting) => engineRef.current?.setBoosting(boosting)}
          />
        </>
      )}

      {/* Pause Menu Modal */}
      {gameStatus === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleStartGame}
          onReturnTitle={() => {
            if (engineRef.current) engineRef.current.setGameStatus('TITLE');
            setGameStatus('TITLE');
          }}
        />
      )}

      {/* Game Over Modal */}
      {gameStatus === 'GAMEOVER' && (
        <GameOverModal
          score={gameOverData.finalScore}
          distance={gameOverData.finalDistance}
          highScore={highScore}
          isNewRecord={gameOverData.isNewRecord}
          monstersEscaped={metrics.monstersEscaped}
          airTricksCount={metrics.airTricksCount}
          onRestart={handleStartGame}
          onReturnTitle={() => {
            if (engineRef.current) engineRef.current.setGameStatus('TITLE');
            setGameStatus('TITLE');
          }}
        />
      )}
    </div>
  );
}
