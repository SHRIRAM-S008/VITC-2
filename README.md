# City Infrastructure Asset Management System

A modern web-based platform for managing structured information about city infrastructure assets such as roads, utilities, and public facilities.

Built to help municipalities, city planners, and maintenance teams **create, update, view, organize, and monitor** infrastructure records from a single dashboard.

---

## Overview

City infrastructure is often managed across spreadsheets, disconnected reports, or paper-based workflows. This project provides a centralized digital system that makes infrastructure data easier to manage, track, and analyze.

The system supports:

- Structured asset registration
- Real-time asset status monitoring
- Condition tracking
- Maintenance history
- Search, filtering, and categorization
- Dashboard insights for city-wide infrastructure overview

This project is designed to be practical, scalable, and hackathon-ready.

---

## Problem Statement

Cities need a reliable way to manage infrastructure assets such as:

- Roads
- Bridges
- Drainage systems
- Water pipelines
- Streetlights
- Public buildings
- Parks and facilities

Without a centralized system, it becomes difficult to:

- Know the current condition of assets
- Identify damaged or critical infrastructure
- Schedule maintenance effectively
- Maintain accurate records
- Generate quick city-wide status summaries

This system solves that by providing a single source of truth for infrastructure management.

---

## Solution

The **City Infrastructure Asset Management System** is a full-stack application that enables city administrators and infrastructure teams to:

- Add new infrastructure assets
- Update asset details and condition
- Track maintenance and inspection records
- View infrastructure by category, location, and status
- Detect assets that need urgent attention
- Access a dashboard showing overall infrastructure health

---

## Key Features

### Core Features
- Create, view, update, and delete infrastructure records
- Organize assets by type, location, status, and condition
- Search and filter infrastructure data
- View detailed asset profiles
- Dashboard with city-wide infrastructure statistics

### Advanced Features
- Maintenance and inspection history logs
- Priority and risk tracking for critical assets
- Visual dashboard cards and charts
- Image upload for infrastructure evidence
- Role-based access control
- Exportable records and reports
- Optional geolocation support for map-based asset visualization

---

## Why This Project Stands Out

This project goes beyond basic CRUD.

### Winning Points
- **Real-world relevance**: directly addresses smart city and urban management challenges
- **Structured asset intelligence**: not just storage, but actionable infrastructure insights
- **Decision support**: highlights damaged, overdue, or critical assets
- **Scalable architecture**: built with Supabase for easy expansion
- **Hackathon-ready presentation**: clear dashboard, meaningful metrics, and practical use case

In short: it does not just store infrastructure data — it helps cities make better maintenance and planning decisions.

---

## Tech Stack

### Frontend
- Next.js / React
- TypeScript
- Tailwind CSS
- Shadcn UI or similar component library
- Chart library such as Recharts

### Backend / Database
- Supabase
  - PostgreSQL database
  - Authentication
  - Storage for asset images
  - Row Level Security \(optional\)

### Optional Integrations
- Leaflet / Mapbox for map view
- CSV / PDF export tools
- Email or notifications for maintenance alerts

---

## System Modules

### 1. Dashboard
Provides a high-level overview of the city's infrastructure:
- Total assets
- Assets by category
- Assets by condition
- Assets by status
- Critical or damaged assets requiring attention

### 2. Asset Management
Manage structured infrastructure records:
- Add new asset
- Edit asset details
- Delete or archive asset
- View complete asset profile

### 3. Search and Filtering
Quickly locate infrastructure by:
- Asset type
- Location
- Status
- Condition
- Priority level

### 4. Maintenance Tracking
Track service activity and inspection history:
- Inspection date
- Maintenance type
- Performed by
- Notes and findings
- Updated condition after maintenance

### 5. Alerts and Prioritization
Identify high-risk assets:
- Critical condition
- Damaged status
- Overdue inspections
- High-priority items for city response

---

## Example Use Cases

- A city engineer checks all roads marked as **Poor** or **Critical**
- A maintenance officer uploads a repair log for a damaged streetlight
- A planner reviews dashboard statistics before budget allocation
- An admin filters public facilities by district and current condition
- A supervisor identifies assets overdue for inspection

---

## Database Design

### Main Table: `infrastructure_assets`

| Field | Description |
|---|---|
| `id` | Unique asset identifier |
| `asset_code` | Human-readable asset code |
| `asset_name` | Asset name |
| `asset_type` | Type of infrastructure |
| `description` | Asset description |
| `location` | Physical location or district |
| `latitude` | Optional geo-coordinate |
| `longitude` | Optional geo-coordinate |
| `status` | Active, Damaged, Under Maintenance, Inactive |
| `condition` | Good, Fair, Poor, Critical |
| `priority` | Low, Medium, High, Critical |
| `installation_date` | Date installed |
| `last_inspection_date` | Last inspection timestamp |
| `image_url` | Optional uploaded image |
| `created_at` | Record created timestamp |
| `updated_at` | Record updated timestamp |

### Maintenance Table: `maintenance_logs`

| Field | Description |
|---|---|
| `id` | Unique log identifier |
| `asset_id` | Linked infrastructure asset |
| `maintenance_date` | Date of inspection/maintenance |
| `maintenance_type` | Repair, Inspection, Replacement, etc. |
| `performed_by` | Staff or department |
| `notes` | Summary of findings/actions |
| `condition_after` | Updated condition after maintenance |

---

## User Roles

### Admin
- Full access to all infrastructure records
- Manage users and system-level settings
- View analytics and reports

### Staff / Inspector
- Update asset status and condition
- Add maintenance records
- Upload inspection evidence

### Viewer
- Read-only access to dashboard and asset records

---

## Expected Impact

This system improves urban infrastructure management by:

- Centralizing asset information
- Increasing visibility into infrastructure health
- Reducing delays in maintenance response
- Improving planning and accountability
- Supporting smarter city operations

---

## Architecture Highlights

- **Supabase-powered backend** for rapid development and reliable data storage
- **Modular frontend** for easy scaling and feature expansion
- **Structured relational data model** for clean asset and maintenance tracking
- **Dashboard-driven UI** focused on decision-making, not just data entry

---

## Future Enhancements

- GIS-powered map visualization
- Predictive maintenance using asset age and condition trends
- Mobile inspection workflow
- Notification system for overdue or critical infrastructure
- Budget estimation and maintenance cost analytics
- Public reporting portal for citizen-submitted infrastructure issues

---

## Sample Dashboard Metrics

- Total Infrastructure Assets
- Roads in Poor Condition
- Water Utility Failures
- Public Facilities Under Maintenance
- Assets Requiring Urgent Attention
- Inspection Compliance Rate

---

## Installation

```bash
git clone https://github.com/your-username/city-infrastructure-system.git
cd city-infrastructure-system
npm install
npm run dev
```

---

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Supabase Setup

1. Create a new Supabase project
2. Create the required database tables:
   - `infrastructure_assets`
   - `maintenance_logs`
3. Enable authentication if role-based access is needed
4. Configure storage buckets for image uploads
5. Add Row Level Security policies if required

---

## Evaluation Strengths

This project is especially strong for:
- Smart city solutions
- Civic tech hackathons
- Urban planning tools
- Asset monitoring systems
- Data-driven public administration projects

### What makes it impressive in a hackathon
- Solves a meaningful civic problem
- Has both operational and analytical value
- Demonstrates full-stack engineering capability
- Can scale into a real municipal platform
- Combines CRUD, analytics, and infrastructure intelligence

---

## Demo Flow

1. Admin logs in
2. Adds a new road asset
3. Updates its condition to **Poor**
4. Creates a maintenance log
5. Dashboard instantly reflects the updated city-wide status
6. Critical assets are highlighted for action

That is the kind of demo judges love: simple, visual, practical, and impactful.

---

## Challenges Addressed

- Fragmented infrastructure records
- Lack of maintenance visibility
- Difficulty tracking critical assets
- Poor data organization in public systems
- Slow decision-making due to missing dashboards

---

## Project Vision

To provide cities with a lightweight but powerful digital foundation for smarter infrastructure management.

This system aims to evolve from a record management tool into a city operations intelligence platform.

---

## Contributing

Contributions, ideas, and improvements are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## License

This project is licensed under the MIT License.

---

## Final Pitch

**City Infrastructure Asset Management System** is not just a database for roads and utilities.

It is a practical civic-tech platform that helps cities:
- understand infrastructure conditions,
- prioritize maintenance,
- organize public assets,
- and make faster, smarter operational decisions.

If spreadsheets are chaos, this system is the municipal glow-up.

---       