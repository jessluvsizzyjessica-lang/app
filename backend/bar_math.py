"""Bartender math: parse recipe ingredients, scale servings, build shopping
lists and batch (large-format) instructions. Deterministic, no AI.

A recipe's ingredient list represents ONE serving. Amounts are parsed from the
leading number of each ingredient string (e.g. "2 oz gin" -> 2 oz of gin)."""

import re
import math
from typing import List, Optional

OZ_PER_BOTTLE_750 = 25.36  # 750ml in fluid ounces
OZ_PER_GALLON = 128.0
OZ_PER_CUP = 8.0
POURS_PER_GALLON = 21  # dispenser math from the Batch Bar Bible (≈6 oz serving)

UNIT_OZ = {"oz", "ounce", "ounces"}
COUNT_UNITS = {
    "dash", "dashes", "leaf", "leaves", "slice", "slices", "wedge", "wedges",
    "sprig", "sprigs", "piece", "pieces", "cube", "cubes",
}

_num_re = re.compile(r"^\s*(\d+(?:\.\d+)?|\d+/\d+|\.\d+)\s*(.*)$")


def _to_float(token: str) -> float:
    if "/" in token:
        a, b = token.split("/", 1)
        try:
            return float(a) / float(b)
        except Exception:
            return 0.0
    try:
        return float(token)
    except Exception:
        return 0.0


def parse_ingredient(text: str) -> dict:
    """Return {name, amount, unit, kind} where kind is 'oz' | 'count' | 'to_taste'."""
    m = _num_re.match(text)
    if not m:
        return {"name": text.strip(), "amount": None, "unit": None, "kind": "to_taste", "raw": text}

    amount = _to_float(m.group(1))
    rest = m.group(2).strip()
    parts = rest.split(None, 1)
    unit = None
    name = rest

    if parts:
        first = parts[0].lower().rstrip(".")
        if first in UNIT_OZ:
            unit = "oz"
            name = parts[1] if len(parts) > 1 else rest
        elif first in COUNT_UNITS:
            unit = first
            name = parts[1] if len(parts) > 1 else rest
        else:
            unit = "count"
            name = rest

    kind = "oz" if unit == "oz" else "count"
    return {"name": name.strip(), "amount": amount, "unit": unit, "kind": kind, "raw": text}


def _bottles_display(total_oz: float) -> str:
    bottles = total_oz / OZ_PER_BOTTLE_750
    if bottles < 1:
        return f"{math.ceil(total_oz / OZ_PER_CUP)} cup(s) / under 1 bottle"
    return f"≈ {math.ceil(bottles)} × 750ml bottle(s)"


def _oz_display(total_oz: float) -> str:
    if total_oz >= OZ_PER_GALLON:
        return f"{round(total_oz, 1)} oz ({round(total_oz / OZ_PER_GALLON, 2)} gal)"
    if total_oz >= OZ_PER_CUP:
        return f"{round(total_oz, 1)} oz ({round(total_oz / OZ_PER_CUP, 1)} cups)"
    return f"{round(total_oz, 1)} oz"


def compute_shopping_list(recipes_with_servings: List[dict]) -> dict:
    """recipes_with_servings: [{name, servings, ingredients:[str]}]"""
    oz_agg: dict = {}
    count_agg: dict = {}
    to_taste: dict = {}

    for r in recipes_with_servings:
        servings = max(0, int(r.get("servings", 0)))
        for raw in r.get("ingredients", []):
            p = parse_ingredient(raw)
            key = p["name"].lower()
            if p["kind"] == "oz" and p["amount"]:
                oz_agg[key] = oz_agg.get(key, {"name": p["name"], "total_oz": 0.0})
                oz_agg[key]["total_oz"] += p["amount"] * servings
            elif p["kind"] == "count" and p["amount"]:
                ck = (key, p["unit"])
                count_agg[ck] = count_agg.get(ck, {"name": p["name"], "unit": p["unit"], "total": 0.0})
                count_agg[ck]["total"] += p["amount"] * servings
            else:
                to_taste[key] = p["name"]

    shopping = []
    for v in sorted(oz_agg.values(), key=lambda x: -x["total_oz"]):
        shopping.append({
            "name": v["name"],
            "total_oz": round(v["total_oz"], 1),
            "amount_display": _oz_display(v["total_oz"]),
            "bottles_display": _bottles_display(v["total_oz"]),
        })

    counts = []
    for v in sorted(count_agg.values(), key=lambda x: -x["total"]):
        unit = v["unit"] if v["unit"] != "count" else ""
        counts.append({
            "name": v["name"],
            "amount_display": f"{int(round(v['total']))}{(' ' + unit) if unit else ''}".strip(),
        })

    extras = sorted(to_taste.values())
    return {"shopping": shopping, "counts": counts, "extras": extras}


def compute_batch(name: str, glass: Optional[str], ingredients: List[str], servings: int) -> dict:
    servings = max(1, int(servings))
    rows = []
    concentrate_oz = 0.0

    for raw in ingredients:
        p = parse_ingredient(raw)
        if p["kind"] == "oz" and p["amount"]:
            total = p["amount"] * servings
            concentrate_oz += total
            rows.append({
                "name": p["name"],
                "per_serving": f"{round(p['amount'], 2)} oz",
                "total_oz": round(total, 1),
                "amount_display": _oz_display(total),
                "bottles_display": _bottles_display(total),
                "kind": "oz",
            })
        elif p["kind"] == "count" and p["amount"]:
            total = p["amount"] * servings
            unit = p["unit"] if p["unit"] != "count" else ""
            rows.append({
                "name": p["name"],
                "per_serving": f"{int(p['amount'])}{(' ' + unit) if unit else ''}".strip(),
                "total_oz": 0,
                "amount_display": f"{int(round(total))}{(' ' + unit) if unit else ''}".strip(),
                "bottles_display": "",
                "kind": "count",
            })
        else:
            rows.append({
                "name": p["name"],
                "per_serving": "to taste",
                "total_oz": 0,
                "amount_display": "Top / to taste",
                "bottles_display": "",
                "kind": "to_taste",
            })

    dilution_oz = round(concentrate_oz * 0.25, 1)  # 25% dilution rule
    batch_volume = concentrate_oz + dilution_oz
    gallons = round(batch_volume / OZ_PER_GALLON, 2)

    if batch_volume <= OZ_PER_GALLON:
        container = "1 × 1-gallon dispenser or Cambro"
    elif batch_volume <= 3 * OZ_PER_GALLON:
        container = "1 × 3-gallon dispenser / Cambro"
    else:
        container = f"{math.ceil(gallons / 3)} × 3-gallon dispensers"

    notes = [
        "Batch everything EXCEPT sparkling/soda and citrus you can't refrigerate; add those à la minute.",
        f"Add ~{dilution_oz} oz water for dilution (25% rule) — or let melting ice do it if serving on the rocks.",
        "Chill the batch fully before service and keep on ice.",
    ]

    return {
        "name": name,
        "glass": glass,
        "servings": servings,
        "ingredients": rows,
        "concentrate_oz": round(concentrate_oz, 1),
        "dilution_oz": dilution_oz,
        "batch_volume_oz": round(batch_volume, 1),
        "batch_volume_display": _oz_display(batch_volume),
        "gallons": gallons,
        "pours": servings,
        "container": container,
        "notes": notes,
    }
