import { useEffect, useRef, useState } from 'react'
import { dias, euros } from './util.js'

// Fecha estimada de llegada a partir de hoy
const fechaLlegada = (n) => {
  const f = new Date()
  f.setDate(f.getDate() + n)
  return f.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

/* Compra SIMULADA: no hay carrito, pago ni pedidos reales. Sirve para la demo. */
export default function Compra({ producto, oferta, esRecomendada, onCerrar }) {
  const dialogo = useRef(null)
  const [pedido, setPedido] = useState(null)

  useEffect(() => {
    const d = dialogo.current
    if (oferta && !d.open) d.showModal()
    if (!oferta && d.open) d.close()
  }, [oferta])

  useEffect(() => { setPedido(null) }, [oferta])

  const confirmar = () => {
    setPedido(`ZC-${Math.floor(100000 + Math.random() * 900000)}`)
  }

  return (
    <dialog
      ref={dialogo}
      className="compra"
      aria-labelledby="titulo-compra"
      onClose={onCerrar}
      onClick={(e) => e.target === dialogo.current && onCerrar()}
    >
      {oferta && (
        <div className="compra__dentro">
          {!pedido ? (
            <>
              <h2 id="titulo-compra">Confirmar compra</h2>
              <p className="compra__producto">{producto.nombre}</p>
              <dl className="compra__resumen">
                <div><dt>Vendedor</dt><dd>{oferta.vendedor}</dd></div>
                <div><dt>Precio</dt><dd>{euros(oferta.precio)}</dd></div>
                <div><dt>Envío</dt><dd>{oferta.envio === 0 ? 'Gratis' : euros(oferta.envio)}</dd></div>
                <div><dt>Llegada estimada</dt><dd>{fechaLlegada(oferta.dias_entrega)} ({dias(oferta.dias_entrega)})</dd></div>
                <div className="compra__total"><dt>Total</dt><dd>{euros(oferta.coste_total)}</dd></div>
              </dl>
              {esRecomendada
                ? <p className="compra__nota compra__nota--ok">Es la oferta que recomienda el asistente.</p>
                : <p className="compra__nota">El asistente recomienda otra oferta para este producto.</p>}
              <p className="compra__aviso">Es una simulación: no se pide ningún dato de pago ni se cobra nada.</p>
              <div className="compra__botones">
                <button className="boton boton--borde" onClick={onCerrar}>Cancelar</button>
                <button className="boton boton--verde" onClick={confirmar} autoFocus>Confirmar pedido</button>
              </div>
            </>
          ) : (
            <>
              <p className="compra__check" aria-hidden="true">✓</p>
              <h2 id="titulo-compra">Pedido realizado</h2>
              <p>
                Tu pedido <strong>{pedido}</strong> a <strong>{oferta.vendedor}</strong> por{' '}
                <strong>{euros(oferta.coste_total)}</strong> llegaría el {fechaLlegada(oferta.dias_entrega)}.
              </p>
              <p className="compra__aviso">Pedido simulado para la demo. No se ha cobrado nada.</p>
              <div className="compra__botones">
                <button className="boton boton--verde" onClick={onCerrar} autoFocus>Seguir comprando</button>
              </div>
            </>
          )}
        </div>
      )}
    </dialog>
  )
}
