let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a soothing, harmonic bell/singing bowl tone with pure Web Audio API.
 * Never startles: soft attack, gentle sine harmonics, smooth exponential decay.
 */
export function playPhaseChime(type: 'phase' | 'finish' = 'phase'): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreq = type === 'finish' ? 587.33 : 440; // D5 for finish, A4 for regular phase
    const secondFreq = type === 'finish' ? 880 : 659.25; // overtone harmonic

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
    const duration = type === 'finish' ? 1.6 : 1.1;
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterGain.connect(ctx.destination);

    // Warm low-pass filter to remove any harsh digital edge
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.connect(masterGain);

    // Primary gentle sine
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.connect(filter);
    osc1.start(now);
    osc1.stop(now + duration);

    // Soft secondary overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(secondFreq, now);
    gain2.gain.setValueAtTime(0.04, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);
    osc2.connect(gain2);
    gain2.connect(filter);
    osc2.start(now);
    osc2.stop(now + duration);
  } catch {
    // Audio context may fail if blocked by policy; fail silently
  }
}

/**
 * Light tactile haptic vibration (supported on mobile Chrome/Android and some iOS Safari PWA versions)
 */
export function triggerHaptic(duration = 35): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignored
    }
  }
}

const SOUND_PREF_KEY = 'minuto_huv_sonido';

export function getStoredSoundPreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = localStorage.getItem(SOUND_PREF_KEY);
    // Explicitly starts FALSE (silence) by default for hospital compliance
    return val === 'true';
  } catch {
    return false;
  }
}

export function setStoredSoundPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_PREF_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignored
  }
}
