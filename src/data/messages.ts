export const COMPLETION_MESSAGES: string[] = [
  'Gracias por cuidarte. Tu equipo y tus pacientes también lo notan.',
  'Un minuto tuyo también es trabajo bien hecho.',
  'Pausar no es perder tiempo, es renovar tu energía para seguir cuidando vidas.',
  'En medio del ajetreo del HUV, este minuto fue tu territorio sagrado de descanso.',
  'Tus manos sostienen mucho todos los días. Mereces este respiro.',
  'La vocación no tiene que doler. Cuidarte a ti mismo es el primer acto médico.',
  'El turno sigue, pero tú ya no eres el mismo de hace sesenta segundos.',
  'Buen trabajo por regalarte este momento. Respira hondo y sigue con calma.',
  'Quien cuida de todos también necesita que alguien cuide de él. Hoy fuiste tú.',
  'Un cuerpo descansado toma mejores decisiones y brinda una atención más humana.',
  'No se puede dar de una taza vacía. Hoy recargaste un sorbo valioso de energía.',
  'Cada segundo de calma suma. Gracias por tu entrega incansable en este hospital.',
  'Tu bienestar importa tanto como el de la persona que está en la camilla.',
  'Regresas al servicio con la mente despejada y el corazón más sereno.',
  'Tu turno vale oro, y tu salud vale toda tu vida. Gracias por estar aquí.',
  'Una respiración profunda a tiempo cambia el tono de todo tu turno.',
];

export function getRandomCompletionMessage(): string {
  const index = Math.floor(Math.random() * COMPLETION_MESSAGES.length);
  return COMPLETION_MESSAGES[index];
}
