import React, { useMemo } from 'react';
import { CATEGORIES } from '../data/pauses';
import { CategoryId } from '../types';
import { getCurrentShiftInfo } from '../utils/greeting';
import { Sparkles, Clock, ShieldCheck, Heart, Moon } from 'lucide-react';

interface HomeScreenProps {
  onStartRandom: () => void;
  onSelectCategory: (catId: CategoryId) => void;
  onOpenCatalog: () => void;
  onOpenMood: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartRandom,
  onSelectCategory,
  onOpenCatalog,
  onOpenMood,
}) => {
  const categoryList = Object.values(CATEGORIES);
  const shiftInfo = useMemo(() => getCurrentShiftInfo(), []);

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4 pb-8 pt-2 flex flex-col items-center">
      {/* Time-of-Day Greeting & Hospital Identity */}
      <section aria-label="Saludo y turno" className="text-center my-3 max-w-md w-full">
        {/* Hospital badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 text-xs font-semibold border border-emerald-300 dark:border-emerald-700/60 mb-2">
          <Heart className="w-3.5 h-3.5 fill-current text-emerald-700 dark:text-emerald-400" />
          <span>Hospital Universitario del Valle</span>
        </div>

        {/* Dynamic Shift Greeting */}
        <div className="mt-1 flex items-center justify-center gap-2">
          {shiftInfo.isNightShift && (
            <Moon className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" aria-hidden="true" />
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-tight text-balance">
            {shiftInfo.greeting}
          </h1>
        </div>

        <p className="mt-1 text-sm sm:text-base font-bold text-emerald-800 dark:text-emerald-400">
          1 Minuto Para Mí · Cuidar al que cuida
        </p>

        <p className="mt-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-snug px-2">
          {shiftInfo.subtext}
        </p>
      </section>

      {/* Main Big Circular Button - 1 tap to start! (Mobile first, minimum 56px, high contrast) */}
      <div className="my-4 flex flex-col items-center w-full">
        <div className="relative group">
          {/* Subtle breathing outer ring aura */}
          <div
            aria-hidden="true"
            className="absolute -inset-3 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20 blur-md animate-pulse pointer-events-none"
          />

          <button
            type="button"
            onClick={onStartRandom}
            aria-label="Tomar mi minuto: Iniciar inmediatamente una pausa activa de 60 segundos al azar"
            className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-900/30 flex flex-col items-center justify-center p-4 transition-all duration-200 transform active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 border-4 border-emerald-300/40 cursor-pointer"
          >
            <Clock className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-100 mb-1.5 animate-pulse" aria-hidden="true" />
            <span className="text-xl sm:text-2xl font-extrabold text-center leading-tight tracking-tight">
              Tomar mi
              <br />
              minuto
            </span>
            <span className="text-[11px] text-emerald-100 mt-1 font-semibold tracking-wide">
              60 s al azar · 1 toque
            </span>
          </button>
        </div>

        {/* Secondary Button: "¿Cómo llegas a este minuto?" */}
        <button
          type="button"
          onClick={onOpenMood}
          aria-label="¿Cómo llegas a este minuto?: Elegir una pausa personalizada según cómo te sientes"
          className="mt-4 min-h-[48px] px-5 py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 shadow-xs active:scale-98 transition-all flex items-center gap-2 text-xs sm:text-sm font-semibold focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          <span>¿Cómo llegas a este minuto?</span>
        </button>

        <p className="text-xs text-stone-600 dark:text-stone-400 mt-3 text-center font-medium">
          O elige abajo la categoría que necesita tu cuerpo:
        </p>
      </div>

      {/* 4 Category Cards - 24 Pausas disponibles */}
      <section aria-label="Categorías de pausas activas" className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
        {categoryList.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            aria-label={`Categoría ${cat.nombre}: ${cat.descripcion}. Iniciar una pausa de 60 segundos.`}
            className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] group flex items-start gap-3 min-h-[72px] focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div
              aria-hidden="true"
              className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform border border-stone-200/50 dark:border-stone-700/50"
            >
              <span role="img" aria-label={cat.nombre}>{cat.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h2 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base leading-snug">
                  {cat.nombre}
                </h2>
                <span className="text-[11px] text-stone-600 dark:text-stone-400 font-semibold whitespace-nowrap">
                  60 s
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 line-clamp-1">
                {cat.descripcion}
              </p>
            </div>
          </button>
        ))}
      </section>

      {/* Catalog Button */}
      <div className="mt-3 flex items-center justify-center">
        <button
          type="button"
          onClick={onOpenCatalog}
          aria-label="Ver el catálogo completo de las 24 pausas activas"
          className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 py-2.5 px-3.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Ver las 24 pausas disponibles para el turno</span>
        </button>
      </div>

      {/* Safety & Hospital Principles Footer */}
      <footer
        role="contentinfo"
        className="mt-7 pt-4 border-t border-stone-200 dark:border-stone-800 w-full text-center text-[11px] text-stone-700 dark:text-stone-300 space-y-1.5"
      >
        <p className="font-medium">
          Si sientes dolor o mareo, detente. Esta app no reemplaza la atención en salud.
        </p>
        <p className="flex items-center justify-center gap-1.5 flex-wrap font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 inline" aria-hidden="true" />
          <span>Cero datos personales · Sin registro · 100% offline · PWA instalable</span>
        </p>
      </footer>
    </div>
  );
};
