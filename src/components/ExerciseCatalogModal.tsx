import React, { useState } from 'react';
import { PAUSES, CATEGORIES } from '../data/pauses';
import { CategoryId, PauseItem } from '../types';
import { X, Play, Sparkles } from 'lucide-react';

interface ExerciseCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPause: (pause: PauseItem) => void;
}

export const ExerciseCatalogModal: React.FC<ExerciseCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectPause,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'todas'>('todas');

  if (!isOpen) return null;

  const filteredPauses = selectedCategory === 'todas'
    ? PAUSES
    : PAUSES.filter((p) => p.categoria === selectedCategory);

  const categories = Object.values(CATEGORIES);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Catálogo de 24 pausas activas"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-xl max-h-[90vh] bg-stone-50 dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
              <span>Catálogo de Pausas (24 disponibles)</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Cada pausa dura exactamente 60 segundos con uniforme hospitalario
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar catálogo"
            className="min-h-[44px] min-w-[44px] p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Category Filter Pills (Functional Buttons) */}
        <div
          role="tablist"
          aria-label="Filtro de categorías"
          className="px-3 sm:px-4 py-2 bg-stone-100 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'todas'}
            onClick={() => setSelectedCategory('todas')}
            className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors min-h-[36px] focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              selectedCategory === 'todas'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            Todas (24)
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors flex items-center gap-1 min-h-[36px] focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <span aria-hidden="true">{cat.emoji}</span>
              <span>{cat.nombre} (6)</span>
            </button>
          ))}
        </div>

        {/* Scrollable list of exercises */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1">
          {filteredPauses.map((pause) => {
            const cat = CATEGORIES[pause.categoria];
            return (
              <div
                key={pause.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 shadow-xs flex items-center justify-between gap-3 group hover:border-emerald-500/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-sm" aria-hidden="true">{cat.emoji}</span>
                    <span className={`text-[11px] font-bold ${cat.accentClass}`}>
                      {cat.nombre}
                    </span>
                    <span className="text-[11px] text-stone-600 dark:text-stone-400 font-semibold">
                      · {pause.postura}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm leading-snug break-words">
                    {pause.titulo}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 line-clamp-2">
                    {pause.descripcionCorta}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectPause(pause);
                    onClose();
                  }}
                  aria-label={`Iniciar pausa ${pause.titulo}`}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 active:scale-95 transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>Empezar</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom helper */}
        <div className="p-3 bg-stone-100 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-800 text-center text-[11px] font-medium text-stone-700 dark:text-stone-300 shrink-0">
          Todas las pausas duran 60 s exactos y se realizan sin requerir el suelo ni cambiarse de uniforme.
        </div>
      </div>
    </div>
  );
};
