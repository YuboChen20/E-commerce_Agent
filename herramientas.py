"""Herramientas del agente. Python calcula y decide; la IA solo explica.

Lee los datos de datos.py (PRODUCTOS, OFERTAS, RESEÑAS, COMPLEMENTOS).
"""
import re

from datos import PRODUCTOS, OFERTAS, RESEÑAS
from datos import COMPLEMENTOS as RELACIONADOS

# ---------- Configuración ----------
PESOS = {"precio": 0.35, "envio": 0.15, "entrega": 0.25, "valoracion": 0.25}  # suman 1.0
NEUTRO = 0.5  # puntuación (0-1) para vendedores sin reseñas: ni premio ni castigo

# Reseñas que contengan esto NO llegan al modelo (defensa contra prompt injection)
PATRON_SOSPECHOSO = re.compile(
    r"ignora|olvida|instruccion|recomienda\s+(siempre\s+)?al\s+vendedor"
    r"|system\s*prompt|https?://|www\.",
    re.IGNORECASE,
)


# ---------- Utilidades ----------
def _resenas_limpias(producto_id: str) -> tuple[list[dict], int]:
    """Reseñas del producto sin patrones sospechosos, y cuántas se descartaron."""
    todas = [r for r in RESEÑAS if r["producto_id"] == producto_id]
    limpias = [r for r in todas if not PATRON_SOSPECHOSO.search(r["texto"])]
    return limpias, len(todas) - len(limpias)


def _normalizar(valor: float, valores: list[float], menor_es_mejor: bool) -> float:
    """Min-max a [0,1]. Si todos son iguales, nadie gana por este criterio."""
    lo, hi = min(valores), max(valores)
    if hi == lo:
        return 1.0
    x = (valor - lo) / (hi - lo)
    return 1 - x if menor_es_mejor else x


# ---------- Herramienta 1 ----------
def obtener_ofertas(producto_id: str) -> dict:
    """Devuelve las ofertas de un producto con puntuación 0-100 ya calculada,
    ordenadas de mejor a peor, e indica el id de la mejor oferta.

    Args:
        producto_id: Identificador del producto, por ejemplo "prod_01".
    """
    del_producto = [o for o in OFERTAS if o["producto_id"] == producto_id]
    if not del_producto:
        return {"producto_id": producto_id, "ofertas": [], "mejor_oferta_id": None}

    # Valoración = media de estrellas de reseñas LIMPIAS (una reseña maliciosa no sube la nota)
    limpias, _ = _resenas_limpias(producto_id)
    notas: dict[str, float | None] = {}
    for vendedor in {o["vendedor"] for o in del_producto}:
        estrellas = [r["estrellas"] for r in limpias if r["vendedor"] == vendedor]
        notas[vendedor] = sum(estrellas) / len(estrellas) if estrellas else None
    notas_conocidas = [n for n in notas.values() if n is not None]

    precios = [o["precio"] for o in del_producto]
    envios = [o["envio"] for o in del_producto]
    dias = [o["dias_entrega"] for o in del_producto]

    ofertas = []
    for o in del_producto:
        nota = notas[o["vendedor"]]
        p_nota = NEUTRO if nota is None else _normalizar(nota, notas_conocidas, False)
        desglose = {  # puntos que aporta cada criterio (suman la puntuación 0-100)
            "precio": 100 * PESOS["precio"] * _normalizar(o["precio"], precios, True),
            "envio": 100 * PESOS["envio"] * _normalizar(o["envio"], envios, True),
            "entrega": 100 * PESOS["entrega"] * _normalizar(o["dias_entrega"], dias, True),
            "valoracion": 100 * PESOS["valoracion"] * p_nota,
        }
        puntos = sum(desglose.values()) / 100
        ofertas.append({
            "oferta_id": o["oferta_id"],
            "vendedor": o["vendedor"],
            "precio": o["precio"],
            "envio": o["envio"],
            "coste_total": round(o["precio"] + o["envio"], 2),
            "dias_entrega": o["dias_entrega"],
            "valoracion": None if nota is None else round(nota, 1),
            "num_resenas": sum(1 for r in limpias if r["vendedor"] == o["vendedor"]),
            "puntuacion": round(puntos * 100, 1),
            "desglose": {k: round(v, 1) for k, v in desglose.items()},
        })

    ofertas.sort(key=lambda x: x["puntuacion"], reverse=True)
    return {"producto_id": producto_id, "ofertas": ofertas,
            "mejor_oferta_id": ofertas[0]["oferta_id"]}


# ---------- Herramienta 2 ----------
def obtener_resenas(producto_id: str) -> dict:
    """Devuelve las reseñas de un producto ya filtradas (sin patrones sospechosos).

    Args:
        producto_id: Identificador del producto, por ejemplo "prod_01".
    """
    limpias, descartadas = _resenas_limpias(producto_id)
    oferta_de = {(o["producto_id"], o["vendedor"]): o["oferta_id"] for o in OFERTAS}
    return {
        "producto_id": producto_id,
        "resenas": [
            {
                "oferta_id": oferta_de.get((producto_id, r["vendedor"])),
                "vendedor": r["vendedor"],
                "estrellas": r["estrellas"],
                "texto": r["texto"],
            }
            for r in limpias
        ],
        "descartadas": descartadas,  # útil para métricas de la demo
    }


# ---------- Herramienta 3 ----------
def productos_complementarios(producto_id: str) -> dict:
    """Devuelve hasta 3 productos que se suelen comprar junto con este.

    Args:
        producto_id: Identificador del producto, por ejemplo "prod_01".
    """
    ids = RELACIONADOS.get(producto_id, [])
    comp = [{"producto_id": i, **PRODUCTOS[i]} for i in ids if i in PRODUCTOS][:3]
    return {"producto_id": producto_id, "complementarios": comp}


if __name__ == "__main__":
    import json
    for herramienta in (obtener_ofertas, obtener_resenas, productos_complementarios):
        print(f"\n== {herramienta.__name__}('prod_01') ==")
        print(json.dumps(herramienta("prod_01"), indent=2, ensure_ascii=False))