"""Tests for the city infrastructure asset management API."""
import json
import pytest

from app import create_app


@pytest.fixture
def client(tmp_path):
    """Create a test client backed by a fresh in-memory SQLite database."""
    db_path = str(tmp_path / "test.db")
    app = create_app(database_url=db_path)
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def post_asset(client, **kwargs):
    payload = {
        "name": "Main Street",
        "type": "road",
        "city": "Springfield",
        "status": "active",
        "location": "Downtown",
        "description": "Primary arterial road",
    }
    payload.update(kwargs)
    return client.post(
        "/assets",
        data=json.dumps(payload),
        content_type="application/json",
    )


# ---------------------------------------------------------------------------
# Create (POST /assets)
# ---------------------------------------------------------------------------

def test_create_asset_success(client):
    resp = post_asset(client)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["name"] == "Main Street"
    assert data["type"] == "road"
    assert data["city"] == "Springfield"
    assert data["status"] == "active"
    assert data["id"] is not None


def test_create_asset_default_status(client):
    resp = client.post(
        "/assets",
        data=json.dumps({"name": "Water Plant", "type": "utility", "city": "Shelbyville"}),
        content_type="application/json",
    )
    assert resp.status_code == 201
    assert resp.get_json()["status"] == "active"


def test_create_asset_missing_required_fields(client):
    resp = client.post(
        "/assets",
        data=json.dumps({"name": "Incomplete"}),
        content_type="application/json",
    )
    assert resp.status_code == 400
    assert "errors" in resp.get_json()


def test_create_asset_invalid_type(client):
    resp = post_asset(client, type="bridge")
    assert resp.status_code == 400
    body = resp.get_json()
    assert any("type" in e for e in body["errors"])


def test_create_asset_invalid_status(client):
    resp = post_asset(client, status="broken")
    assert resp.status_code == 400
    body = resp.get_json()
    assert any("status" in e for e in body["errors"])


# ---------------------------------------------------------------------------
# List (GET /assets)
# ---------------------------------------------------------------------------

def test_list_assets_empty(client):
    resp = client.get("/assets")
    assert resp.status_code == 200
    assert resp.get_json() == []


def test_list_assets_returns_created(client):
    post_asset(client)
    resp = client.get("/assets")
    assert resp.status_code == 200
    assert len(resp.get_json()) == 1


def test_list_assets_filter_by_city(client):
    post_asset(client, city="Springfield")
    post_asset(client, name="Oak Ave", city="Shelbyville")
    resp = client.get("/assets?city=Springfield")
    assert resp.status_code == 200
    results = resp.get_json()
    assert len(results) == 1
    assert results[0]["city"] == "Springfield"


def test_list_assets_filter_by_type(client):
    post_asset(client, type="road")
    post_asset(client, name="Power Grid", type="utility")
    resp = client.get("/assets?type=utility")
    assert resp.status_code == 200
    results = resp.get_json()
    assert len(results) == 1
    assert results[0]["type"] == "utility"


def test_list_assets_filter_by_status(client):
    post_asset(client, status="active")
    post_asset(client, name="Bridge Repair", status="under_maintenance")
    resp = client.get("/assets?status=under_maintenance")
    assert resp.status_code == 200
    results = resp.get_json()
    assert len(results) == 1
    assert results[0]["status"] == "under_maintenance"


# ---------------------------------------------------------------------------
# Retrieve (GET /assets/<id>)
# ---------------------------------------------------------------------------

def test_get_asset_success(client):
    created = post_asset(client).get_json()
    resp = client.get(f"/assets/{created['id']}")
    assert resp.status_code == 200
    assert resp.get_json()["id"] == created["id"]


def test_get_asset_not_found(client):
    resp = client.get("/assets/9999")
    assert resp.status_code == 404
    assert "error" in resp.get_json()


# ---------------------------------------------------------------------------
# Update (PUT /assets/<id>)
# ---------------------------------------------------------------------------

def test_update_asset_success(client):
    created = post_asset(client).get_json()
    resp = client.put(
        f"/assets/{created['id']}",
        data=json.dumps({"status": "under_maintenance", "description": "Resurfacing"}),
        content_type="application/json",
    )
    assert resp.status_code == 200
    updated = resp.get_json()
    assert updated["status"] == "under_maintenance"
    assert updated["description"] == "Resurfacing"
    assert updated["name"] == created["name"]


def test_update_asset_not_found(client):
    resp = client.put(
        "/assets/9999",
        data=json.dumps({"status": "inactive"}),
        content_type="application/json",
    )
    assert resp.status_code == 404


def test_update_asset_invalid_status(client):
    created = post_asset(client).get_json()
    resp = client.put(
        f"/assets/{created['id']}",
        data=json.dumps({"status": "demolished"}),
        content_type="application/json",
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# Delete (DELETE /assets/<id>)
# ---------------------------------------------------------------------------

def test_delete_asset_success(client):
    created = post_asset(client).get_json()
    resp = client.delete(f"/assets/{created['id']}")
    assert resp.status_code == 200
    assert "deleted" in resp.get_json()["message"]

    resp2 = client.get(f"/assets/{created['id']}")
    assert resp2.status_code == 404


def test_delete_asset_not_found(client):
    resp = client.delete("/assets/9999")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Overview (GET /overview)
# ---------------------------------------------------------------------------

def test_overview_empty(client):
    resp = client.get("/overview")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["total_assets"] == 0
    assert data["by_status"] == {}
    assert data["by_type"] == {}


def test_overview_totals(client):
    post_asset(client, type="road", status="active", city="Springfield")
    post_asset(client, type="utility", status="active", city="Springfield")
    post_asset(client, type="road", status="under_maintenance", city="Springfield")

    resp = client.get("/overview")
    assert resp.status_code == 200
    data = resp.get_json()

    assert data["total_assets"] == 3
    assert data["by_status"]["active"] == 2
    assert data["by_status"]["under_maintenance"] == 1
    assert data["by_type"]["road"]["active"] == 1
    assert data["by_type"]["road"]["under_maintenance"] == 1
    assert data["by_type"]["utility"]["active"] == 1


def test_overview_filtered_by_city(client):
    post_asset(client, city="Springfield", type="road", status="active")
    post_asset(client, city="Shelbyville", type="utility", status="active")

    resp = client.get("/overview?city=Springfield")
    assert resp.status_code == 200
    data = resp.get_json()

    assert data["city"] == "Springfield"
    assert data["total_assets"] == 1
    assert data["by_type"]["road"]["active"] == 1
    assert "utility" not in data["by_type"]
