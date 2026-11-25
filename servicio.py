"""Lógica de la tienda que usa la API: catálogo, ficha de producto y recomendaciones.

Las recomendaciones se guardan (caché) para que la página cargue al instante:
1. En memoria del proceso.
2. En la tabla `recomendaciones` de Supabase (si hay SUPABASE_SERVICE_KEY para escribir).
"""
import logging

import config
from agente import recomendar
from datos import FUENTE, OFERTAS, PRODUCTOS
from herramientas import obtener_ofertas, obtener_resenas, productos_complementarios

log = logging.getLogger("servicio")
_cache: dict[str, dict] = {}


def listar_productos() -> list[dict]:
    """Catálogo. Cada producto se muestra con una oferta concreta (la más barata con envío),
    como en un marketplace: el cliente entra por la oferta de un vendedor."""
    resultado = []
    for pid, info in PRODUCTOS.items():
        suyas = [o for o in OFERTAS if o["producto_id"] == pid]
        barata = min(suyas, key=lambda o: o["precio"] + o["envio"], default=None)
        resultado.append({
            "producto_id": pid,
            **info,
            "num_ofertas": len(suyas),
            "precio_desde": round(barata["precio"] + barata["envio"], 2) if barata else None,
            "oferta_destacada": barata and {
                "oferta_id": barata["oferta_id"],
                "vendedor": barata["vendedor"],
                "coste_total": round(barata["precio"] + barata["envio"], 2),
            },
        })
    return resultado


def ficha_producto(producto_id: str) -> dict:
    if producto_id not in PRODUCTOS:
        raise KeyError(producto_id)
    return {
        "producto_id": producto_id,
        **PRODUCTOS[producto_id],
        "ofertas": obtener_ofertas(producto_id)["ofertas"],
        "resenas": obtener_resenas(producto_id)["resenas"],
        "complementarios": productos_complementarios(producto_id)["complementarios"],
    }


def _leer_guardada(producto_id: str) -> dict | None:
    if FUENTE != "supabase":
        return None
    try:
        from supabase_rest import seleccionar
        filas = seleccionar("recomendaciones", producto_id=producto_id)
        return filas[0]["contenido"] if filas else None
    except Exception as e:  # noqa: BLE001
        log.warning("No se pudo leer la recomendación guardada: %s", e)
        return None


def _guardar(rec: dict) -> None:
    if FUENTE != "supabase" or not config.SUPABASE_SERVICE_KEY:
        return
    try:
        from supabase_rest import insertar_o_actualizar
        insertar_o_actualizar("recomendaciones", [{
            "producto_id": rec["producto_id"],
            "contenido": rec,
            "fuente": rec["fuente"],
            "modelo": rec.get("modelo"),
        }], "producto_id")
    except Exception as e:  # noqa: BLE001
        log.warning("No se pudo guardar la recomendación: %s", e)


def obtener_recomendacion(producto_id: str, regenerar: bool = False) -> dict:
    if producto_id not in PRODUCTOS:
        raise KeyError(producto_id)
    if not regenerar:
        if producto_id in _cache:
            return _cache[producto_id] | {"desde_cache": True}
        guardada = _leer_guardada(producto_id)
        if guardada:
            _cache[producto_id] = guardada
            return guardada | {"desde_cache": True}

    rec = recomendar(producto_id)
    # Solo se guardan las de IA: un respaldo por un fallo puntual no debe quedarse fijo.
    if rec["fuente"] == "ia":
        _cache[producto_id] = rec
        _guardar(rec)
    return rec | {"desde_cache": False}
