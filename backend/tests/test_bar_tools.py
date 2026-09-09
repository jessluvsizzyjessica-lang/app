"""Backend tests for The Mobile Mixery bar tools (public endpoints).

Covers POST /api/tools/shopping-list and POST /api/tools/batch —
math correctness, aggregation across recipes, validation & 404 handling."""

import os
import pytest
import requests

BASE_URL = os.environ.get(
    "EXPO_PUBLIC_BACKEND_URL", "https://pour-play-3.preview.emergentagent.com"
).rstrip("/")
API = f"{BASE_URL}/api"

OZ_PER_BOTTLE_750 = 25.36


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Shopping List ----------
class TestShoppingList:
    def test_three_recipes_50_guests_3_per(self, client):
        body = {
            "guests": 50,
            "drinks_per_guest": 3,
            "recipe_ids": ["garden-mojito", "citrus-paloma", "berry-basil-smash"],
        }
        r = client.post(f"{API}/tools/shopping-list", json=body)
        assert r.status_code == 200, r.text
        d = r.json()

        # totals + per-recipe split (150 / 3 = 50 each)
        assert d["total_drinks"] == 150
        assert d["guests"] == 50
        assert d["drinks_per_guest"] == 3
        assert len(d["per_recipe"]) == 3
        assert sum(p["servings"] for p in d["per_recipe"]) == 150
        for p in d["per_recipe"]:
            assert p["servings"] == 50

        # shopping[] items exist and follow expected shape
        assert isinstance(d["shopping"], list) and len(d["shopping"]) > 0
        for it in d["shopping"]:
            assert set(["name", "total_oz", "amount_display", "bottles_display"]).issubset(it)
            assert it["total_oz"] > 0

        # sanity: white rum should be ~2oz * 50 servings = 100oz -> 4 bottles
        rum = next((x for x in d["shopping"] if "white rum" in x["name"].lower()), None)
        assert rum is not None, f"white rum missing from shopping list: {[s['name'] for s in d['shopping']]}"
        assert abs(rum["total_oz"] - 100.0) < 0.5
        assert "4" in rum["bottles_display"]

        # blanco tequila from paloma: 2oz*50 = 100oz -> ~4 bottles
        tequila = next((x for x in d["shopping"] if "tequila" in x["name"].lower()), None)
        assert tequila is not None
        assert abs(tequila["total_oz"] - 100.0) < 0.5

        # counts & extras exist as lists
        assert isinstance(d["counts"], list)
        assert isinstance(d["extras"], list)

    def test_total_drinks_rounding(self, client):
        # 33 guests * 2.5 = 82.5 -> round -> 82 (banker's rounding in Python)
        body = {"guests": 33, "drinks_per_guest": 2.5, "recipe_ids": ["citrus-paloma"]}
        r = client.post(f"{API}/tools/shopping-list", json=body)
        assert r.status_code == 200
        d = r.json()
        # round(82.5) in python is 82 (banker's) — accept either 82 or 83
        assert d["total_drinks"] in (82, 83)
        assert d["per_recipe"][0]["servings"] == d["total_drinks"]

    def test_uneven_split_remainder_distributed(self, client):
        # 10 total drinks across 3 recipes -> 4,3,3
        body = {"guests": 5, "drinks_per_guest": 2, "recipe_ids": ["garden-mojito", "citrus-paloma", "berry-basil-smash"]}
        r = client.post(f"{API}/tools/shopping-list", json=body)
        assert r.status_code == 200
        d = r.json()
        assert d["total_drinks"] == 10
        servings = sorted([p["servings"] for p in d["per_recipe"]], reverse=True)
        assert servings == [4, 3, 3]

    def test_validation_min_guests(self, client):
        r = client.post(f"{API}/tools/shopping-list", json={"guests": 0, "drinks_per_guest": 2, "recipe_ids": ["citrus-paloma"]})
        assert r.status_code == 422

    def test_validation_drinks_per_guest_range(self, client):
        r = client.post(f"{API}/tools/shopping-list", json={"guests": 10, "drinks_per_guest": 0.2, "recipe_ids": ["citrus-paloma"]})
        assert r.status_code == 422
        r = client.post(f"{API}/tools/shopping-list", json={"guests": 10, "drinks_per_guest": 25, "recipe_ids": ["citrus-paloma"]})
        assert r.status_code == 422

    def test_validation_empty_recipe_ids(self, client):
        r = client.post(f"{API}/tools/shopping-list", json={"guests": 10, "drinks_per_guest": 2, "recipe_ids": []})
        assert r.status_code == 422

    def test_404_no_matching_recipes(self, client):
        r = client.post(f"{API}/tools/shopping-list", json={"guests": 10, "drinks_per_guest": 2, "recipe_ids": ["fake-drink-xyz"]})
        assert r.status_code == 404


# ---------- Batch ----------
class TestBatch:
    def test_citrus_paloma_63(self, client):
        r = client.post(f"{API}/tools/batch", json={"recipe_id": "citrus-paloma", "servings": 63})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["servings"] == 63
        assert d["pours"] == 63
        assert isinstance(d["ingredients"], list) and len(d["ingredients"]) > 0

        # tequila 2oz per serving * 63 = 126oz
        tequila = next((x for x in d["ingredients"] if "tequila" in x["name"].lower()), None)
        assert tequila is not None, f"tequila not found in ingredients: {[i['name'] for i in d['ingredients']]}"
        assert abs(tequila["total_oz"] - 126.0) < 0.5
        assert tequila["kind"] == "oz"
        assert tequila["bottles_display"], "bottles_display should be non-empty for oz row"

        # dilution ≈ 25% of concentrate — expected ~70.9 oz per spec
        assert abs(d["dilution_oz"] - 70.9) < 1.0, f"dilution_oz={d['dilution_oz']}"
        # dilution should equal round(concentrate*0.25, 1)
        assert abs(d["dilution_oz"] - round(d["concentrate_oz"] * 0.25, 1)) < 0.05
        # batch volume = concentrate + dilution
        assert abs(d["batch_volume_oz"] - (d["concentrate_oz"] + d["dilution_oz"])) < 0.2
        assert d["gallons"] > 0
        assert d["container"], "container suggestion required"
        assert isinstance(d["notes"], list) and len(d["notes"]) >= 2

    def test_batch_small_1_gallon_container(self, client):
        # small servings -> container suggests 1-gallon
        r = client.post(f"{API}/tools/batch", json={"recipe_id": "citrus-paloma", "servings": 10})
        assert r.status_code == 200
        d = r.json()
        assert "1-gallon" in d["container"] or "1 × 1-gallon" in d["container"]

    def test_batch_large_multi_dispenser(self, client):
        # 500 servings * 4oz-ish -> over 3 gal
        r = client.post(f"{API}/tools/batch", json={"recipe_id": "citrus-paloma", "servings": 500})
        assert r.status_code == 200
        d = r.json()
        assert d["gallons"] > 3
        assert "3-gallon" in d["container"]

    def test_404_unknown_recipe(self, client):
        r = client.post(f"{API}/tools/batch", json={"recipe_id": "does-not-exist", "servings": 21})
        assert r.status_code == 404

    def test_validation_servings_min(self, client):
        r = client.post(f"{API}/tools/batch", json={"recipe_id": "citrus-paloma", "servings": 0})
        assert r.status_code == 422

    def test_validation_servings_max(self, client):
        r = client.post(f"{API}/tools/batch", json={"recipe_id": "citrus-paloma", "servings": 5000})
        assert r.status_code == 422
