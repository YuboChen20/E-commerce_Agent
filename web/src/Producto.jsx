import { useEffect, useRef, useState } from 'react'
import { api } from './api.js'
import { Aviso } from './Catalogo.jsx'
import Compra from './Compra.jsx'
import Ilustracion from './Ilustracion.jsx'
import PanelAgente from './PanelAgente.jsx'
import { CRITERIOS, dias, enlaceOferta, euros, ilustracion, nota } from './util.js'

export default function Producto({ id, ofertaId }) {
  const [ficha, setFicha] = useState(null)
  const [error, setError] = useState(null)
  const [comparando, setComparando] = useState(false)
  const [abierta, setAbierta] = useState(null) // oferta desplegada en la lista
  const [compra, setCompra] = useState(null) // oferta que se está comprando (simulado)
  const comparacion = useRef(null)

  useEffect(() => {
    api.producto(id).then(setFicha).catch((e) => setError(e.message))
  }, [id])

  // Al pulsar el botón, se baja hasta la comparación
  useEffect(() => {
    if (comparando) comparacion.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [comparando])

  if (error) return <Aviso titulo="No se pudo abrir el producto" texto={error} />
  if (!ficha) return <p className="cargando">Cargando producto…</p>
  if (ficha.ofertas.length === 0) return <Aviso titulo={ficha.nombre} texto="Este producto no tiene ofertas ahora mismo." />

  // La oferta que el cliente está viendo: la del enlace o, si no hay, la más barata
  const actual =
    ficha.ofertas.find((o) => o.oferta_id === ofertaId) ??
    ficha.ofertas.reduce((a, b) => (b.coste_total < a.coste_total ? b : a))
  const { tono } = ilustracion(ficha.categoria)
  const mejorId = ficha.ofertas[0].oferta_id // vienen ordenadas por puntuación

  return (
    <article className="producto">
      <a href="#/" className="volver">‹ Volver al catálogo</a>

      {/* 1. La oferta en la que ha entrado el cliente */}
      <section className="ficha" aria-labelledby="titulo-producto">
        <Ilustracion producto={ficha} fondo={tono} className="ficha__imagen" />

        <div className="ficha__datos">
          <p className="ficha__marca">{ficha.marca ? `Marca: ${ficha.marca}` : ficha.categoria}</p>
          <h1 id="titulo-producto">{ficha.nombre}</h1>
          {ficha.descripcion && <p className="ficha__descripcion">{ficha.descripcion}</p>}

          <div className="ficha__compra">
            <p className="ficha__vendedor">
              Vendido por <strong>{actual.vendedor}</strong>
              <span className="tenue"> · {nota(actual)}</span>
            </p>
            <span className="etiqueta-precio etiqueta-precio--grande">{euros(actual.coste_total)}</span>
            <p className="ficha__detalle">
              {actual.envio === 0 ? 'Envío gratis' : `${euros(actual.precio)} + ${euros(actual.envio)} de envío`}
              {' · '}Llega en {dias(actual.dias_entrega)}
            </p>
          </div>

          <div className="ficha__accion">
            <div className="ficha__botones">
            <button className="boton boton--comprar" onClick={() => setCompra(actual)}>
              Comprar por {euros(actual.coste_total)}
            </button>
            <button
              className="boton boton--principal"
              onClick={() => (comparando ? comparacion.current?.scrollIntoView({ behavior: 'smooth' }) : setComparando(true))}
            >
              {comparando ? 'Ver la comparación' : 'Buscar la mejor opción'}
            </button>
            </div>
            <p className="tenue">
              El asistente compara los {ficha.ofertas.length} vendedores que tienen este producto y te
              dice cuál conviene.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Al pulsar el botón: recomendación del agente + todos los vendedores */}
      {comparando && (
        <section ref={comparacion} className="comparacion" aria-label="Comparación de vendedores">
          <PanelAgente id={id} ofertas={ficha.ofertas} actual={actual} onComprar={setCompra} />

          <div className="bloque bloque--ofertas">
            <h2>Este producto en {ficha.ofertas.length} vendedores</h2>
            <Leyenda />
            <ol className="ofertas">
              {ficha.ofertas.map((o, i) => {
                const esActual = o.oferta_id === actual.oferta_id
                const desplegada = abierta === o.oferta_id
                return (
                  <li key={o.oferta_id} className={`oferta ${i === 0 ? 'oferta--mejor' : ''} ${esActual ? 'oferta--actual' : ''} ${desplegada ? 'oferta--abierta' : ''}`}>
                    {/* Toda la tarjeta se puede pulsar; el botón «Ver detalles» sirve también con teclado */}
                    <div className="oferta__cabeza" onClick={() => setAbierta(desplegada ? null : o.oferta_id)}>
                      <div className="oferta__vendedor">
                        <strong>{o.vendedor}</strong>
                        {i === 0 && <span className="sello">Mejor equilibrio</span>}
                        {esActual && <span className="sello sello--actual">La que estás viendo</span>}
                        <span className="oferta__nota">{nota(o)}</span>
                      </div>
                      <dl className="oferta__cifras">
                        <div><dt>Precio</dt><dd>{euros(o.precio)}</dd></div>
                        <div><dt>Envío</dt><dd>{o.envio === 0 ? 'Gratis' : euros(o.envio)}</dd></div>
                        <div><dt>Llega en</dt><dd>{dias(o.dias_entrega)}</dd></div>
                        <div className="oferta__total"><dt>Total</dt><dd>{euros(o.coste_total)}</dd></div>
                      </dl>
                      <BarraPuntos oferta={o} />
                      <button
                        className="oferta__desplegar"
                        onClick={(e) => { e.stopPropagation(); setAbierta(desplegada ? null : o.oferta_id) }}
                        aria-expanded={desplegada}
                        aria-controls={`detalle-${o.oferta_id}`}
                      >
                        {desplegada ? 'Ocultar detalles' : 'Ver detalles'}
                      </button>
                    </div>
                    {desplegada && (
                      <DetalleOferta
                        id={`detalle-${o.oferta_id}`}
                        oferta={o}
                        ofertas={ficha.ofertas}
                        resenas={ficha.resenas.filter((r) => r.vendedor === o.vendedor)}
                        enlace={esActual ? null : enlaceOferta(id, o.oferta_id)}
                        onComprar={() => setCompra(o)}
                      />
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        </section>
      )}

      {ficha.complementarios.length > 0 && (
        <section className="bloque" aria-labelledby="titulo-juntos">
          <h2 id="titulo-juntos">Se suele comprar junto con</h2>
          <ul className="juntos">
            {ficha.complementarios.map((c) => (
              <li key={c.producto_id}>
                <a href={`#/producto/${c.producto_id}`} className="junto">
                  <Ilustracion producto={c} fondo={ilustracion(c.categoria).tono} className="junto__imagen" />
                  <span>{c.nombre}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Resenas resenas={ficha.resenas} />

      <Compra
        producto={ficha}
        oferta={compra}
        esRecomendada={compra?.oferta_id === mejorId}
        onCerrar={() => setCompra(null)}
      />
    </article>
  )
}

// Detalle de una oferta: puntos por criterio, opiniones del vendedor y acciones
function DetalleOferta({ id, oferta, ofertas, resenas, enlace, onComprar }) {
  const d = oferta.desglose ?? {}
  const minimo = (campo) => Math.min(...ofertas.map((x) => x[campo]))
  const datos = {
    precio: `${euros(oferta.precio)}${oferta.precio === minimo('precio') ? ' (el más bajo)' : ''}`,
    entrega: `${dias(oferta.dias_entrega)}${oferta.dias_entrega === minimo('dias_entrega') ? ' (la más rápida)' : ''}`,
    valoracion: oferta.valoracion != null ? nota(oferta) : 'Sin reseñas: cuenta como valoración media',
    envio: oferta.envio === 0 ? 'Gratis' : euros(oferta.envio),
  }
  return (
    <div className="detalle" id={id}>
      <div className="detalle__criterios">
        <h3>Puntuación por criterio</h3>
        <ul>
          {CRITERIOS.map((c) => (
            <li key={c.clave}>
              <span className="detalle__nombre">{c.nombre}</span>
              <span className="detalle__dato">{datos[c.clave]}</span>
              <span className="detalle__puntos">{String(d[c.clave] ?? 0).replace('.', ',')} / {c.peso}</span>
              <span className="detalle__barra">
                <span style={{ width: `${((d[c.clave] ?? 0) / c.peso) * 100}%`, background: c.color }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="detalle__opiniones">
        <h3>Opiniones sobre {oferta.vendedor}</h3>
        {resenas.length === 0 ? (
          <p className="tenue">Nadie ha opinado todavía sobre este vendedor para este producto.</p>
        ) : (
          <ul>
            {resenas.slice(0, 3).map((r, i) => (
              <li key={i}>
                <span className="resena__estrellas" aria-label={`${r.estrellas} de 5 estrellas`}>
                  {'★'.repeat(r.estrellas)}<span className="tenue">{'★'.repeat(5 - r.estrellas)}</span>
                </span>
                <p>{r.texto}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="detalle__acciones">
        <button className="boton boton--comprar" onClick={onComprar}>
          Comprar a {oferta.vendedor} por {euros(oferta.coste_total)}
        </button>
        {enlace && <a className="boton boton--borde" href={enlace}>Ver esta oferta</a>}
      </div>
    </div>
  )
}

const RESENAS_VISIBLES = 5

function Resenas({ resenas }) {
  const [todas, setTodas] = useState(false)
  const media = resenas.length ? resenas.reduce((s, r) => s + r.estrellas, 0) / resenas.length : 0
  const visibles = todas ? resenas : resenas.slice(0, RESENAS_VISIBLES)
  return (
    <section className="bloque" aria-labelledby="titulo-resenas">
      <h2 id="titulo-resenas">Opiniones de clientes</h2>
      {resenas.length === 0 ? (
        <p className="tenue">Este producto todavía no tiene reseñas.</p>
      ) : (
        <>
          <p className="resenas__media">
            <strong>{media.toFixed(1).replace('.', ',')} ★</strong> de media en {resenas.length} reseñas
          </p>
          <ul className="resenas">
            {visibles.map((r, i) => (
              <li key={i} className="resena">
                <span className="resena__estrellas" aria-label={`${r.estrellas} de 5 estrellas`}>
                  {'★'.repeat(r.estrellas)}<span className="tenue">{'★'.repeat(5 - r.estrellas)}</span>
                </span>
                <p>{r.texto}</p>
                <span className="resena__vendedor">Compró a {r.vendedor}</span>
              </li>
            ))}
          </ul>
          {resenas.length > RESENAS_VISIBLES && (
            <button className="boton boton--borde" onClick={() => setTodas(!todas)} aria-expanded={todas}>
              {todas ? 'Ver menos reseñas' : `Ver las ${resenas.length} reseñas`}
            </button>
          )}
        </>
      )}
    </section>
  )
}

export function BarraPuntos({ oferta }) {
  const d = oferta.desglose ?? {}
  return (
    <div className="puntos">
      <div
        className="puntos__barra"
        role="img"
        aria-label={`Puntuación ${oferta.puntuacion} de 100: ${CRITERIOS.map((c) => `${c.nombre} ${d[c.clave] ?? 0}`).join(', ')}`}
      >
        {CRITERIOS.map((c) => (
          <span
            key={c.clave}
            className="puntos__tramo"
            style={{ width: `${d[c.clave] ?? 0}%`, background: c.color }}
            title={`${c.nombre}: ${d[c.clave] ?? 0} de ${c.peso} puntos`}
          />
        ))}
      </div>
      <span className="puntos__total">{Math.round(oferta.puntuacion)}<small>/100</small></span>
    </div>
  )
}

export function Leyenda() {
  return (
    <ul className="leyenda" aria-label="Cómo se calcula la puntuación">
      {CRITERIOS.map((c) => (
        <li key={c.clave}>
          <span className="leyenda__color" style={{ background: c.color }} />
          {c.nombre} <span className="tenue">hasta {c.peso}</span>
        </li>
      ))}
    </ul>
  )
}
