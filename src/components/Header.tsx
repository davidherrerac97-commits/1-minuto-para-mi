import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Info, Headphones } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenInfo: () => void;
  showInfoButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  isDark,
  onToggleDark,
  onOpenInfo,
  showInfoButton = true,
}) => {
  return (
    <header
      role="banner"
      className="w-full max-w-xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between transition-colors border-b border-stone-200/60 dark:border-stone-800/60 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-sm"
    >
      {/* Brand & Hospital context */}
      <div className="flex items-center gap-2">
        <div
          aria-hidden="true"
          className="w-8 h-8 rounded-full bg-emerald-700/15 dark:bg-emerald-400/20 text-emerald-900 dark:text-emerald-200 flex items-center justify-center font-bold text-sm select-none border border-emerald-600/30"
        >
          1'
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
            1 Minuto Para Mí
          </span>
          <span className="text-[11px] text-stone-700 dark:text-stone-300 font-medium">
            HUV · Cuidar al que cuida
          </span>
        </div>
      </div>

      {/* Action Controls with High Contrast and Accessible Touch Targets */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* "Solo escuchar" (Voice Narration with Web Speech API) */}
        <button
          type="button"
          onClick={onToggleVoice}
          aria-pressed={voiceEnabled}
          aria-label={
            voiceEnabled
              ? 'Solo escuchar activado: las instrucciones se leen en voz alta. Toca para desactivar.'
              : 'Solo escuchar desactivado. Toca para activar lectura en voz alta.'
          }
          title={voiceEnabled ? 'Solo escuchar (activo)' : 'Solo escuchar (inactivo)'}
          className={`min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            voiceEnabled
              ? 'bg-emerald-800 text-white dark:bg-emerald-700 dark:text-emerald-50 shadow-xs'
              : 'bg-stone-200/90 text-stone-800 dark:bg-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700'
          }`}
        >
          <Headphones className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline text-[11px]">Voz</span>
        </button>

        {/* Chime Sound toggle (silent by default for hospital compliance) */}
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundEnabled}
          aria-label={
            soundEnabled
              ? 'Campanada suave activada. Toca para silenciar.'
              : 'Silencio hospitalario activo. Toca para activar campanada suave.'
          }
          title={soundEnabled ? 'Campanada activada' : 'Silencio hospitalario'}
          className={`min-h-[44px] min-w-[44px] p-2.5 rounded-full flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            soundEnabled
              ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-400/80 dark:border-emerald-700'
              : 'bg-stone-200/90 text-stone-800 dark:bg-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-800 dark:text-emerald-300 shrink-0" />
          ) : (
            <VolumeX className="w-4 h-4 shrink-0" />
          )}
        </button>

        {/* Dark/Night mode toggle (for night shifts in dimly lit rooms) */}
        <button
          type="button"
          onClick={onToggleDark}
          aria-label={isDark ? 'Cambiar a modo día' : 'Cambiar a modo turno de noche'}
          title={isDark ? 'Modo día' : 'Modo turno de noche'}
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-stone-200/90 text-stone-800 dark:bg-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
        </button>

        {/* Info / catalog button */}
        {showInfoButton && (
          <button
            type="button"
            onClick={onOpenInfo}
            aria-label="Ver las 24 pausas disponibles para el turno"
            title="Catálogo de pausas activas"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-stone-200/90 text-stone-800 dark:bg-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
