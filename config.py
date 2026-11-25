"""Configuración leída de variables de entorno.

En local se pueden poner en un fichero .env (ver .env.example).
En Vercel se configuran en Project Settings -> Environment Variables.
"""
import os
from pathlib import Path


def _cargar_env_local() -> None:
    """Carga .env si existe (sin dependencias). No pisa variables ya definidas."""
    ruta = Path(__file__).resolve().parent / ".env"
    if not ruta.exists():
        return
    for linea in ruta.read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if not linea or linea.startswith("#") or "=" not in linea:
            continue
        clave, valor = linea.split("=", 1)
        os.environ.setdefault(clave.strip(), valor.strip().strip('"').strip("'"))


_cargar_env_local()

# --- IA ---
# Orden en que se prueban los proveedores (se saltan los que no tienen clave)
IA_ORDEN = [p.strip().lower() for p in os.getenv("IA_ORDEN", "claude,gemini").split(",") if p.strip()]
IA_TIMEOUT = float(os.getenv("IA_TIMEOUT", "40"))

# --- Claude (API de Anthropic: https://platform.claude.com) ---
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-haiku-5-5")

# --- Gemini ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
# Comprobad el nombre exacto del modelo en Google AI Studio.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
# Modelos de reserva si el principal está saturado (503) o sin cuota (429), separados por comas
GEMINI_MODELOS_RESERVA = [
    m.strip()
    for m in os.getenv("GEMINI_MODELOS_RESERVA", "gemini-3.5-flash-lite").split(",")
    if m.strip() and m.strip() != GEMINI_MODEL
]
GEMINI_MODELOS = [GEMINI_MODEL, *GEMINI_MODELOS_RESERVA]

# --- Supabase ---
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
# Clave pública (anon / publishable): solo lectura gracias a RLS.
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
# Clave secreta (service_role): SOLO en el servidor. Permite guardar recomendaciones.
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

USAR_SUPABASE = bool(SUPABASE_URL and (SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY))

# --- Web ---
# Orígenes permitidos para CORS (la web de Vite en local, y la de Vercel).
CORS_ORIGENES = [
    o.strip()
    for o in os.getenv("CORS_ORIGENES", "http://localhost:5173").split(",")
    if o.strip()
]
