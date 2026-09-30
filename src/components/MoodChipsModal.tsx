import React, { useState } from 'react';
import { CHIP_OPTIONS, ChipOption } from '../utils/geminiRecommend';
import { X, Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';

interface MoodChipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedChips: string[]) => void;
  isLoading: boolean;
}

export const MoodChipsModal: React.FC<MoodChipsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleChip = (chip: ChipOption) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const handleStart = () => {
    onSubmit(selectedChips);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-stone-50 dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>¿Cómo llegas a este minuto?</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Selecciona lo que sientes ahora (sin escribir nada):
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            disabled={isLoading}
            className="min-h-[44px] min-w-[44px] p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chips Container - strictly buttons/chips, NO text inputs */}
        <div className="p-5 flex-1">
          <div className="flex flex-wrap gap-2.5">
            {CHIP_OPTIONS.map((chip) => {
              const isSelected = selectedChips.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleChip(chip)}
                  disabled={isLoading}
                  className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-2 border select-none ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm scale-[1.02]'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-500/50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] ${
                    isSelected
                      ? 'bg-white text-emerald-800 border-white'
                      : 'border-stone-300 dark:border-stone-600'
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                  <span>{chip}</span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-4 leading-relaxed">
            Elegiremos la pausa que mejor te acompañe en este instante del turno.
          </p>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70">
          <button
            type="button"
            onClick={handleStart}
            disabled={isLoading}
            className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 disabled:opacity-70 text-white font-semibold text-base shadow-md active:scale-99 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Buscando tu pausa...</span>
              </>
            ) : (
              <>
                <span>
                  {selectedChips.length > 0
                    ? `Iniciar pausa recomendada (${selectedChips.length})`
                    : 'Iniciar una pausa recomendada'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
