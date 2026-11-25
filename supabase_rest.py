"""Cliente mínimo de la API REST de Supabase (PostgREST), sin dependencias.

Se usa urllib de la librería estándar para no añadir paquetes al despliegue.
"""
import json
import urllib.error
import urllib.parse
import urllib.request

import config


class ErrorSupabase(RuntimeError):
    pass


def _cabeceras(escritura: bool) -> dict:
    clave = config.SUPABASE_SERVICE_KEY if escritura else (
        config.SUPABASE_ANON_KEY or config.SUPABASE_SERVICE_KEY
    )
    if not clave:
        raise ErrorSupabase("Falta la clave de Supabase para esta operación.")
    return {
        "apikey": clave,
        "Authorization": f"Bearer {clave}",
        "Content-Type": "application/json",
    }


def _peticion(metodo: str, tabla: str, params: dict | None = None,
              cuerpo=None, escritura: bool = False, extra: dict | None = None):
    if not config.SUPABASE_URL:
        raise ErrorSupabase("SUPABASE_URL no está configurada.")
    url = f"{config.SUPABASE_URL}/rest/v1/{tabla}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    cabeceras = _cabeceras(escritura) | (extra or {})
    datos = None if cuerpo is None else json.dumps(cuerpo).encode("utf-8")
    req = urllib.request.Request(url, data=datos, method=metodo, headers=cabeceras)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            texto = resp.read().decode("utf-8")
            return json.loads(texto) if texto else None
    except urllib.error.HTTPError as e:
        detalle = e.read().decode("utf-8", "replace")
        raise ErrorSupabase(f"{metodo} {tabla} -> {e.code}: {detalle}") from e
    except urllib.error.URLError as e:
        raise ErrorSupabase(f"No se pudo conectar con Supabase: {e.reason}") from e


def seleccionar(tabla: str, **filtros) -> list[dict]:
    """SELECT * FROM tabla [WHERE col = valor ...]."""
    params = {"select": "*"}
    params.update({col: f"eq.{valor}" for col, valor in filtros.items()})
    return _peticion("GET", tabla, params) or []


def insertar_o_actualizar(tabla: str, filas: list[dict], clave: str) -> None:
    """UPSERT por la columna `clave`. Requiere SUPABASE_SERVICE_KEY."""
    if not filas:
        return
    _peticion(
        "POST", tabla, {"on_conflict": clave}, filas, escritura=True,
        extra={"Prefer": "resolution=merge-duplicates,return=minimal"},
    )
