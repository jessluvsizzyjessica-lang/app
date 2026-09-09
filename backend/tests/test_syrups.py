"""Tests for Syrup Lab endpoints (Mixery Pro feature - backend surface)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://pour-play-3.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

EXPECTED_KEYS = {"id", "name", "color", "base_yield_oz", "shelf_life", "ingredients", "steps", "tip"}


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


class TestSyrupList:
    def test_list_syrups_count_and_shape(self, client):
        r = client.get(f"{API}/syrups")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 10, f"expected exactly 10 seeded syrups, got {len(data)}"
        for s in data:
            missing = EXPECTED_KEYS - set(s.keys())
            assert not missing, f"syrup {s.get('id')} missing keys: {missing}"
            assert isinstance(s["ingredients"], list) and len(s["ingredients"]) > 0
            assert isinstance(s["steps"], list) and len(s["steps"]) > 0
            assert isinstance(s["base_yield_oz"], (int, float)) and s["base_yield_oz"] > 0

    def test_syrup_ids_include_expected(self, client):
        r = client.get(f"{API}/syrups")
        ids = {s["id"] for s in r.json()}
        for expected in ["demerara", "lavender", "honey-ginger", "hibiscus", "quick-orgeat"]:
            assert expected in ids


class TestSyrupDetail:
    def test_get_syrup_by_id(self, client):
        r = client.get(f"{API}/syrups/demerara")
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == "demerara"
        assert d["name"] == "Demerara Syrup"
        assert d["base_yield_oz"] == 16

    def test_get_syrup_unknown_404(self, client):
        r = client.get(f"{API}/syrups/does-not-exist")
        assert r.status_code == 404


class TestSyrupScale:
    def test_scale_demerara_x3(self, client):
        r = client.post(f"{API}/tools/syrup-scale", json={"syrup_id": "demerara", "multiplier": 3})
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == "demerara"
        assert d["multiplier"] == 3
        assert d["yield_oz"] == 48.0
        # ingredients scaled: 16 oz demerara sugar -> 48 oz; 8 oz water -> 24 oz
        by_name = {row["name"].lower(): row["amount_display"] for row in d["ingredients"]}
        # find keys containing 'demerara' and 'water'
        sugar_key = next((k for k in by_name if "demerara sugar" in k), None)
        water_key = next((k for k in by_name if k.strip() == "water"), None)
        assert sugar_key, f"demerara sugar not found in {by_name}"
        assert water_key, f"water not found in {by_name}"
        assert "48" in by_name[sugar_key], f"expected 48 oz sugar, got {by_name[sugar_key]}"
        assert "24" in by_name[water_key], f"expected 24 oz water, got {by_name[water_key]}"

    def test_scale_default_multiplier_1(self, client):
        r = client.post(f"{API}/tools/syrup-scale", json={"syrup_id": "lavender"})
        assert r.status_code == 200
        d = r.json()
        assert d["multiplier"] == 1
        assert d["yield_oz"] == 12.0

    def test_scale_multiplier_boundary_20(self, client):
        r = client.post(f"{API}/tools/syrup-scale", json={"syrup_id": "demerara", "multiplier": 20})
        assert r.status_code == 200
        assert r.json()["yield_oz"] == 320.0

    def test_scale_multiplier_zero_422(self, client):
        r = client.post(f"{API}/tools/syrup-scale", json={"syrup_id": "demerara", "multiplier": 0})
        assert r.status_code == 422

    def test_scale_multiplier_over_20_422(self, client):
        r = client.post(f"{API}/tools/syrup-scale", json={"syrup_id": "demerara", "multiplier": 21})
        assert r.status_code == 422

    def test_scale_unknown_syrup_404(self, client):
        r = client.post(f"{API}/tools/syrup-scale", json={"syrup_id": "no-such", "multiplier": 2})
        assert r.status_code == 404
