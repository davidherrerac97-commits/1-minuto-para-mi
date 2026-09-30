export type CategoryId = 'respirar' | 'estirar' | 'soltar' | 'ojos';

export type AnimationType = 'inhalar' | 'sostener' | 'exhalar' | 'mover';

export interface Phase {
  texto: string;
  segundos: number;
  animacion: AnimationType;
  subtexto?: string;
}

export interface PauseItem {
  id: string;
  categoria: CategoryId;
  titulo: string;
  descripcionCorta: string;
  postura: 'de pie o sentado' | 'de pie' | 'sentado';
  fases: Phase[];
}

export interface CategoryMeta {
  id: CategoryId;
  nombre: string;
  emoji: string;
  descripcion: string;
  colorName: string;
  accentClass: string;
  badgeBg: string;
  ringColor: string;
  circleGradient: string;
}

export type ScreenState = 'inicio' | 'pausa' | 'cierre';
