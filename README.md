# VITC-2 — City Infrastructure Asset Management

A REST API for managing structured information about city infrastructure assets such as roads, utilities, and public facilities. The system supports creating, updating, viewing, and organizing infrastructure records and provides an overview of current infrastructure status within a city.

---

## Asset Types

| Value | Description |
|-------|-------------|
| `road` | Roads and highways |
| `utility` | Water, power, gas utilities |
| `public_facility` | Libraries, parks, community centres |

## Asset Statuses

| Value | Description |
|-------|-------------|
| `active` | Fully operational |
| `under_maintenance` | Temporarily taken out of service for maintenance |
| `inactive` | Decommissioned or not in use |

---

## Getting Started

### Prerequisites

```bash
pip install -r requirements.txt
```

### Running the server

```bash
python run.py
```

The API will be available at `http://127.0.0.1:5000`.

### Running the tests

```bash
python -m pytest tests/ -v
```

---

## API Reference

### Create an asset

```
POST /assets
```

**Request body (JSON)**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Human-readable name of the asset |
| `type` | string | ✅ | One of `road`, `utility`, `public_facility` |
| `city` | string | ✅ | City the asset belongs to |
| `status` | string | | One of `active`, `under_maintenance`, `inactive` (default: `active`) |
| `location` | string | | Address or area description |
| `description` | string | | Free-text description |

**Example**

```bash
curl -X POST http://localhost:5000/assets \
  -H "Content-Type: application/json" \
  -d '{"name": "Main Street", "type": "road", "city": "Springfield", "location": "Downtown"}'
```

---

### List assets

```
GET /assets[?city=&type=&status=]
```

Optional query parameters filter the results by `city`, `type`, and/or `status`.

---

### Get a single asset

```
GET /assets/<id>
```

---

### Update an asset

```
PUT /assets/<id>
```

Supply only the fields you want to change in the JSON body.

---

### Delete an asset

```
DELETE /assets/<id>
```

---

### City infrastructure overview

```
GET /overview[?city=]
```

Returns a summary of total assets, broken down by status and by type. Pass an optional `city` query parameter to restrict the summary to a single city.

**Example response**

```json
{
  "total_assets": 4,
  "by_status": {
    "active": 3,
    "under_maintenance": 1
  },
  "by_type": {
    "road": { "active": 2 },
    "utility": { "under_maintenance": 1 },
    "public_facility": { "active": 1 }
  }
}
```