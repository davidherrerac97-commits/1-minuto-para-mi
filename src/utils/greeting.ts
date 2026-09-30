import { PauseItem } from '../types';

export interface ShiftInfo {
  greeting: string;
  isNightShift: boolean;
  subtext: string;
}

export function getCurrentShiftInfo(currentDate: Date = new Date()): ShiftInfo {
  const hour = currentDate.getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Buen turno de mañana',
      isNightShift: false,
      subtext: 'Comienza tu jornada oxigenando el cuerpo',
    };
  }

  if (hour >= 12 && hour < 19) {
    return {
      greeting: 'Buena tarde',
      isNightShift: false,
      subtext: 'Un respiro a mitad de tu turno de trabajo',
    };
  }

  // 19:00 - 04:59
  return {
    greeting: 'Turno de noche: aquí estamos contigo',
    isNightShift: true,
    subtext: 'Pausas suaves de respiración y descanso visual priorizadas',
  };
}

/**
 * Filter or prioritize pauses based on night shift.
 * At night, avoids intense activation stretches and prioritizes
 * calm breathing, eye rest, and passive decompression.
 */
export function selectPauseForShift(allPauses: PauseItem[], isNightShift: boolean): PauseItem {
  if (!isNightShift) {
    // Normal distribution
    return allPauses[Math.floor(Math.random() * allPauses.length)];
  }

  // Night shift: filter out intense physical activation, prioritize respirar, ojos, and gentle soltar
  const nightEligible = allPauses.filter((p) => {
    if (p.categoria === 'respirar' || p.categoria === 'ojos') return true;
    if (p.categoria === 'soltar') return true;
    // For estirar, only allow gentle neck or wrists, not intense whole body
    if (p.id === 'est-cuello' || p.id === 'est-manos') return true;
    return false;
  });

  const pool = nightEligible.length > 0 ? nightEligible : allPauses;
  return pool[Math.floor(Math.random() * pool.length)];
}
