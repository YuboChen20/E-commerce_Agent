import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import Ilustracion from './Ilustracion.jsx'
import { enlaceOferta, euros, ilustracion } from './util.js'

const quitarTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function Catalogo({ busqueda }) {
  const [productos, setProductos] = useState(null)
  const [error, setError] = useState(null)
  const [categoria, setCategoria] = useState('Todas')

  useEffect(() => {
    api.productos().then(setProductos).catch((e) => setError(e.message))
  }, [])

  const categorias = useMemo(
    () => ['Todas', ...new Set((productos ?? []).map((p) => p.categoria))],
    [productos],
  )

  const visibles = useMemo(() => {
    const q = quitarTildes(busqueda.trim())
    return (productos ?? []).filter(
      (p) =>
        (categoria === 'Todas' || p.categoria === categoria) &&
        (!q || quitarTildes(`${p.nombre} ${p.marca ?? ''} ${p.categoria}`).includes(q)),
    )
  }, [productos, categoria, busqueda])

  if (error) return <Aviso titulo="No se pudo cargar el catálogo" texto={`${error}. Comprueba que la API está arrancada en el puerto 8000.`} />
  if (!productos) return <p className="cargando">Cargando catálogo…</p>

  return (
    <div className="catalogo">
      <section className="portada">
        <h1>El mismo producto, varios vendedores. Te decimos cuál conviene.</h1>
        <p>
          En cada producto, nuestro asistente compara precio, plazo de entrega, gastos de envío y
          opiniones de clientes, y te explica qué oferta elegir.
        </p>
      </section>

      <nav className="filtros" aria-label="Categorías">
        {categorias.map((c) => (
          <button
            key={c}
            className={`filtro ${c === categoria ? 'filtro--activo' : ''}`}
            onClick={() => setCategoria(c)}
            aria-pressed={c === categoria}
          >
            {c}
          </button>
        ))}
      </nav>

      {visibles.length === 0 ? (
        <Aviso titulo="Ningún producto coincide" texto="Prueba con otra palabra o elige «Todas» en las categorías." />
      ) : (
        <ul className="rejilla">
          {visibles.map((p) => {
            const destacada = p.oferta_destacada
            const href = destacada ? enlaceOferta(p.producto_id, destacada.oferta_id) : `#/producto/${p.producto_id}`
            return (
              <li key={p.producto_id}>
                <a href={href} className="tarjeta">
                  <Ilustracion producto={p} fondo={ilustracion(p.categoria).tono} className="tarjeta__imagen" />
                  <span className="tarjeta__marca">{p.marca ?? p.categoria}</span>
                  <span className="tarjeta__nombre">{p.nombre}</span>
                  {destacada && (
                    <span className="tarjeta__pie">
                      <span className="etiqueta-precio">{euros(destacada.coste_total)}</span>
                      <span className="tarjeta__vendedores">
                        {destacada.vendedor}
                        {p.num_ofertas > 1 && ` y ${p.num_ofertas - 1} vendedores más`}
                      </span>
                    </span>
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function Aviso({ titulo, texto }) {
  return (
    <div className="aviso" role="status">
      <strong>{titulo}</strong>
      <p>{texto}</p>
    </div>
  )
}
