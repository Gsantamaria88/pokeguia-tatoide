#!/usr/bin/env python3
"""Crea docs/datos/cosmeticos.json con los nombres en español del propio cliente de PokeMMO.

Los identificadores de los textos clasifican cada cosmético por parte del cuerpo.
Repetir tras un parche que añada cosméticos, con el cliente instalado.
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CLIENTE = Path.home() / ".var/app/com.pokemmo.PokeMMO/data/pokemmo-client-live/data/strings/strings_es.xml"
GRUPOS = {21: "Sombreros", 22: "Pelo", 23: "Ojos y gafas", 24: "Cara", 25: "Espalda", 26: "Parte superior",
          27: "Manos", 28: "Zapatos", 29: "Parte inferior", 31: "Bicicletas"}
texto = CLIENTE.read_text(encoding="utf-8")
datos = {int(k): v for k, v in re.findall(r'<string id="(\d+)">([^<]*)</string>', texto)}
salida = {}
for bloque, nombre in GRUPOS.items():
    nombres = {v.strip() for k, v in datos.items()
               if k // 1000 == bloque and v.strip() and not v.startswith("Espacio") and len(v) < 50 and "{" not in v}
    salida[nombre] = sorted(nombres, key=str.casefold)
destino = RAIZ / "docs/datos/cosmeticos.json"
destino.write_text(json.dumps(salida, ensure_ascii=False, indent=0), encoding="utf-8")
print({k: len(v) for k, v in salida.items()}, sum(len(v) for v in salida.values()))
