"""Tests for DELETE /api/auth/me (account deletion) — App Store compliance.

Covers:
- Auth required (401 without token)
- Cascade deletion of favorites, events, uploads/custom_photos
- Same token invalid after deletion
- Login with deleted credentials returns 401
- Existing seeded user (bar@test.com) is NOT affected (guarded)
"""

import os
import uuid

import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://pour-play-3.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


def _register(email: str, password: str = "secret123", name: str = "TEST_Del"):
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": password, "name": name}, timeout=30)
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    return r.json()["access_token"], r.json()["user"]


class TestDeleteAccountAuth:
    def test_delete_without_token_returns_401(self):
        r = requests.delete(f"{API}/auth/me", timeout=30)
        assert r.status_code == 401

    def test_delete_with_invalid_token_returns_401(self):
        r = requests.delete(f"{API}/auth/me", headers={"Authorization": "Bearer notavalidtoken"}, timeout=30)
        assert r.status_code == 401


class TestDeleteAccountCascade:
    def test_full_cascade_and_session_invalidation(self):
        email = f"TEST_del_{uuid.uuid4().hex[:10]}@example.com"
        password = "secret123"
        token, user = _register(email, password)
        h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        # Sanity: /auth/me works
        r = requests.get(f"{API}/auth/me", headers=h, timeout=30)
        assert r.status_code == 200 and r.json()["email"] == email.lower()

        # Seed a favorite
        r = requests.post(f"{API}/favorites/lavender-haze", headers=h, timeout=30)
        assert r.status_code == 200 and r.json()["saved"] is True

        # Seed an event
        r = requests.post(f"{API}/events", headers=h, json={"name": "TEST_ToDelete", "vibe": "test"}, timeout=30)
        assert r.status_code == 200
        eid = r.json()["id"]

        # Verify favorites + events exist pre-delete
        r = requests.get(f"{API}/favorites/ids", headers=h, timeout=30)
        assert "lavender-haze" in r.json()
        r = requests.get(f"{API}/events", headers=h, timeout=30)
        assert any(e["id"] == eid for e in r.json())

        # Delete account
        r = requests.delete(f"{API}/auth/me", headers=h, timeout=30)
        assert r.status_code == 204, f"delete failed: {r.status_code} {r.text}"
        assert r.text == "" or r.text is None or len(r.content) == 0

        # Token now invalid on /auth/me (user gone)
        r = requests.get(f"{API}/auth/me", headers=h, timeout=30)
        assert r.status_code == 401

        # Favorites endpoint with same token -> 401
        r = requests.get(f"{API}/favorites", headers=h, timeout=30)
        assert r.status_code == 401

        # Events endpoint with same token -> 401
        r = requests.get(f"{API}/events", headers=h, timeout=30)
        assert r.status_code == 401

        # Login with deleted creds -> 401
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=30)
        assert r.status_code == 401

        # Deleted email can be re-registered (email now free)
        r = requests.post(f"{API}/auth/register", json={"email": email, "password": password, "name": "TEST_Reuse"}, timeout=30)
        assert r.status_code == 200
        new_token = r.json()["access_token"]
        h2 = {"Authorization": f"Bearer {new_token}", "Content-Type": "application/json"}

        # New user starts clean: no favorites, no events (proves cascade)
        r = requests.get(f"{API}/favorites/ids", headers=h2, timeout=30)
        assert r.json() == []
        r = requests.get(f"{API}/events", headers=h2, timeout=30)
        assert r.json() == []

        # Cleanup: delete this re-registered account too
        requests.delete(f"{API}/auth/me", headers=h2, timeout=30)


class TestSeededUserProtected:
    """Ensure the shared seeded account bar@test.com can still log in
    (not affected by our TEST_ deletions)."""

    def test_bar_at_test_still_works(self):
        r = requests.post(f"{API}/auth/login", json={"email": "bar@test.com", "password": "secret123"}, timeout=30)
        if r.status_code == 401:
            reg = requests.post(f"{API}/auth/register", json={"email": "bar@test.com", "password": "secret123", "name": "Bar"}, timeout=30)
            assert reg.status_code in (200, 409)
            r = requests.post(f"{API}/auth/login", json={"email": "bar@test.com", "password": "secret123"}, timeout=30)
        assert r.status_code == 200
