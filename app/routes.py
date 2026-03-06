from flask import Blueprint, jsonify, request

from .database import get_db
from .models import asset_to_dict, validate_asset_fields

bp = Blueprint("assets", __name__)


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _not_found(asset_id):
    return jsonify({"error": f"Asset {asset_id} not found."}), 404


# ---------------------------------------------------------------------------
# CRUD endpoints
# ---------------------------------------------------------------------------

@bp.route("/assets", methods=["POST"])
def create_asset():
    """Create a new infrastructure asset."""
    data = request.get_json(silent=True) or {}

    errors = validate_asset_fields(data, require_all=True)
    if errors:
        return jsonify({"errors": errors}), 400

    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO assets (name, type, city, status, location, description)
        VALUES (:name, :type, :city, :status, :location, :description)
        """,
        {
            "name": data["name"],
            "type": data["type"],
            "city": data["city"],
            "status": data.get("status", "active"),
            "location": data.get("location"),
            "description": data.get("description"),
        },
    )
    db.commit()

    row = db.execute(
        "SELECT * FROM assets WHERE id = ?", (cursor.lastrowid,)
    ).fetchone()
    return jsonify(asset_to_dict(row)), 201


@bp.route("/assets", methods=["GET"])
def list_assets():
    """List assets, with optional filtering by city, type, or status."""
    city = request.args.get("city")
    asset_type = request.args.get("type")
    status = request.args.get("status")

    query = "SELECT * FROM assets WHERE 1=1"
    params = []

    if city:
        query += " AND city = ?"
        params.append(city)
    if asset_type:
        query += " AND type = ?"
        params.append(asset_type)
    if status:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY id"

    rows = get_db().execute(query, params).fetchall()
    return jsonify([asset_to_dict(r) for r in rows]), 200


@bp.route("/assets/<int:asset_id>", methods=["GET"])
def get_asset(asset_id):
    """Retrieve a single infrastructure asset by ID."""
    row = get_db().execute(
        "SELECT * FROM assets WHERE id = ?", (asset_id,)
    ).fetchone()

    if row is None:
        return _not_found(asset_id)
    return jsonify(asset_to_dict(row)), 200


@bp.route("/assets/<int:asset_id>", methods=["PUT"])
def update_asset(asset_id):
    """Update an existing infrastructure asset."""
    db = get_db()
    existing = db.execute(
        "SELECT * FROM assets WHERE id = ?", (asset_id,)
    ).fetchone()

    if existing is None:
        return _not_found(asset_id)

    data = request.get_json(silent=True) or {}

    errors = validate_asset_fields(data, require_all=False)
    if errors:
        return jsonify({"errors": errors}), 400

    merged = {**asset_to_dict(existing), **data}

    db.execute(
        """
        UPDATE assets
        SET name        = :name,
            type        = :type,
            city        = :city,
            status      = :status,
            location    = :location,
            description = :description,
            updated_at  = datetime('now')
        WHERE id = :id
        """,
        {
            "id": asset_id,
            "name": merged["name"],
            "type": merged["type"],
            "city": merged["city"],
            "status": merged["status"],
            "location": merged["location"],
            "description": merged["description"],
        },
    )
    db.commit()

    row = db.execute(
        "SELECT * FROM assets WHERE id = ?", (asset_id,)
    ).fetchone()
    return jsonify(asset_to_dict(row)), 200


@bp.route("/assets/<int:asset_id>", methods=["DELETE"])
def delete_asset(asset_id):
    """Delete an infrastructure asset."""
    db = get_db()
    existing = db.execute(
        "SELECT * FROM assets WHERE id = ?", (asset_id,)
    ).fetchone()

    if existing is None:
        return _not_found(asset_id)

    db.execute("DELETE FROM assets WHERE id = ?", (asset_id,))
    db.commit()
    return jsonify({"message": f"Asset {asset_id} deleted."}), 200


# ---------------------------------------------------------------------------
# Overview endpoint
# ---------------------------------------------------------------------------

@bp.route("/overview", methods=["GET"])
def overview():
    """Return a summary of infrastructure status across cities."""
    city = request.args.get("city")

    db = get_db()

    # Overall totals
    if city:
        rows = db.execute(
            "SELECT type, status, COUNT(*) AS count "
            "FROM assets WHERE city = ? GROUP BY type, status",
            (city,),
        ).fetchall()
        total = db.execute(
            "SELECT COUNT(*) FROM assets WHERE city = ?", (city,)
        ).fetchone()[0]
    else:
        rows = db.execute(
            "SELECT type, status, COUNT(*) AS count "
            "FROM assets GROUP BY type, status"
        ).fetchall()
        total = db.execute("SELECT COUNT(*) FROM assets").fetchone()[0]

    # Build nested summary: { type -> { status -> count } }
    by_type = {}
    status_totals = {}
    for row in rows:
        t, s, c = row["type"], row["status"], row["count"]
        by_type.setdefault(t, {})[s] = c
        status_totals[s] = status_totals.get(s, 0) + c

    result = {
        "total_assets": total,
        "by_status": status_totals,
        "by_type": by_type,
    }
    if city:
        result["city"] = city

    return jsonify(result), 200
