import { useCallback, useEffect, useState } from 'react'
import { api } from './api.js'
import { NOMBRE_HERRAMIENTA, dias, enlaceOferta, euros } from './util.js'

export default function PanelAgente({ id, ofertas, actual, onComprar }) {
  const [rec, setRec] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback((regenerar) => {
    setCargando(true)
    setError(null)
    api.recomendacion(id, regenerar)
      .then(setRec)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [id])

  useEffect(() => { cargar(false) }, [cargar])

  return (
    <section className="agente" aria-labelledby="titulo-agente" aria-busy={cargando}>
      <div className="agente__cabeza">
        <h2 id="titulo-agente">Recomendación del asistente</h2>
        {rec && !cargando && <Origen rec={rec} />}
      </div>

      {cargando && <Pensando num={ofertas.length} />}

      {error && !cargando && (
        <div className="agente__error">
          <p>No se pudo obtener la recomendación: {error}</p>
          <button className="boton boton--claro" onClick={() => cargar(false)}>Reintentar</button>
        </div>
      )}

      {rec && !cargando && !error && (
        <div className="agente__contenido">
          {rec.oferta_recomendada && <Elegida oferta={rec.oferta_recomendada} />}
          {rec.oferta_recomendada && actual && (
            <FrenteAActual id={id} mejor={rec.oferta_recomendada} actual={actual} />
          )}
          {rec.oferta_recomendada && onComprar && (
            <button className="boton boton--comprar agente__comprar" onClick={() => onComprar(rec.oferta_recomendada)}>
              Comprar a {rec.oferta_recomendada.vendedor} por {euros(rec.oferta_recomendada.coste_total)}
            </button>
          )}

          <p className="agente__titular">{rec.titular}</p>
          {rec.explicacion && <p className="agente__explicacion">{rec.explicacion}</p>}

          {rec.puntos_fuertes?.length > 0 && (
            <ul className="agente__puntos">
              {rec.puntos_fuertes.map((p) => <li key={p}>{p}</li>)}
            </ul>
          )}

          {rec.a_tener_en_cuenta && (
            <p className="agente__aviso"><strong>A tener en cuenta:</strong> {rec.a_tener_en_cuenta}</p>
          )}

          {rec.resumen_resenas && (
            <p className="agente__resenas"><strong>Qué opinan los clientes:</strong> {rec.resumen_resenas}</p>
          )}

          {rec.complementarios?.length > 0 && (
            <div className="agente__juntos">
              <strong>También te puede interesar</strong>
              <ul>
                {rec.complementarios.map((c) => (
                  <li key={c.producto_id}>
                    <a href={`#/producto/${c.producto_id}`}>{c.nombre}</a>
                    {c.motivo && <span className="tenue"> — {c.motivo}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Proceso rec={rec} onRegenerar={() => cargar(true)} />
        </div>
      )}
    </section>
  )
}

function Elegida({ oferta }) {
  return (
    <div className="elegida">
      <span className="elegida__vendedor">{oferta.vendedor}</span>
      <span className="etiqueta-precio etiqueta-precio--grande">{euros(oferta.coste_total)}</span>
      <span className="elegida__detalle">
        {oferta.envio === 0 ? 'Envío gratis' : `${euros(oferta.envio)} de envío incluidos`} · llega en {dias(oferta.dias_entrega)}
      </span>
    </div>
  )
}

// Compara la recomendada con la oferta en la que entró el cliente
function FrenteAActual({ id, mejor, actual }) {
  if (mejor.oferta_id === actual.oferta_id) {
    return <p className="frente frente--igual">Ya estás viendo la mejor opción.</p>
  }
  const difPrecio = Math.round((mejor.coste_total - actual.coste_total) * 100) / 100
  const difDias = actual.dias_entrega - mejor.dias_entrega
  const partes = []
  if (difPrecio > 0) partes.push(`pagas ${euros(difPrecio)} más`)
  if (difPrecio < 0) partes.push(`ahorras ${euros(-difPrecio)}`)
  if (difDias > 0) partes.push(`te llega ${dias(difDias)} antes`)
  if (difDias < 0) partes.push(`tarda ${dias(-difDias)} más`)
  if (partes.length === 0) partes.push('mismo precio y plazo, pero mejor valorada')
  return (
    <div className="frente">
      <p>
        Frente a la oferta de <strong>{actual.vendedor}</strong> que estabas viendo:{' '}
        {partes.join(' y ')}.
      </p>
      <a className="boton boton--azafran" href={enlaceOferta(id, mejor.oferta_id)}>
        Ir a la oferta de {mejor.vendedor}
      </a>
    </div>
  )
}

function Origen({ rec }) {
  if (rec.fuente === 'ia') {
    return <span className="origen origen--ia" title={`Proveedor: ${rec.proveedor}`}>Redactado con IA · {rec.modelo}</span>
  }
  return <span className="origen origen--respaldo" title={rec.motivo_respaldo}>Calculado sin IA</span>
}

function Pensando({ num }) {
  return (
    <div className="pensando" role="status">
      <span className="pensando__punto" />
      <p>Comparando {num} vendedores y leyendo las reseñas…</p>
    </div>
  )
}

// Muestra qué herramientas usó el agente: lo que hay que enseñar en la demo
function Proceso({ rec, onRegenerar }) {
  return (
    <details className="proceso">
      <summary>Cómo se ha decidido</summary>
      <p>
        La mejor oferta la calcula la tienda con una puntuación fija (precio 35 %, rapidez 25 %,
        valoración 25 %, envío 15 %). El asistente solo la explica, así que no puede cambiarla.
      </p>
      {rec.herramientas_usadas?.length > 0 ? (
        <ol className="proceso__pasos">
          {rec.herramientas_usadas.map((h, i) => (
            <li key={i}>
              {NOMBRE_HERRAMIENTA[h.herramienta] ?? h.herramienta}{' '}
              <code>{h.herramienta}({h.argumentos?.producto_id})</code>
            </li>
          ))}
        </ol>
      ) : (
        <p className="tenue">
          Esta vez no se usó la IA{rec.motivo_respaldo ? ` (${rec.motivo_respaldo.slice(0, 140)})` : ''}. El texto
          se ha generado a partir de las puntuaciones.
        </p>
      )}
      <ul className="proceso__datos">
        {rec.resenas_descartadas > 0 && (
          <li>{rec.resenas_descartadas} reseña{rec.resenas_descartadas > 1 ? 's' : ''} sospechosa{rec.resenas_descartadas > 1 ? 's' : ''} bloqueada{rec.resenas_descartadas > 1 ? 's' : ''} antes de llegar a la IA</li>
        )}
        <li>{rec.desde_cache ? 'Recomendación guardada (carga instantánea)' : `Generada en ${(rec.latencia_ms / 1000).toFixed(1)} s`}</li>
      </ul>
      <button className="boton boton--claro" onClick={onRegenerar}>Volver a generar</button>
    </details>
  )
}
