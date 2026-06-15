export const ROUTE_LABELS = {
  respiracion:    'Respiracion',
  escritura:      'Escritura',
  conversacional: 'Conversacion libre',
  libre:          'Sesion libre',
}

export const MOOD_COLORS = {
  1: '#EF4444', 2: '#F97316', 3: '#FB923C',
  4: '#FBBF24', 5: '#EAB308', 6: '#A3E635',
  7: '#4ADE80', 8: '#22C55E', 9: '#16A34A', 10: '#15803D',
}

export function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-PE', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}
