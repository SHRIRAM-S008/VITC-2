VALID_TYPES = {"road", "utility", "public_facility"}
VALID_STATUSES = {"active", "under_maintenance", "inactive"}


def asset_to_dict(row):
    """Convert a sqlite3.Row to a plain dictionary."""
    return {
        "id": row["id"],
        "name": row["name"],
        "type": row["type"],
        "city": row["city"],
        "status": row["status"],
        "location": row["location"],
        "description": row["description"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def validate_asset_fields(data, require_all=True):
    """Validate asset fields.

    Returns a list of error strings (empty when all fields are valid).
    When *require_all* is True, name / type / city are mandatory.
    """
    errors = []

    if require_all:
        for field in ("name", "type", "city"):
            if not data.get(field):
                errors.append(f"'{field}' is required.")

    if "type" in data and data["type"] not in VALID_TYPES:
        errors.append(
            f"'type' must be one of {sorted(VALID_TYPES)}."
        )

    if "status" in data and data["status"] not in VALID_STATUSES:
        errors.append(
            f"'status' must be one of {sorted(VALID_STATUSES)}."
        )

    return errors
