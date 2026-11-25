"""Sube los datos de fake_data.py a Supabase.

Uso (desde la raíz del repo, con .env configurado):
    python scripts/cargar_supabase.py

Necesita SUPABASE_URL y SUPABASE_SERVICE_KEY. Se puede ejecutar varias veces:
productos, ofertas y complementos se actualizan; las reseñas se borran y se
vuelven a insertar para no duplicarlas.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import config  # noqa: E402
import fake_data  # noqa: E402
from supabase_rest import _peticion, insertar_o_actualizar  # noqa: E402


def main() -> None:
    if not (config.SUPABASE_URL and config.SUPABASE_SERVICE_KEY):
        sys.exit("Faltan SUPABASE_URL y SUPABASE_SERVICE_KEY en el .env")

    productos = [{"producto_id": pid, **info} for pid, info in fake_data.PRODUCTOS.items()]
    insertar_o_actualizar("productos", productos, "producto_id")
    insertar_o_actualizar("ofertas", fake_data.OFERTAS, "oferta_id")

    # Reseñas: borrar las de estos productos y volver a insertarlas
    ids = ",".join(fake_data.PRODUCTOS)
    _peticion("DELETE", "resenas", {"producto_id": f"in.({ids})"}, escritura=True)
    _peticion("POST", "resenas", cuerpo=fake_data.RESEÑAS, escritura=True,
              extra={"Prefer": "return=minimal"})

    complementos = [
        {"producto_id": pid, "complementario_id": cid}
        for pid, lista in fake_data.COMPLEMENTOS.items()
        for cid in lista
    ]
    insertar_o_actualizar("complementos", complementos, "producto_id,complementario_id")

    print(f"OK: {len(productos)} productos, {len(fake_data.OFERTAS)} ofertas, "
          f"{len(fake_data.RESEÑAS)} reseñas, {len(complementos)} complementos.")


if __name__ == "__main__":
    main()
