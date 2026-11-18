#!/usr/bin/env python3
"""Calcula los macros de cada tarjeta, valida que cumplan el objetivo de su
momento y genera docs/tarjetas.md (y data/tarjetas.json con --json).

Uso:  python3 scripts/calcular.py [--json]
Sale con código 1 si alguna tarjeta queda fuera de tolerancia.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ING = {i["id"]: i for i in json.loads((ROOT / "data/ingredientes.json").read_text())["ingredientes"]}
OBJ = json.loads((ROOT / "data/objetivos.json").read_text())
RECETAS = json.loads((ROOT / "data/recetas.json").read_text())["tarjetas"]
MOMENTOS = ["desayuno", "almuerzo", "merienda", "cena"]
CAMPOS = ["kcal", "prot", "carb", "grasa", "fibra"]


def totales(receta):
    t = dict.fromkeys(CAMPOS, 0.0)
    for e in receta["ingredientes"]:
        d = ING[e["id"]]
        for c in CAMPOS:
            t[c] += d[c] * e["g"] / 100
    return {c: round(v, 1) if c != "kcal" else round(v) for c, v in t.items()}


def fuera_de_tolerancia(tot, obj):
    tol = OBJ["tolerancia"]
    errores = []
    if abs(tot["kcal"] - obj["kcal"]) > obj["kcal"] * tol["kcal_pct"] / 100:
        errores.append(f"kcal {tot['kcal']} (obj {obj['kcal']})")
    for c in ("prot", "carb", "grasa"):
        if abs(tot[c] - obj[c]) > tol["macro_g"]:
            errores.append(f"{c} {tot[c]} (obj {obj[c]})")
    return errores


FRACC = {0.25: "¼", 0.5: "½", 0.75: "¾"}


def unidad_casera(ing_id, g):
    """Texto de la unidad casera ("2 rebanadas"), o "" si no aplica: múltiplos de ¼, plural si es > 1."""
    u = ING[ing_id].get("unidad")
    if not u:
        return ""
    n = g / u["g"]
    entero, resto = int(n), round(n - int(n), 2)
    if resto not in (0, 0.25, 0.5, 0.75) or n < 0.25:
        return ""
    txt = (str(entero) if entero else "") + FRACC.get(resto, "")
    nombre = u.get("plural", u["nombre"]) if n > 1 else u["nombre"]
    return f"{txt} {nombre}"


def ingrediente(e):
    """Ingrediente de una Tarjeta para tarjetas.json; `unidad_casera` solo si aplica."""
    out = {**e, "nombre": ING[e["id"]]["nombre"], "categoria": ING[e["id"]]["categoria"]}
    u = unidad_casera(e["id"], e["g"])
    if u:
        out["unidad_casera"] = u
    return out


def main():
    tarjetas, fallos = [], []
    for r in RECETAS:
        tot = totales(r)
        err = fuera_de_tolerancia(tot, OBJ["momentos"][r["momento"]])
        if err:
            fallos.append(f"{r['id']}: " + ", ".join(err))
        tarjetas.append({**r, "ingredientes": [ingrediente(e) for e in r["ingredientes"]], "nutricion": tot})

    md = ["# Tarjetas de comidas", "",
          "> Generado por `scripts/calcular.py` a partir de `data/recetas.json` e `data/ingredientes.json`. No editar a mano.", "",
          "Elige **una tarjeta de cada momento**: cualquier combinación suma ≈ 1.900 kcal · 180 g P · 175 g C · 56 g G.", "",
          "Pesos: carne y pescado en crudo · arroz y legumbres cocidos · pasta y avena en seco · latas escurridas. "
          "Libres: café solo, infusiones, especias, vinagre, limón, mostaza, edulcorante y un chorrito de salsa de soja.", ""]
    md += ["| Momento | Objetivo | Rango real de las 7 tarjetas |", "|---|---|---|"]
    for m in MOMENTOS:
        o = OBJ["momentos"][m]
        ts = [t["nutricion"] for t in tarjetas if t["momento"] == m]
        rng = lambda c: f"{min(t[c] for t in ts):g}–{max(t[c] for t in ts):g}"
        md.append(f"| {m.capitalize()} | {o['kcal']} kcal · P {o['prot']} · C {o['carb']} · G {o['grasa']} | "
                  f"{rng('kcal')} kcal · P {rng('prot')} · C {rng('carb')} · G {rng('grasa')} · fibra {rng('fibra')} g |")
    for m in MOMENTOS:
        o = OBJ["momentos"][m]
        md += ["", f"## {m.capitalize()} — {o['kcal']} kcal", ""]
        for t in (t for t in tarjetas if t["momento"] == m):
            n = t["nutricion"]
            md += [f"### {t['nombre']}", f"`{t['id']}` · {t['tipo']}", ""]
            md += [f"- {e['g']:g} g {e['nombre'].lower()}" + (f" ({e['unidad_casera']})" if "unidad_casera" in e else "")
                   for e in t["ingredientes"]]
            md += ["", f"**{n['kcal']} kcal** · P {n['prot']} g · C {n['carb']} g · G {n['grasa']} g · fibra {n['fibra']} g", "",
                   f"_{t['preparacion']}_", ""]
    (ROOT / "docs/tarjetas.md").write_text("\n".join(md).rstrip() + "\n")

    if "--json" in sys.argv:
        (ROOT / "data/tarjetas.json").write_text(json.dumps(
            {"objetivos": OBJ, "tarjetas": tarjetas}, ensure_ascii=False, indent=2) + "\n")

    if fallos:
        print("Fuera de tolerancia:\n  " + "\n  ".join(fallos))
        sys.exit(1)
    print(f"OK: {len(tarjetas)} tarjetas dentro de tolerancia → docs/tarjetas.md")


if __name__ == "__main__":
    main()
