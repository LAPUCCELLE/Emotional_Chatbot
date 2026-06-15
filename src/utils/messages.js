export const MESSAGES = {
  home: [
    'Hola, me alegra que estes aqui.',
    'Este es tu espacio personal para pausar y cuidarte un poco.',
  ],
  breathingIntro: [
    'Vamos a hacer un ejercicio de respiracion juntos.',
    'No hay apuro. Avanza a tu propio ritmo.',
  ],
  breathingEnd: [
    'Lo hiciste muy bien.',
    'Como te sientes ahora?',
  ],
  journalingIntro: [
    'Vamos a tomarnos un momento para poner en palabras lo que sientes.',
    'No hay respuestas correctas o incorrectas aqui.',
  ],
  journalingEnd: [
    'Gracias por compartir eso. Lo que sientes es completamente valido.',
  ],
}

export const JOURNALING_QUESTIONS = [
  'Que es lo que mas esta ocupando tu mente en este momento?',
  'Como esta afectando eso tu dia a dia?',
  'Que crees que necesitarias para sentirte un poco mejor esta semana?',
]

export const BREATHING_STEPS = [
  { text: 'Cierra los ojos y apoya una mano sobre tu pecho.', phase: 'still' },
  { text: 'Inhala lentamente por la nariz... 1, 2, 3, 4', phase: 'inhale' },
  { text: 'Manten el aire... 1, 2, 3, 4', phase: 'hold' },
  { text: 'Exhala despacio por la boca... 1, 2, 3, 4', phase: 'exhale' },
  { text: 'Descansa... 1, 2, 3, 4', phase: 'rest' },
  { text: 'Volvemos a empezar. Inhala lentamente.', phase: 'inhale' },
  { text: 'Manten...', phase: 'hold' },
  { text: 'Exhala poco a poco...', phase: 'exhale' },
  { text: 'Bien. Descansa en silencio un momento.', phase: 'rest' },
]

export const CRISIS_RESOURCES = [
  {
    name: 'Linea 113 — MINSA Peru',
    detail: 'Atencion gratuita 24/7. Marca 113 desde cualquier telefono.',
    icon: 'tel',
  },
  {
    name: 'Linea de Apoyo Emocional MINSA',
    detail: 'Llama al 0800-10-200, gratuito y disponible todos los dias.',
    icon: 'tel',
  },
  {
    name: 'Bienestar Universitario',
    detail: 'Acercate al servicio de psicologia o bienestar de tu universidad.',
    icon: 'uni',
  },
]
