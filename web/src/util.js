const formatoEuros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
export const euros = (x) => formatoEuros.format(x)

export const dias = (n) => (n === 1 ? '1 día' : `${n} días`)

// Ilustración por categoría (no hay fotos de producto en el dataset sintético)
export const CATEGORIAS = {
  'Electrónica': { emoji: '🎧', tono: '#E3EEF9' },
  'Accesorios': { emoji: '🔌', tono: '#F1ECF8' },
  'Gaming': { emoji: '🎮', tono: '#E8E6F7' },
  'Informática': { emoji: '💻', tono: '#E6F0EE' },
  'Cocina': { emoji: '🍳', tono: '#FBEFD9' },
  'Hogar': { emoji: '🏠', tono: '#EAF2E3' },
  'Deporte': { emoji: '🏋️', tono: '#FCE7E2' },
  'Mascotas': { emoji: '🐈', tono: '#F6EEE2' },
}
// Icono más concreto según palabras del nombre (el primero que coincida)
const POR_NOMBRE = [
  [/auricular/i, '🎧'], [/altavoz/i, '🔊'], [/cargador|cable|enchufe|hub/i, '🔌'],
  [/m[oó]vil|pantalla/i, '📱'], [/bater[ií]a/i, '🔋'], [/reloj/i, '⌚'], [/rat[oó]n|alfombrilla/i, '🖱️'],
  [/teclado/i, '⌨️'], [/mando/i, '🎮'], [/micr[oó]fono/i, '🎙️'], [/monitor/i, '🖥️'],
  [/webcam/i, '📷'], [/ssd|memoria/i, '💾'], [/l[aá]mpara|bombilla|luz/i, '💡'], [/mochila/i, '🎒'],
  [/funda para port[aá]til/i, '💼'], [/freidora/i, '🍟'], [/caf[eé]|espumador/i, '☕'],
  [/sart[eé]n/i, '🍳'], [/tabla/i, '🔪'], [/batidora/i, '🥤'], [/aspirador/i, '🤖'],
  [/humidificador/i, '💧'], [/yoga/i, '🧘'], [/mancuerna|bandas/i, '🏋️'], [/botella/i, '🧊'],
  [/rodillo/i, '💪'], [/comedero/i, '🥣'], [/gato|rascador/i, '🐈'], [/funda/i, '👝'],
]
export const ilustracion = (categoria, nombre = '') => {
  const base = CATEGORIAS[categoria] ?? { emoji: '📦', tono: '#ECEFEC' }
  const encontrado = POR_NOMBRE.find(([patron]) => patron.test(nombre))
  return encontrado ? { ...base, emoji: encontrado[1] } : base
}

// Criterios de la puntuación (mismos pesos que herramientas.py)
export const CRITERIOS = [
  { clave: 'precio', nombre: 'Precio', peso: 35, color: 'var(--c-precio)' },
  { clave: 'entrega', nombre: 'Rapidez', peso: 25, color: 'var(--c-entrega)' },
  { clave: 'valoracion', nombre: 'Valoración', peso: 25, color: 'var(--c-valoracion)' },
  { clave: 'envio', nombre: 'Envío', peso: 15, color: 'var(--c-envio)' },
]

export const NOMBRE_HERRAMIENTA = {
  obtener_ofertas: 'Comparó las ofertas y sus puntuaciones',
  obtener_resenas: 'Leyó las reseñas de los clientes',
  productos_complementarios: 'Buscó productos que se compran juntos',
}

export const nota = (o) =>
  o.valoracion != null
    ? `${o.valoracion.toFixed(1).replace('.', ',')} ★ (${o.num_resenas} ${o.num_resenas === 1 ? 'reseña' : 'reseñas'})`
    : 'Sin reseñas'

export const enlaceOferta = (productoId, ofertaId) => `#/producto/${productoId}?oferta=${ofertaId}`
