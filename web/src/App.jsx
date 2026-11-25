import { useEffect, useState } from 'react'
import Catalogo from './Catalogo.jsx'
import Producto from './Producto.jsx'

// Rutas con # (sin dependencias):
//   #/                                  catálogo
//   #/producto/prod_12?oferta=of_42     oferta concreta de un producto
function leerRuta() {
  const [ruta, consulta = ''] = window.location.hash.replace(/^#\/?/, '').split('?')
  const partes = ruta.split('/')
  if (partes[0] === 'producto' && partes[1]) {
    return { pagina: 'producto', id: partes[1], oferta: new URLSearchParams(consulta).get('oferta') }
  }
  return { pagina: 'catalogo' }
}

export default function App() {
  const [ruta, setRuta] = useState(leerRuta)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const alCambiar = () => {
      setRuta(leerRuta())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  const buscar = (texto) => {
    setBusqueda(texto)
    if (ruta.pagina !== 'catalogo') window.location.hash = '#/'
  }

  return (
    <>
      <header className="cabecera">
        <div className="cabecera__dentro">
          <a href="#/" className="logo" aria-label="Zoco, ir al inicio">
            <span className="logo__marca">Z</span>
            <span className="logo__nombre">zoco</span>
          </a>
          <label className="buscador">
            <span className="sr-only">Buscar productos</span>
            <input
              type="search"
              placeholder="Busca auriculares, freidora, rascador…"
              value={busqueda}
              onChange={(e) => buscar(e.target.value)}
            />
          </label>
          <p className="cabecera__lema">Varios vendedores, una recomendación clara</p>
        </div>
      </header>

      <main>
        {ruta.pagina === 'producto'
          ? <Producto key={ruta.id} id={ruta.id} ofertaId={ruta.oferta} />
          : <Catalogo busqueda={busqueda} />}
      </main>

      <footer className="pie">
        <p>
          Prototipo para el hackathon de agentes de IA de la UC3M. Productos, vendedores y reseñas son
          datos sintéticos creados para la demo.
        </p>
      </footer>
    </>
  )
}
