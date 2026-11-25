# E-commerce_Agent

Tienda online tipo marketplace (varios vendedores por producto) con un agente de IA
que, dentro de la página del producto, recomienda la mejor oferta, resume las reseñas
y sugiere productos complementarios. Proyecto para el hackathon de agentes de IA de la UC3M.

**Stack:** Python + FastAPI (desplegado en Vercel) · Supabase (Postgres) · Claude Haiku 5.5 (API de Anthropic) con Gemini como reserva.

## Cómo funciona

```
Web (React)  ──►  API FastAPI en Vercel  ──►  Agente (agente.py)  ──►  Gemini
                        │                         │ llama a las 3 herramientas
                        │                         ▼
                        └──────────────►  herramientas.py  ──►  datos.py ──► Supabase
                                                                   └─► fake_data.py (respaldo)
```

- **Python decide, la IA explica.** `obtener_ofertas` calcula la puntuación (precio 35 %,
  entrega 25 %, valoración 25 %, envío 15 %) y elige la mejor oferta. Gemini solo redacta.
- **Validación:** si Gemini recomienda otra oferta, inventa un producto, pone enlaces o
  devuelve un JSON roto, se descarta su respuesta y se usa el **respaldo sin IA**.
- **Seguridad:** las reseñas con patrones sospechosos ("ignora", URLs...) no llegan al
  modelo, y las instrucciones le dicen que las reseñas son datos, no órdenes.
- **Caché:** las recomendaciones se guardan en Supabase (`recomendaciones`) para que la
  demo cargue al instante. Se pueden generar todas antes con `scripts/pregenerar.py`.

## Ficheros

| Fichero | Qué hace |
|---|---|
| `fake_data.py` | Datos de ejemplo (productos, ofertas, reseñas, complementos) |
| `datos.py` | Carga los datos de Supabase o, si no hay, de `fake_data.py` |
| `herramientas.py` | Las 3 herramientas del agente |
| `agente.py` | Bucle con Gemini, validación y respaldo |
| `servicio.py` | Catálogo, ficha de producto y caché de recomendaciones |
| `api/index.py` | API FastAPI |
| `supabase/schema.sql` | Tablas y permisos de Supabase |
| `scripts/cargar_supabase.py` | Sube `fake_data.py` a Supabase |
| `scripts/pregenerar.py` | Genera todas las recomendaciones y muestra métricas |
| `tests/` | Pruebas con Gemini simulado |

## Puesta en marcha en local

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # y rellenad las claves
uvicorn api.index:app --reload --port 8000
```

Abrid http://localhost:8000/docs para probar la API. Sin claves también funciona:
usa `fake_data.py` y el respaldo sin IA.

### 1. IA (Claude y/o Gemini)
Basta con una de las dos claves; con las dos, si la primera falla se usa la segunda (`IA_ORDEN`).

**Claude (principal):** en https://platform.claude.com cread una cuenta, cargad saldo en
**Billing** y cread una clave en **API Keys**. Pegadla en `.env` como `ANTHROPIC_API_KEY`.

**Gemini (reserva, gratis):**
1. Entrad en https://aistudio.google.com y pulsad **Get API key → Create API key**.
2. Pegadla en `.env` como `GEMINI_API_KEY`.
3. Comprobad en AI Studio el nombre exacto del modelo Flash y ponedlo en `GEMINI_MODEL`.
4. Probad: `python agente.py prod_01` → debe salir `"fuente": "ia"`.

### 2. Supabase
1. Cread un proyecto en https://supabase.com.
2. **SQL Editor → New query**, pegad `supabase/schema.sql` y pulsad **Run**.
3. En **Project Settings → API** copiad la URL, la clave `anon`/publishable y la `service_role`/secret al `.env`.
4. `python scripts/cargar_supabase.py`
5. `curl localhost:8000/api/salud` → debe decir `"datos": "supabase"`.

### 3. Antes de la demo
```bash
python scripts/pregenerar.py --todos
```

## La tienda (frontend)

La web está en `web/` (React + Vite). Necesita **Node.js 20 o superior** (https://nodejs.org).
Con la API arrancada en el puerto 8000, en otra terminal:

```bash
cd web
npm install        # solo la primera vez
npm run dev
```

Abrid http://localhost:5173. Vite reenvía las llamadas a `/api` a la API del puerto 8000.

- **Catálogo:** búsqueda y filtro por categoría. Cada producto se muestra con la oferta
  de un vendedor concreto (la más barata), como en un marketplace.
- **Página de producto:** primero se ve esa oferta con su precio y el botón
  **«Buscar la mejor opción»**. Al pulsarlo aparecen la recomendación del agente, la
  comparación con la oferta que estabas viendo y la lista de todos los vendedores con su
  puntuación desglosada (precio, rapidez, valoración, envío).
- **Detalle de cada oferta:** en la lista de vendedores, al pulsar una oferta se despliega su
  puntuación criterio a criterio y las opiniones sobre ese vendedor.
- **Compra simulada:** botones «Comprar» en la ficha, en el panel y en cada oferta. Abren una
  confirmación con el total y la fecha estimada de llegada; no hay pago ni pedidos reales.
- **Panel del asistente:** si está redactado con IA o sin IA, y en «Cómo se ha decidido»
  las herramientas que llamó el agente y las reseñas bloqueadas. «Volver a generar» pide
  una recomendación nueva (útil en la demo).
- **Imágenes:** ilustraciones SVG propias (`web/src/Ilustracion.jsx`). Si un producto
  tiene `imagen_url` (columna de Supabase), se muestra esa foto en su lugar.

## Endpoints

| Método | Ruta | Devuelve |
|---|---|---|
| GET | `/api/salud` | Origen de datos y si la IA está configurada |
| GET | `/api/productos` | Catálogo con precio desde |
| GET | `/api/productos/{id}` | Producto, ofertas puntuadas, reseñas y complementarios |
| GET | `/api/productos/{id}/recomendacion` | Recomendación del agente (`?regenerar=true` para forzarla) |

La recomendación incluye `fuente` (`ia` o `respaldo`), `herramientas_usadas` (para
enseñar en la demo qué herramientas llamó el agente), `latencia_ms` y `resenas_descartadas`.

## Despliegue en Vercel

1. Importad el repo en https://vercel.com/new. `vercel.json` ya indica cómo construir la web
   (`web/`) y la API (`api/`), así que todo queda en el mismo dominio.
2. En **Settings → Environment Variables** añadid las mismas variables del `.env`
   (y en `CORS_ORIGENES` la URL de la web).
3. Desplegad. La API queda en `https://<proyecto>.vercel.app/api/...`.

> La `SUPABASE_SERVICE_KEY` y la `GEMINI_API_KEY` solo van en el servidor (Vercel o `.env`),
> nunca en el código de la web.

## Pruebas

```bash
python -m unittest discover -s tests -v
```
