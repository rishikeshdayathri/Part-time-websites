"""Backend API tests for Subterra Nexus.

Covers:
  - GET /api/health
  - POST /api/inquiries (valid + invalid email)
  - GET /api/inquiries (list, sort, no _id leak, pagination)
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://nexus-trade-13.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_health_status(self, client):
        r = client.get(f"{API}/health", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("status") == "healthy"
        assert "smtp_configured" in data
        assert data["smtp_configured"] is False, "SMTP should not be configured per user choice"
        assert "timestamp" in data

    def test_root(self, client):
        r = client.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


# ---------- Inquiries ----------
class TestInquiries:
    def test_create_inquiry_persists(self, client):
        payload = {
            "name": "TEST_Buyer",
            "company": "TEST_Trading Co",
            "email": "TEST_buyer@example.com",
            "phone": "+971501112222",
            "country": "UAE",
            "commodity": "Polypropylene",
            "quantity": "2000 MT",
            "destination": "Jebel Ali",
            "message": "Please share offer for PP homopolymer",
            "source": "automated_test",
        }
        r = client.post(f"{API}/inquiries", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        # Field assertions
        assert data["id"]
        assert isinstance(data["id"], str)
        assert len(data["id"]) >= 16
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["commodity"] == payload["commodity"]
        assert data["source"] == "automated_test"
        assert data["email_sent"] is False  # SMTP not configured
        assert "created_at" in data
        # _id must NOT be leaked
        assert "_id" not in data

        # GET to verify persisted
        time.sleep(0.5)
        list_r = client.get(f"{API}/inquiries?limit=50", timeout=15)
        assert list_r.status_code == 200
        items = list_r.json()
        assert isinstance(items, list)
        ids = [i.get("id") for i in items]
        assert data["id"] in ids, "Created inquiry should appear in list"

    def test_create_inquiry_invalid_email(self, client):
        payload = {
            "name": "TEST_BadEmail",
            "email": "not-an-email",
        }
        r = client.post(f"{API}/inquiries", json=payload, timeout=15)
        assert r.status_code == 422, f"Expected 422 for invalid email, got {r.status_code}: {r.text}"

    def test_create_inquiry_minimal_fields(self, client):
        # Only name + email are required
        payload = {"name": "TEST_Minimal", "email": "TEST_min@example.com"}
        r = client.post(f"{API}/inquiries", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["name"] == "TEST_Minimal"
        assert data["company"] == ""
        assert data["source"] == "contact_page"  # default
        assert data["email_sent"] is False

    def test_create_inquiry_missing_name(self, client):
        r = client.post(f"{API}/inquiries", json={"email": "TEST_noname@example.com"}, timeout=15)
        assert r.status_code == 422

    def test_list_inquiries_no_id_leak_and_sorted(self, client):
        # Ensure at least 2 inquiries exist
        for i in range(2):
            client.post(f"{API}/inquiries", json={
                "name": f"TEST_Sort_{i}",
                "email": f"TEST_sort_{i}_{int(time.time()*1000)}@example.com",
                "commodity": "Soybean",
                "source": "automated_test",
            }, timeout=15)
            time.sleep(0.05)

        r = client.get(f"{API}/inquiries?limit=100", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 2
        # No _id leak
        for it in items:
            assert "_id" not in it
            assert "id" in it
            assert "created_at" in it
        # Sorted desc by created_at
        timestamps = [it["created_at"] for it in items]
        assert timestamps == sorted(timestamps, reverse=True), "Inquiries should be most-recent first"

    def test_list_pagination_limit(self, client):
        r = client.get(f"{API}/inquiries?limit=1", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) <= 1
