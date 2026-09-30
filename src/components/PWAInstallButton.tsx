import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as standalone app, don't show
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow with beforeinstallprompt
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        aria-label="Instalar app en la pantalla de inicio"
        className="min-h-[44px] px-3 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Instalar app</span>
        <span className="sm:hidden">Instalar</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          aria-label="Instalar en iPhone o iPad"
          className="min-h-[44px] px-3 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Instalar en iPhone</span>
          <span className="sm:hidden">Instalar</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm rounded-t-3xl sm:rounded-2xl bg-white dark:bg-stone-900 p-6 shadow-xl border border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Instalar en tu iPhone</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Cerrar guía"
                  className="min-h-[44px] min-w-[44px] p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <ol className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 space-y-3 pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Toca el botón <Share2 className="w-4 h-4 inline text-blue-600 mx-0.5" /> <strong>Compartir</strong> en la barra inferior de Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Baja un poco y selecciona <strong>"Agregar al inicio"</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Listo: tendrás <em>1 Minuto Para Mí</em> disponible sin conexión en tu pantalla.
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[48px] rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
