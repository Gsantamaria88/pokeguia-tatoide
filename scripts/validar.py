#!/usr/bin/env python3
"""Comprueba los datos de la web antes de publicar. Sale con error si algo no cuadra.

Revisa: JSON válido, ids únicos, tipos existentes, sprites presentes y que no se cuele
nada de la lista privada (privado/vetadas.txt, una expresión por línea) en lo que se publica.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
WEB = RAIZ / "docs"
TIPOS = set(re.search(r"export const TN=\{(.*?)\};", (WEB / "js/calculos.js").read_text(encoding="utf-8")).group(1)
            .replace("'", "").replace(" ", "").split(","))
TIPOS = {t.split(":")[0] for t in TIPOS}
errores = []


def carga(nombre):
    return json.loads((WEB / "datos" / f"{nombre}.json").read_text(encoding="utf-8"))


ruta, rivales, partida = carga("ruta"), carga("rivales"), carga("partida")

ids = [p[0] for f in ruta["fases"] for l in f["lugares"] for p in l["pasos"]]
for repetido in {i for i in ids if ids.count(i) > 1}:
    errores.append(f"paso repetido: {repetido}")
for f in ruta["fases"]:
    for l in f["lugares"]:
        for p in l["pasos"]:
            if p[3] not in ("t", "p", "b"):
                errores.append(f"prueba desconocida en {p[0]}: {p[3]}")

rids = [r["id"] for r in rivales["lista"]]
for repetido in {i for i in rids if rids.count(i) > 1}:
    errores.append(f"rival repetido: {repetido}")
for r in rivales["lista"]:
    for m in r["eq"]:
        if not (WEB / "img/animados" / f"{m[1]}.gif").exists():
            errores.append(f"falta animado {m[1]} ({m[0]})")
        if not (WEB / "img/sprites" / f"{m[1]}.png").exists():
            errores.append(f"falta sprite {m[1]} ({m[0]})")
        for t in m[3]:
            if t not in TIPOS:
                errores.append(f"tipo desconocido en {m[0]}: {t}")
        for mov in m[4] or []:
            if mov[1] not in TIPOS:
                errores.append(f"tipo desconocido en {m[0]} / {mov[0]}: {mov[1]}")

for m in partida["equipo"]:
    if len(m["mov"]) != 4:
        errores.append(f"{m['sp']} no tiene 4 movimientos")
    for mov in m["mov"]:
        if mov[1] not in TIPOS:
            errores.append(f"tipo desconocido en {m['sp']} / {mov[0]}: {mov[1]}")

lista = RAIZ / "privado" / "vetadas.txt"
if lista.exists():
    PRIVADO = re.compile("|".join(x for x in lista.read_text(encoding="utf-8").split("\n") if x), re.I)
    publicos = [p for p in RAIZ.rglob("*") if p.is_file() and ".git" not in p.parts and "privado" not in p.parts
                and p.suffix in {".json", ".js", ".mjs", ".html", ".md", ".py", ".css", ".webmanifest"}]
    for archivo in publicos:
        if PRIVADO.search(archivo.read_text(encoding="utf-8")):
            errores.append(f"dato privado en {archivo.relative_to(RAIZ)}")

if errores:
    print("\n".join("ERROR  " + e for e in errores))
    sys.exit(1)
print(f"Correcto: {len(ids)} pasos, {len(rids)} rivales, {len(partida['equipo'])} en el equipo.")
