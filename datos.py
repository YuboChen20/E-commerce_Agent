"""Origen de los datos de la tienda.

Expone las mismas estructuras que fake_data.py (PRODUCTOS, OFERTAS, RESEÑAS,
COMPLEMENTOS), así herramientas.py no cambia su lógica:

- Si hay credenciales de Supabase, carga las tablas de Supabase.
- Si no las hay (o Supabase falla), usa fake_data.py. Así el proyecto
  siempre arranca, también en la demo sin conexión.
"""
import logging

import config
import fake_data

log = logging.getLogger("datos")


def _desde_fake_data():
    return (fake_data.PRODUCTOS, fake_data.OFERTAS, fake_data.RESEÑAS,
            fake_data.COMPLEMENTOS)


def _desde_supabase():
    from supabase_rest import seleccionar

    productos = {
        p["producto_id"]: {k: v for k, v in p.items() if k != "producto_id"}
        for p in seleccionar("productos")
    }
    ofertas = [
        {
            "oferta_id": o["oferta_id"],
            "producto_id": o["producto_id"],
            "vendedor": o["vendedor"],
            "precio": float(o["precio"]),
            "envio": float(o["envio"]),
            "dias_entrega": int(o["dias_entrega"]),
        }
        for o in seleccionar("ofertas")
    ]
    resenas = [
        {
            "producto_id": r["producto_id"],
            "vendedor": r["vendedor"],
            "estrellas": int(r["estrellas"]),
            "texto": r["texto"],
        }
        for r in seleccionar("resenas")
    ]
    complementos: dict[str, list[str]] = {}
    for c in seleccionar("complementos"):
        complementos.setdefault(c["producto_id"], []).append(c["complementario_id"])
    return productos, ofertas, resenas, complementos


def cargar():
    """Devuelve (PRODUCTOS, OFERTAS, RESEÑAS, COMPLEMENTOS, fuente)."""
    if config.USAR_SUPABASE:
        try:
            tablas = _desde_supabase()
            if tablas[0]:  # hay productos
                return (*tablas, "supabase")
            log.warning("Supabase no tiene productos; se usa fake_data.py")
        except Exception as e:  # noqa: BLE001 - cualquier fallo -> respaldo
            log.warning("No se pudo leer Supabase (%s); se usa fake_data.py", e)
    return (*_desde_fake_data(), "fake_data")


PRODUCTOS, OFERTAS, RESEÑAS, COMPLEMENTOS, FUENTE = cargar()
