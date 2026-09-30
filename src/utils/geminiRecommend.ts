import { PAUSES } from '../data/pauses';
import { PauseItem } from '../types';

export const CHIP_OPTIONS = [
  'Cansancio',
  'Tensión en cuello/hombros',
  'Ojos cansados',
  'Mucho tiempo de pie',
  'Mente acelerada',
  'Después de un caso difícil',
  'Turno de noche',
] as const;

export type ChipOption = typeof CHIP_OPTIONS[number];

/**
 * Fallback heuristic to pick an appropriate pause locally if offline or timeout (>3s)
 */
function pickLocalPauseFallback(selectedChips: string[]): { pause: PauseItem; frase: string } {
  const chipsText = selectedChips.join(' ').toLowerCase();

  let targetId: string | null = null;
  let defaultFrase = 'Toma este minuto con calma para ti.';

  if (chipsText.includes('ojos')) {
    targetId = Math.random() > 0.5 ? 'ojo-2020' : 'ojo-palmeo';
    defaultFrase = 'Un descanso visual para tus ojos en medio del turno.';
  } else if (chipsText.includes('cuello') || chipsText.includes('hombros')) {
    targetId = Math.random() > 0.5 ? 'est-cuello' : 'est-hombros';
    defaultFrase = 'Suelta la carga de la nuca y los hombros con suavidad.';
  } else if (chipsText.includes('pie')) {
    targetId = Math.random() > 0.5 ? 'est-espalda' : 'sol-gravedad';
    defaultFrase = 'Alivia la espalda y deja que el suelo sostenga tu peso.';
  } else if (chipsText.includes('caso difícil') || chipsText.includes('mente')) {
    targetId = Math.random() > 0.5 ? 'resp-suspiro' : 'sol-descarga';
    defaultFrase = 'Inhala profundo y suelta la sobrecarga por este minuto.';
  } else if (chipsText.includes('noche')) {
    targetId = Math.random() > 0.5 ? 'ojo-palmeo' : 'resp-caja';
    defaultFrase = 'Un momento sereno para acompañar tu vigilia nocturna.';
  } else if (chipsText.includes('cansancio')) {
    targetId = Math.random() > 0.5 ? 'sol-escaneo' : 'resp-46';
    defaultFrase = 'Regálale a tu cuerpo un respiro reparador.';
  }

  const found = targetId ? PAUSES.find((p) => p.id === targetId) : null;
  const chosenPause = found || PAUSES[Math.floor(Math.random() * PAUSES.length)];

  return {
    pause: chosenPause,
    frase: defaultFrase,
  };
}

/**
 * Recommends a pause using Gemini with strict 3-second timeout and 100% offline fallback.
 * Never throws or displays errors to the user.
 */
export async function getRecommendedPause(
  selectedChips: string[]
): Promise<{ pause: PauseItem; frase: string }> {
  // If no chips selected, immediately fallback locally
  if (!selectedChips || selectedChips.length === 0) {
    return pickLocalPauseFallback([]);
  }

  // 3-second abort controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 3000);

  try {
    const response = await fetch('/api/recommend-pause', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chips: selectedChips }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return pickLocalPauseFallback(selectedChips);
    }

    const data = await response.json();

    if (data.fallback || !data.id) {
      return pickLocalPauseFallback(selectedChips);
    }

    const matchedPause = PAUSES.find((p) => p.id === data.id);
    if (!matchedPause) {
      return pickLocalPauseFallback(selectedChips);
    }

    return {
      pause: matchedPause,
      frase: data.frase || 'Toma este minuto con calma.',
    };
  } catch {
    // If offline, abort timeout fired, or network error: gracefully fallback silently
    clearTimeout(timeoutId);
    return pickLocalPauseFallback(selectedChips);
  }
}
