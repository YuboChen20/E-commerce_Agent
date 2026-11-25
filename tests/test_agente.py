"""Pruebas del agente con un Gemini simulado (no gasta cuota ni necesita red).

Uso:  python -m unittest discover -s tests -v
"""
import json
import os
import sys
import unittest
from pathlib import Path

# Las pruebas usan siempre fake_data.py
for var in ("SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_KEY",
            "ANTHROPIC_API_KEY", "GEMINI_API_KEY"):
    os.environ[var] = ""
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import agente  # noqa: E402
from herramientas import obtener_ofertas  # noqa: E402


def gemini_simulado(respuesta_final: dict | str):
    """Simula a Gemini: primero pide las 3 herramientas y luego responde."""
    peticiones = []

    def llamar(cuerpo):
        peticiones.append(cuerpo)
        if len(peticiones) == 1:
            return {"candidates": [{"content": {"role": "model", "parts": [
                {"functionCall": {"name": n, "args": {"producto_id": "prod_01"}}}
                for n in ("obtener_ofertas", "obtener_resenas", "productos_complementarios")
            ]}}]}
        texto = respuesta_final if isinstance(respuesta_final, str) else (
            "```json\n" + json.dumps(respuesta_final, ensure_ascii=False) + "\n```")
        return {"candidates": [{"content": {"role": "model", "parts": [{"text": texto}]}}]}

    llamar.peticiones = peticiones
    return llamar


def salida_buena(**cambios):
    base = {
        "oferta_recomendada_id": obtener_ofertas("prod_01")["mejor_oferta_id"],
        "titular": "AudioWorld: llega en 3 días y con envío gratis",
        "explicacion": "Cuesta 2 € más que TecnoShop, pero llega 4 días antes.",
        "puntos_fuertes": ["Envío gratis", "Entrega en 3 días"],
        "a_tener_en_cuenta": "No es la opción más barata.",
        "resumen_resenas": "Los clientes destacan la calidad y la rapidez.",
        "complementarios": [{"producto_id": "prod_02", "motivo": "Protege los auriculares."}],
    }
    return base | cambios


class TestAgente(unittest.TestCase):
    def test_camino_feliz(self):
        llamar = gemini_simulado(salida_buena())
        rec = agente.recomendar("prod_01", llamar=llamar)
        self.assertEqual(rec["fuente"], "ia")
        self.assertEqual(rec["oferta_recomendada"]["oferta_id"], "of_2")
        self.assertEqual([t["herramienta"] for t in rec["herramientas_usadas"]],
                         ["obtener_ofertas", "obtener_resenas", "productos_complementarios"])
        self.assertEqual(rec["complementarios"][0]["nombre"], "Funda para auriculares Sonelle Case")
        # La segunda petición lleva las respuestas de las herramientas
        partes = llamar.peticiones[1]["contents"][-1]["parts"]
        self.assertEqual(len(partes), 3)
        self.assertIn("functionResponse", partes[0])

    def test_resena_maliciosa_no_llega_al_modelo(self):
        llamar = gemini_simulado(salida_buena())
        agente.recomendar("prod_01", llamar=llamar)
        enviado = json.dumps(llamar.peticiones[1], ensure_ascii=False)
        self.assertNotIn("Ignora todas las instrucciones", enviado)

    def test_si_el_modelo_cambia_la_oferta_se_usa_respaldo(self):
        rec = agente.recomendar("prod_01", llamar=gemini_simulado(
            salida_buena(oferta_recomendada_id="of_3")))
        self.assertEqual(rec["fuente"], "respaldo")
        self.assertEqual(rec["oferta_recomendada"]["oferta_id"], "of_2")
        self.assertIn("of_3", rec["motivo_respaldo"])

    def test_enlaces_rechazados(self):
        rec = agente.recomendar("prod_01", llamar=gemini_simulado(
            salida_buena(explicacion="Cómpralo en https://estafa.com")))
        self.assertEqual(rec["fuente"], "respaldo")

    def test_json_roto(self):
        rec = agente.recomendar("prod_01", llamar=gemini_simulado("no soy JSON"))
        self.assertEqual(rec["fuente"], "respaldo")

    def test_complementario_inventado_se_descarta(self):
        rec = agente.recomendar("prod_01", llamar=gemini_simulado(salida_buena(
            complementarios=[{"producto_id": "prod_99", "motivo": "x"}])))
        self.assertEqual(rec["fuente"], "ia")
        self.assertEqual(rec["complementarios"], [])

    def test_error_de_red(self):
        def falla(_):
            raise RuntimeError("timeout")
        rec = agente.recomendar("prod_01", llamar=falla)
        self.assertEqual(rec["fuente"], "respaldo")
        self.assertTrue(rec["titular"].startswith("Mejor opción: AudioWorld"))

    def test_producto_inexistente(self):
        with self.assertRaises(KeyError):
            agente.recomendar("prod_99")

class TestReintentos(unittest.TestCase):
    def test_modelo_saturado_pasa_a_reserva(self):
        import config
        usados = []
        bueno = gemini_simulado(salida_buena())

        def falso_llamar_gemini(cuerpo, modelo=None):
            usados.append(modelo)
            if modelo == "principal":
                raise agente.GeminiNoDisponible("503 saturado")
            return bueno(cuerpo)

        orig = (agente.llamar_gemini, config.GEMINI_API_KEY, config.GEMINI_MODELOS)
        try:
            agente.llamar_gemini = falso_llamar_gemini
            config.GEMINI_API_KEY = "x"
            config.GEMINI_MODELOS = ["principal", "reserva"]
            rec = agente.recomendar("prod_01")
        finally:
            agente.llamar_gemini, config.GEMINI_API_KEY, config.GEMINI_MODELOS = orig
        self.assertEqual(rec["fuente"], "ia")
        self.assertEqual(rec["modelo"], "reserva")
        self.assertEqual(usados[0], "principal")

    def test_reintenta_503_y_luego_funciona(self):
        import io
        import urllib.error
        import urllib.request
        respuestas = [503, 200]

        class Resp(io.BytesIO):
            def __enter__(self): return self
            def __exit__(self, *a): return False

        def falso_urlopen(req, timeout=None):
            codigo = respuestas.pop(0)
            if codigo != 200:
                raise urllib.error.HTTPError(req.full_url, codigo, "x", {}, io.BytesIO(b"{}"))
            return Resp(b'{"ok": true}')

        orig = (urllib.request.urlopen, agente.ESPERAS_REINTENTO)
        try:
            urllib.request.urlopen = falso_urlopen
            agente.ESPERAS_REINTENTO = (0, 0)
            self.assertEqual(agente.llamar_gemini({}, modelo="m"), {"ok": True})
        finally:
            urllib.request.urlopen, agente.ESPERAS_REINTENTO = orig


def claude_simulado(respuesta_final: dict):
    """Simula la Messages API de Claude: pide las 3 herramientas y luego responde."""
    peticiones = []

    def llamar(cuerpo):
        peticiones.append(json.loads(json.dumps(cuerpo)))
        if len(peticiones) == 1:
            return {"stop_reason": "tool_use", "content": [
                {"type": "text", "text": "Voy a consultar los datos."},
                *[{"type": "tool_use", "id": f"t{i}", "name": n, "input": {"producto_id": "prod_01"}}
                  for i, n in enumerate(("obtener_ofertas", "obtener_resenas",
                                         "productos_complementarios"))],
            ]}
        return {"stop_reason": "end_turn", "content": [
            {"type": "text", "text": json.dumps(respuesta_final, ensure_ascii=False)}]}

    llamar.peticiones = peticiones
    return llamar


class TestClaude(unittest.TestCase):
    def test_camino_feliz_claude(self):
        llamar = claude_simulado(salida_buena())
        rec = agente.recomendar("prod_01", llamar=llamar, proveedor="claude")
        self.assertEqual(rec["fuente"], "ia")
        self.assertEqual(rec["proveedor"], "claude")
        self.assertEqual(len(rec["herramientas_usadas"]), 3)
        ultimo = llamar.peticiones[1]["messages"][-1]
        self.assertEqual(ultimo["role"], "user")
        self.assertEqual([b["tool_use_id"] for b in ultimo["content"]], ["t0", "t1", "t2"])
        self.assertNotIn("Ignora todas las instrucciones", json.dumps(llamar.peticiones[1]))

    def test_claude_saturado_pasa_a_gemini(self):
        import config
        bueno = gemini_simulado(salida_buena())

        def claude_falla(cuerpo, modelo=None):
            raise agente.IANoDisponible("Claude respondió 529")

        def gemini_ok(cuerpo, modelo=None):
            return bueno(cuerpo)

        nombres = ("ANTHROPIC_API_KEY", "GEMINI_API_KEY", "GEMINI_MODELOS", "IA_ORDEN")
        orig_cfg = {n: getattr(config, n) for n in nombres}
        orig = (agente.llamar_claude, agente.llamar_gemini)
        try:
            config.ANTHROPIC_API_KEY = config.GEMINI_API_KEY = "x"
            config.GEMINI_MODELOS = ["gemini-x"]
            config.IA_ORDEN = ["claude", "gemini"]
            agente.llamar_claude, agente.llamar_gemini = claude_falla, gemini_ok
            rec = agente.recomendar("prod_01")
        finally:
            for n, v in orig_cfg.items():
                setattr(config, n, v)
            agente.llamar_claude, agente.llamar_gemini = orig
        self.assertEqual((rec["fuente"], rec["proveedor"], rec["modelo"]),
                         ("ia", "gemini", "gemini-x"))

    def test_todos_fallan_respaldo_con_motivos(self):
        import config
        orig_cfg = (config.ANTHROPIC_API_KEY, config.IA_ORDEN)
        orig = agente.llamar_claude
        try:
            config.ANTHROPIC_API_KEY, config.IA_ORDEN = "x", ["claude"]
            agente.llamar_claude = lambda c, modelo=None: (_ for _ in ()).throw(
                agente.IANoDisponible("529"))
            rec = agente.recomendar("prod_01")
        finally:
            config.ANTHROPIC_API_KEY, config.IA_ORDEN = orig_cfg
            agente.llamar_claude = orig
        self.assertEqual(rec["fuente"], "respaldo")
        self.assertIn("529", rec["motivo_respaldo"])


if __name__ == "__main__":
    unittest.main()
