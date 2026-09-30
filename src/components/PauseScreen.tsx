import React, { useEffect, useState, useRef, useMemo } from 'react';
import { PauseItem } from '../types';
import { CATEGORIES } from '../data/pauses';
import { playPhaseChime, triggerHaptic } from '../utils/audio';
import { speakInstruction, stopSpeech } from '../utils/speech';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Headphones, ArrowUp, ArrowDown, Pause as PauseIcon, Activity } from 'lucide-react';

interface PauseScreenProps {
  pause: PauseItem;
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onExit: () => void;
  onComplete: () => void;
  invitationPhrase?: string;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({
  pause,
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  onExit,
  onComplete,
  invitationPhrase,
}) => {
  const [elapsed, setElapsed] = useState<number>(0); // 0 to 60 seconds
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const category = CATEGORIES[pause.categoria] || CATEGORIES.respirar;

  const previousPhaseIndexRef = useRef<number>(-1);
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const voiceEnabledRef = useRef<boolean>(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;

  const onCompleteRef = useRef<() => void>(onComplete);
  onCompleteRef.current = onComplete;

  // Calculate cumulative phase timing
  const phaseSchedule = useMemo(() => {
    let acc = 0;
    return pause.fases.map((f, idx) => {
      const start = acc;
      const end = acc + f.segundos;
      acc = end;
      return { ...f, index: idx, start, end };
    });
  }, [pause]);

  // Determine current active phase
  const currentPhaseInfo = useMemo(() => {
    const active = phaseSchedule.find((p) => elapsed >= p.start && elapsed < p.end);
    if (active) return active;
    return phaseSchedule[phaseSchedule.length - 1];
  }, [phaseSchedule, elapsed]);

  const currentPhaseIndex = currentPhaseInfo.index;
  const phaseProgress = currentPhaseInfo.segundos > 0
    ? Math.min(1, Math.max(0, (elapsed - currentPhaseInfo.start) / currentPhaseInfo.segundos))
    : 1;

  // Handle phase transition triggers: sound, haptics, and voice narration ("Solo escuchar")
  useEffect(() => {
    if (previousPhaseIndexRef.current !== currentPhaseIndex) {
      if (previousPhaseIndexRef.current !== -1) {
        if (soundEnabledRef.current) {
          playPhaseChime('phase');
        }
        triggerHaptic(30);
      }

      // Voice Narration with Web Speech API
      if (voiceEnabledRef.current && isPlaying) {
        speakInstruction(currentPhaseInfo.texto);
      }

      previousPhaseIndexRef.current = currentPhaseIndex;
    }
  }, [currentPhaseIndex, currentPhaseInfo.texto, isPlaying]);

  // Stop speech when paused or exiting
  useEffect(() => {
    if (!isPlaying) {
      stopSpeech();
    }
    return () => {
      stopSpeech();
    };
  }, [isPlaying]);

  // Main 60-second timer loop (100ms precision)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = Math.round((prev + 0.1) * 10) / 10;
        if (next >= 60) {
          clearInterval(interval);
          if (soundEnabledRef.current) {
            playPhaseChime('finish');
          }
          triggerHaptic(70);
          setTimeout(() => {
            onCompleteRef.current();
          }, 350);
          return 60;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Restart function
  const handleRestart = () => {
    stopSpeech();
    setElapsed(0);
    setIsPlaying(true);
    previousPhaseIndexRef.current = -1;
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (!next) {
        stopSpeech();
      } else if (voiceEnabledRef.current) {
        speakInstruction(currentPhaseInfo.texto);
      }
      return next;
    });
  };

  // Remaining time in seconds
  const remainingSeconds = Math.max(0, Math.ceil(60 - elapsed));

  // Progress ring: Radius = 118, Circumference ≈ 741.4
  const radius = 118;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (elapsed / 60) * circumference;

  // Visual cues accessible WITHOUT COLOR:
  // Distinct shapes, scale, direction icons, and border patterns
  let circleScale = 0.85;
  let actionLabel = 'RESPIRA';
  let actionIcon = <Activity className="w-4 h-4" aria-hidden="true" />;
  let strokeDashArray = 'none';

  switch (currentPhaseInfo.animacion) {
    case 'inhalar':
      // Expands from 0.68 to 1.0
      circleScale = 0.68 + 0.32 * phaseProgress;
      actionLabel = 'INHALA';
      actionIcon = <ArrowUp className="w-4 h-4 text-emerald-800 dark:text-emerald-300" aria-hidden="true" />;
      break;
    case 'sostener':
      // Stillness hold with slight calming ripple
      circleScale = 1.0 - 0.02 * Math.sin(phaseProgress * Math.PI * 2);
      actionLabel = 'SOSTÉN';
      actionIcon = <PauseIcon className="w-4 h-4 text-stone-800 dark:text-stone-200" aria-hidden="true" />;
      break;
    case 'exhalar':
      // Contracts from 1.0 to 0.68
      circleScale = 1.0 - 0.32 * phaseProgress;
      actionLabel = 'EXHALA';
      actionIcon = <ArrowDown className="w-4 h-4 text-emerald-800 dark:text-emerald-300" aria-hidden="true" />;
      break;
    case 'mover':
      // Gentle rhythmic wave
      circleScale = 0.82 + 0.12 * Math.sin(elapsed * 2.5);
      actionLabel = 'MUEVE';
      actionIcon = <Activity className="w-4 h-4 text-stone-800 dark:text-stone-200" aria-hidden="true" />;
      strokeDashArray = '6 6';
      break;
  }

  return (
    <div
      role="region"
      aria-label="Sesión de pausa activa de 60 segundos"
      className="w-full max-w-sm sm:max-w-xl mx-auto px-3 sm:px-4 py-3 min-h-[92vh] flex flex-col justify-between select-none"
    >
      {/* Top Bar: Salir (instant), Category, Solo escuchar, Sound */}
      <div className="flex items-center justify-between w-full pt-1">
        {/* Instant Exit button */}
        <button
          type="button"
          onClick={() => {
            stopSpeech();
            onExit();
          }}
          aria-label="Salir de la pausa y volver a inicio"
          className="min-h-[44px] px-3 py-2 rounded-full bg-stone-200/90 text-stone-800 dark:bg-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors flex items-center gap-1.5 text-xs font-bold focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          <span>Salir</span>
        </button>

        {/* Category Label */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-300/80 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200">
          <span role="img" aria-label={category.nombre}>{category.emoji}</span>
          <span>{category.nombre}</span>
        </div>

        {/* Action Controls: Voice + Sound */}
        <div className="flex items-center gap-1">
          {/* "Solo escuchar" (Voice Narration) toggle */}
          <button
            type="button"
            onClick={onToggleVoice}
            aria-pressed={voiceEnabled}
            aria-label={
              voiceEnabled
                ? 'Solo escuchar activado: voz en español activa. Toca para desactivar.'
                : 'Solo escuchar desactivado. Toca para activar lectura en voz alta.'
            }
            title={voiceEnabled ? 'Voz activada' : 'Voz desactivada'}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-full flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              voiceEnabled
                ? 'bg-emerald-800 text-white dark:bg-emerald-700 dark:text-emerald-50 shadow-xs'
                : 'bg-stone-200/90 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
            }`}
          >
            <Headphones className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Campanada suave activada. Toca para silenciar.' : 'Silencio activado.'}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-full flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              soundEnabled
                ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-400'
                : 'bg-stone-200/90 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-800 dark:text-emerald-300" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Title & Posture reminder */}
      <div className="text-center mt-2 px-2">
        <h1 className="text-base sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 leading-snug break-words">
          {pause.titulo}
        </h1>
        <p className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 mt-0.5">
          {pause.postura} · {pause.fases.length} fases
        </p>
        {invitationPhrase && (
          <div className="mt-1.5 max-w-xs sm:max-w-sm mx-auto px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-[11px] text-emerald-900 dark:text-emerald-200 font-semibold italic animate-fadeIn">
            "{invitationPhrase}"
          </div>
        )}
      </div>

      {/* Main Guided Animation Area with 60s Progress Ring */}
      <div className="my-auto py-3 sm:py-4 flex flex-col items-center justify-center w-full">
        <div
          role="progressbar"
          aria-valuenow={remainingSeconds}
          aria-valuemin={0}
          aria-valuemax={60}
          aria-label={`Temporizador de 60 segundos: ${remainingSeconds} segundos restantes`}
          className="relative w-60 h-60 sm:w-72 sm:h-72 flex items-center justify-center"
        >
          {/* SVG Progress Ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox="0 0 280 280"
            aria-hidden="true"
          >
            {/* Background track circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              className="stroke-stone-300 dark:stroke-stone-800"
              strokeWidth="7"
              fill="none"
            />
            {/* Active countdown progress ring */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke={category.ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={strokeDashArray === 'none' ? circumference : strokeDashArray}
              fill="none"
              style={{
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 0.1s linear',
              }}
            />
          </svg>

          {/* Animated Guiding Center Circle - Understandable without color */}
          <div
            className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br ${category.circleGradient} border-2 border-stone-400/50 dark:border-stone-600/50 shadow-inner flex flex-col items-center justify-center text-center p-3 backdrop-blur-sm`}
            style={{
              transform: `scale(${circleScale})`,
              transition: isPlaying ? 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            }}
          >
            {/* Phase verb tag with directional icon (color-blind friendly) */}
            <div
              className={`inline-flex items-center gap-1 text-[11px] tracking-wider uppercase font-extrabold px-3 py-0.5 rounded-full ${category.badgeBg} mb-1 border`}
            >
              {actionIcon}
              <span>{actionLabel}</span>
            </div>

            {/* Countdown seconds */}
            <div className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 tabular-nums tracking-tight">
              {remainingSeconds}
              <span className="text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-400 ml-0.5">
                s
              </span>
            </div>

            {/* Phase step indicator */}
            <span className="text-[11px] text-stone-700 dark:text-stone-300 mt-1 font-semibold">
              Fase {currentPhaseIndex + 1} de {pause.fases.length}
            </span>
          </div>
        </div>

        {/* Short Phase Instruction Text - aria-live for accessibility */}
        <div
          role="status"
          aria-live="polite"
          className="mt-5 px-3 text-center max-w-sm min-h-[68px] flex items-center justify-center"
        >
          <p className="text-base sm:text-xl font-semibold text-stone-900 dark:text-stone-100 leading-snug break-words animate-fadeIn text-balance">
            {currentPhaseInfo.texto}
          </p>
        </div>
      </div>

      {/* Control Buttons (Mobile friendly >= 56px touch target, full keyboard support) */}
      <div className="w-full flex items-center justify-center gap-3 pb-3">
        {/* Restart button */}
        <button
          type="button"
          onClick={handleRestart}
          aria-label="Reiniciar este minuto desde el segundo cero"
          title="Reiniciar 60 s"
          className="min-h-[56px] min-w-[56px] p-4 rounded-2xl bg-stone-200/90 text-stone-800 dark:bg-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 active:scale-95 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <RotateCcw className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Big Primary Play/Pause Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={isPlaying ? 'Pausar el minuto' : 'Reanudar el minuto'}
          className="flex-1 max-w-xs min-h-[56px] px-6 py-3 rounded-2xl bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 font-bold text-base shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-emerald-500"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 fill-current" aria-hidden="true" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" aria-hidden="true" />
              <span>Reanudar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
