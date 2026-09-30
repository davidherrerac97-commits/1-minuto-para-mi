const VOICE_PREF_KEY = 'minuto_huv_voz';

let cachedVoice: SpeechSynthesisVoice | null = null;

function getBestSpanishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (cachedVoice) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  // Prefer Colombian Spanish, then Latin American, then any Spanish
  const colVoice = voices.find((v) => v.lang.toLowerCase() === 'es-co');
  if (colVoice) {
    cachedVoice = colVoice;
    return colVoice;
  }

  const latamVoice = voices.find(
    (v) =>
      v.lang.toLowerCase() === 'es-419' ||
      v.lang.toLowerCase() === 'es-us' ||
      v.lang.toLowerCase() === 'es-mx'
  );
  if (latamVoice) {
    cachedVoice = latamVoice;
    return latamVoice;
  }

  const anyEsVoice = voices.find((v) => v.lang.toLowerCase().startsWith('es'));
  if (anyEsVoice) {
    cachedVoice = anyEsVoice;
    return anyEsVoice;
  }

  return null;
}

// Ensure voices are loaded if browser loads them asynchronously
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    getBestSpanishVoice();
  };
}

/**
 * Speaks the given instruction calmly and clearly.
 */
export function speakInstruction(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending utterance

    const cleanText = text.replace(/…/g, '...').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-CO';
    utterance.rate = 0.88; // Calm, relaxed hospital guide pacing
    utterance.pitch = 1.0;
    utterance.volume = 0.95;

    const voice = getBestSpanishVoice();
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Fail silently if browser policy blocks speech
  }
}

/**
 * Stops any active speech synthesis
 */
export function stopSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignored
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function getStoredVoicePreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(VOICE_PREF_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setStoredVoicePreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOICE_PREF_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignored
  }
}
