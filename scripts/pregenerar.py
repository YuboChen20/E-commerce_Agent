"""Genera y guarda la recomendación de todos los productos antes de la demo.

Uso (desde la raíz del repo, con .env configurado):
    python scripts/pregenerar.py            # solo los que no tienen recomendación guardada
    python scripts/pregenerar.py --todos    # regenera todos

Al final muestra métricas útiles para la presentación (latencia, % IA vs respaldo,
reseñas maliciosas descartadas).
"""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import servicio  # noqa: E402
from datos import FUENTE, PRODUCTOS  # noqa: E402


def main() -> None:
    todos = "--todos" in sys.argv
    print(f"Datos: {FUENTE} · {len(PRODUCTOS)} productos\n")
    resultados = []
    for pid in PRODUCTOS:
        rec = servicio.obtener_recomendacion(pid, regenerar=todos)
        resultados.append(rec)
        estado = "caché" if rec.get("desde_cache") else rec["fuente"]
        print(f"{pid:10} {estado:9} {rec.get('latencia_ms', 0):>6} ms  {rec['titular']}")
        if rec["fuente"] == "respaldo":
            print(f"{'':10} motivo: {rec.get('motivo_respaldo')}")
        if not rec.get("desde_cache"):
            time.sleep(1)  # margen para los límites de la capa gratuita

    nuevas = [r for r in resultados if not r.get("desde_cache")]
    if nuevas:
        ia = sum(r["fuente"] == "ia" for r in nuevas)
        lat = sorted(r["latencia_ms"] for r in nuevas)
        print(f"\nGeneradas: {len(nuevas)} · IA: {ia} ({100 * ia // len(nuevas)} %) · "
              f"respaldo: {len(nuevas) - ia}")
        print(f"Latencia mediana: {lat[len(lat) // 2]} ms · máxima: {lat[-1]} ms")
    print(f"Reseñas sospechosas descartadas: "
          f"{sum(r.get('resenas_descartadas', 0) for r in resultados)}")


if __name__ == "__main__":
    main()
