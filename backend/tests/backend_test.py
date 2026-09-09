"""Backend tests for The Mobile Mixery API.

Covers: recipes/garnishes/categories (public), auth (register/login/me),
favorites, events + items, AI menu generation, upload/download."""

import io
import os
import time
import uuid

import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://pour-play-3.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

TEST_EMAIL = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "secret123"
TEST_NAME = "TEST_User"

_state: dict = {}


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_headers(client):
    """Register a fresh user and return authorization headers."""
    r = client.post(f"{API}/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": TEST_NAME})
    if r.status_code == 409:
        r = client.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    assert r.status_code == 200, f"register/login failed: {r.status_code} {r.text}"
    token = r.json()["access_token"]
    _state["token"] = token
    _state["user"] = r.json()["user"]
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Public: recipes / garnishes / categories ----------
class TestPublic:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        assert "message" in r.json()

    def test_recipes_list(self, client):
        r = client.get(f"{API}/recipes")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 12, f"expected >=12 seeded recipes, got {len(data)}"
        rec = data[0]
        for k in ["id", "name", "category", "ingredients", "steps", "garnish"]:
            assert k in rec, f"recipe missing {k}"
        _state["recipe_id"] = "lavender-haze"

    def test_recipe_detail(self, client):
        r = client.get(f"{API}/recipes/lavender-haze")
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == "lavender-haze"
        assert "custom_photos" in data

    def test_recipe_not_found(self, client):
        r = client.get(f"{API}/recipes/does-not-exist")
        assert r.status_code == 404

    def test_recipes_filter_category(self, client):
        r = client.get(f"{API}/recipes", params={"category": "Mocktails"})
        assert r.status_code == 200
        for d in r.json():
            assert d["category"] == "Mocktails"

    def test_recipes_search(self, client):
        r = client.get(f"{API}/recipes", params={"q": "mojito"})
        assert r.status_code == 200
        assert any("mojito" in d["name"].lower() for d in r.json())

    def test_categories(self, client):
        r = client.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        assert cats[0] == "All"
        assert "Cocktails" in cats

    def test_garnishes(self, client):
        r = client.get(f"{API}/garnishes")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) >= 6
        assert {"id", "title", "image_url", "tip"}.issubset(data[0].keys())

    def test_company(self, client):
        r = client.get(f"{API}/company")
        assert r.status_code == 200
        assert "themobilemixeryca" in r.json()["website"]


# ---------- Auth ----------
class TestAuth:
    def test_register_and_me(self, client, auth_headers):
        r = client.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == TEST_EMAIL.lower()

    def test_duplicate_register(self, client, auth_headers):
        r = client.post(f"{API}/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        assert r.status_code == 409

    def test_login_wrong_password(self, client, auth_headers):
        r = client.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": "wrongwrong"})
        assert r.status_code == 401

    def test_login_success(self, client, auth_headers):
        r = client.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_me_requires_auth(self, client):
        r = client.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_seeded_user(self, client):
        """Test the known credentials from /app/memory/test_credentials.md."""
        # Try login; if user does not exist, register first (idempotent for test suite).
        r = client.post(f"{API}/auth/login", json={"email": "bar@test.com", "password": "secret123"})
        if r.status_code == 401:
            reg = client.post(f"{API}/auth/register", json={"email": "bar@test.com", "password": "secret123", "name": "Bar"})
            assert reg.status_code in (200, 409)
            r = client.post(f"{API}/auth/login", json={"email": "bar@test.com", "password": "secret123"})
        assert r.status_code == 200, f"bar@test.com login failed: {r.text}"


# ---------- Favorites ----------
class TestFavorites:
    def test_favorites_flow(self, client, auth_headers):
        rid = "lavender-haze"
        # add
        r = client.post(f"{API}/favorites/{rid}", headers=auth_headers)
        assert r.status_code == 200 and r.json()["saved"] is True

        # ids
        r = client.get(f"{API}/favorites/ids", headers=auth_headers)
        assert r.status_code == 200 and rid in r.json()

        # list
        r = client.get(f"{API}/favorites", headers=auth_headers)
        assert r.status_code == 200
        assert any(d["id"] == rid for d in r.json())

        # duplicate add (idempotent upsert)
        r = client.post(f"{API}/favorites/{rid}", headers=auth_headers)
        assert r.status_code == 200

        # remove
        r = client.delete(f"{API}/favorites/{rid}", headers=auth_headers)
        assert r.status_code == 200 and r.json()["saved"] is False

        # verify removed
        r = client.get(f"{API}/favorites/ids", headers=auth_headers)
        assert rid not in r.json()

    def test_favorites_requires_auth(self, client):
        r = client.get(f"{API}/favorites")
        assert r.status_code == 401


# ---------- Events + Items ----------
class TestEvents:
    def test_event_crud(self, client, auth_headers):
        # create
        payload = {"name": "TEST_Wedding", "vibe": "elegant", "guest_count": 40, "notes": "TEST"}
        r = client.post(f"{API}/events", headers=auth_headers, json=payload)
        assert r.status_code == 200
        ev = r.json()
        assert ev["name"] == "TEST_Wedding" and ev["items"] == []
        eid = ev["id"]
        _state["event_id"] = eid

        # list
        r = client.get(f"{API}/events", headers=auth_headers)
        assert r.status_code == 200
        assert any(e["id"] == eid for e in r.json())

        # get one
        r = client.get(f"{API}/events/{eid}", headers=auth_headers)
        assert r.status_code == 200

        # update
        r = client.put(f"{API}/events/{eid}", headers=auth_headers, json={"vibe": "romantic"})
        assert r.status_code == 200 and r.json()["vibe"] == "romantic"

        # add item
        item = {"recipe_id": "french-75", "name": "French 75", "category": "Cocktails", "garnish": "Lemon twist"}
        r = client.post(f"{API}/events/{eid}/items", headers=auth_headers, json=item)
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) == 1 and items[0]["name"] == "French 75"
        item_id = items[0]["item_id"]

        # remove item
        r = client.delete(f"{API}/events/{eid}/items/{item_id}", headers=auth_headers)
        assert r.status_code == 200 and r.json()["items"] == []

        # delete event
        r = client.delete(f"{API}/events/{eid}", headers=auth_headers)
        assert r.status_code == 200 and r.json()["deleted"] is True

        # verify soft-deleted -> 404
        r = client.get(f"{API}/events/{eid}", headers=auth_headers)
        assert r.status_code == 404

    def test_events_requires_auth(self, client):
        r = client.get(f"{API}/events")
        assert r.status_code == 401


# ---------- AI Menu Generation ----------
class TestAI:
    def test_generate_menu(self, client):
        r = client.post(
            f"{API}/ai/generate-menu",
            json={
                "event_description": "A summer garden wedding for 60 guests, elegant and floral",
                "guest_count": 60,
                "vibe": "elegant",
            },
            timeout=120,
        )
        assert r.status_code == 200, f"AI failed: {r.status_code} {r.text[:400]}"
        data = r.json()
        assert "menu_title" in data
        assert "summary" in data
        assert isinstance(data.get("drinks"), list) and len(data["drinks"]) >= 3
        d0 = data["drinks"][0]
        for k in ["name", "type", "ingredients", "garnish"]:
            assert k in d0, f"AI drink missing {k}"

    def test_ai_validation(self, client):
        r = client.post(f"{API}/ai/generate-menu", json={"event_description": "a"})
        assert r.status_code == 422  # pydantic min_length


# ---------- Uploads ----------
class TestUpload:
    def test_upload_requires_auth(self, client):
        r = requests.post(f"{API}/upload", files={"file": ("t.jpg", b"x", "image/jpeg")})
        assert r.status_code == 401

    def test_upload_and_fetch(self, client, auth_headers):
        # tiny valid-ish JPEG bytes
        jpg_bytes = bytes.fromhex(
            "FFD8FFE000104A46494600010100000100010000FFDB0043000806060706050806070707"
            "090908"
        ) + b"\x00" * 32 + b"\xFF\xD9"
        token = _state["token"]
        r = requests.post(
            f"{API}/upload",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("test.jpg", jpg_bytes, "image/jpeg")},
            data={"recipe_id": "lavender-haze"},
            timeout=60,
        )
        if r.status_code == 502:
            pytest.skip(f"object storage unavailable in preview env: {r.text[:200]}")
        assert r.status_code == 200, f"upload failed: {r.status_code} {r.text[:300]}"
        rec = r.json()
        assert rec["url"].startswith("/api/files/")

        # fetch back
        get_url = f"{BASE_URL}{rec['url']}"
        # allow slight delay
        time.sleep(1)
        r2 = requests.get(get_url, timeout=60)
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/")

        # verify custom_photos on recipe
        r3 = client.get(f"{API}/recipes/lavender-haze")
        assert r3.status_code == 200
        assert any(rec["url"] in p for p in r3.json().get("custom_photos", []))
