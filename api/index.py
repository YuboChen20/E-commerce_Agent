"""API de la tienda (FastAPI). Vercel la sirve como función serverless.

En local:
    uvicorn api.index:app --reload --port 8000
    -> http://localhost:8000/docs  (documentación interactiva)
"""
import sys
from pathlib import Path

# Permite importar los módulos de la raíz del repo (herramientas.py, agente.py...)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

import config  # noqa: E402
import servicio  # noqa: E402
from datos import FUENTE  # noqa: E402

app = FastAPI(title="Tienda con agente recomendador", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGENES,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/salud")
def salud():
    """Estado del servicio: de dónde salen los datos y si hay IA configurada."""
    return {
        "ok": True,
        "datos": FUENTE,
        "ia_orden": config.IA_ORDEN,
        "claude_configurado": bool(config.ANTHROPIC_API_KEY),
        "gemini_configurado": bool(config.GEMINI_API_KEY),
        "modelos": {"claude": config.CLAUDE_MODEL, "gemini": config.GEMINI_MODELOS},
    }


@app.get("/api/productos")
def productos():
    """Catálogo: lista de productos con el precio más bajo (precio + envío)."""
    return servicio.listar_productos()


@app.get("/api/productos/{producto_id}")
def producto(producto_id: str):
    """Ficha del producto: ofertas puntuadas, reseñas filtradas y complementarios."""
    try:
        return servicio.ficha_producto(producto_id)
    except KeyError:
        raise HTTPException(404, f"Producto no encontrado: {producto_id}")


@app.get("/api/productos/{producto_id}/recomendacion")
def recomendacion(producto_id: str, regenerar: bool = False):
    """Recomendación del agente. Usa la guardada salvo que se pida `regenerar=true`."""
    try:
        return servicio.obtener_recomendacion(producto_id, regenerar=regenerar)
    except KeyError:
        raise HTTPException(404, f"Producto no encontrado: {producto_id}")
