// Llamadas a la API. En local Vite reenvía /api al puerto 8000; en Vercel es el mismo dominio.
// Si la API está en otro dominio, definid VITE_API_URL (p. ej. https://mi-api.vercel.app).
const BASE = import.meta.env?.VITE_API_URL ?? ''

async function pedir(ruta) {
  const resp = await fetch(`${BASE}${ruta}`)
  if (!resp.ok) {
    const detalle = await resp.json().catch(() => ({}))
    throw new Error(detalle.detail || `La API respondió ${resp.status}`)
  }
  return resp.json()
}

export const api = {
  productos: () => pedir('/api/productos'),
  producto: (id) => pedir(`/api/productos/${encodeURIComponent(id)}`),
  recomendacion: (id, regenerar = false) =>
    pedir(`/api/productos/${encodeURIComponent(id)}/recomendacion${regenerar ? '?regenerar=true' : ''}`),
}
