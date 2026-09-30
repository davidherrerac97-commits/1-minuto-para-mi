import React from 'react';
import { PauseItem } from '../types';
import { CATEGORIES } from '../data/pauses';
import { CheckCircle2, RotateCw, ArrowLeft, Heart, Sparkles, Clock } from 'lucide-react';

interface CompletionScreenProps {
  message: string;
  completedPause: PauseItem;
  totalSessionMinutes: number;
  onAnotherMinute: () => void;
  onReturnToShift: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  message,
  completedPause,
  totalSessionMinutes,
  onAnotherMinute,
  onReturnToShift,
}) => {
  const category = CATEGORIES[completedPause.categoria] || CATEGORIES.respirar;

  return (
    <div
      role="region"
      aria-label="Pausa completada con éxito"
      className="w-full max-w-sm sm:max-w-md mx-auto px-4 py-4 sm:py-6 min-h-[85vh] flex flex-col items-center justify-between text-center select-none"
    >
      {/* Top subtle hospital mark */}
      <div className="pt-1 flex items-center justify-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 font-medium">
        <Heart className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 fill-current" aria-hidden="true" />
        <span>HUV · Cuidar al que cuida</span>
      </div>

      {/* Center Heart Card */}
      <div className="my-auto py-3 sm:py-4 flex flex-col items-center max-w-sm w-full">
        {/* Soft glowing checkmark */}
        <div
          aria-hidden="true"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-3 shadow-md shadow-emerald-500/10 border-2 border-emerald-400/50 dark:border-emerald-700/60"
        >
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
          Minuto cumplido
        </h1>

        {/* Completed exercise reminder tag */}
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300">
          <span aria-hidden="true">{category.emoji}</span>
          <span className="font-bold text-stone-900 dark:text-stone-100">
            {completedPause.titulo}
          </span>
        </div>

        {/* Visual Cumulative Counter: 'Minutos totales de cuidado' (Solo sesión actual) */}
        <div className="mt-4 w-full p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-stone-50/90 dark:from-emerald-950/40 dark:via-stone-900 dark:to-stone-900 border border-emerald-200/90 dark:border-emerald-800/60 shadow-xs text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Minutos totales de cuidado</span>
            </div>
            <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
              Esta sesión
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-900 dark:text-emerald-200 tabular-nums">
              {totalSessionMinutes}
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-400">
              {totalSessionMinutes === 1 ? 'minuto acumulado' : 'minutos acumulados'}
            </span>
          </div>

          {/* Visual cumulative dots for current session */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap" aria-hidden="true">
            {Array.from({ length: Math.min(totalSessionMinutes, 12) }).map((_, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-xs animate-fadeIn"
                title={`Minuto ${i + 1}`}
              />
            ))}
            {totalSessionMinutes > 12 && (
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 ml-1">
                +{totalSessionMinutes - 12}
              </span>
            )}
          </div>

          <p className="mt-2 text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
            {totalSessionMinutes === 1
              ? 'Has comenzado a cuidar de ti. Cada pausa renueva tu claridad para continuar.'
              : `Has dedicado ${totalSessionMinutes} minutos a recargar tu energía en este turno. Tu cuerpo y tus pacientes lo agradecen.`}
          </p>
        </div>

        {/* Warm Random Message (from the 16 messages) */}
        <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs w-full">
          <p className="text-sm sm:text-base font-semibold text-stone-800 dark:text-stone-100 italic leading-relaxed">
            "{message}"
          </p>
        </div>
      </div>

      {/* Two Action Buttons (min 56px height, high tap surface, fully accessible) */}
      <div className="w-full flex flex-col gap-3 pb-2 pt-2">
        {/* "Otro minuto" button */}
        <button
          type="button"
          onClick={onAnotherMinute}
          aria-label="Iniciar otro minuto de pausa activa"
          className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-base shadow-md shadow-emerald-950/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-emerald-500"
        >
          <RotateCw className="w-5 h-5" aria-hidden="true" />
          <span>Otro minuto</span>
        </button>

        {/* "Volver al turno" button */}
        <button
          type="button"
          onClick={onReturnToShift}
          aria-label="Volver a la pantalla principal para continuar el turno"
          className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-stone-200 text-stone-900 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700 font-bold text-base active:scale-[0.99] transition-all flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-stone-400"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          <span>Volver al turno</span>
        </button>
      </div>
    </div>
  );
};
