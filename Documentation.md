# City Infrastructure Asset Management System — Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution Architecture](#3-solution-architecture)
4. [Tech Stack](#4-tech-stack)
5. [System Features](#5-system-features)
6. [Database Design](#6-database-design)
7. [API Reference](#7-api-reference)
8. [Authentication & Roles](#8-authentication--roles)
9. [Frontend Structure](#9-frontend-structure)
10. [Setup & Installation](#10-setup--installation)
11. [Environment Configuration](#11-environment-configuration)
12. [Deployment Guide](#12-deployment-guide)
13. [Testing](#13-testing)
14. [Known Limitations](#14-known-limitations)
15. [Future Roadmap](#15-future-roadmap)

---

## 1. Project Overview

The **City Infrastructure Asset Management System** is a full-stack web application designed to help municipalities, city engineers, maintenance teams, and urban planners digitally manage infrastructure assets such as roads, bridges, drainage systems, streetlights, water pipelines, and public facilities.

The core idea is simple: cities own hundreds or thousands of physical assets, and they need a centralized, reliable, and easy-to-use system to track those assets, monitor their condition, record maintenance history, and quickly identify which assets need urgent attention.

This system replaces fragmented spreadsheets, manual reports, and disconnected paperwork with a structured digital platform that supports real-time data entry, meaningful analytics, and role-based access for different types of city staff.

The application was developed as part of a hackathon challenge focused on smart city solutions and civic technology.

---

## 2. Problem Statement

### The Core Challenge

Managing city infrastructure is a complex and ongoing responsibility. Physical assets deteriorate over time. Roads develop cracks. Streetlights fail. Drainage systems get blocked. Bridges need regular inspection. Water pipelines corrode.

Without a centralized system, city departments typically manage this information through:

- Excel spreadsheets that become outdated quickly
- Paper-based inspection reports filed in folders
- Disconnected department databases that do not communicate
- Verbal records passed between maintenance crews
- Reactive responses rather than proactive management

This creates serious problems:

**Visibility Gap** — No one has a full picture of the city's infrastructure health at any given moment. Decision-makers cannot see which assets are critical, which are functioning well, and which are overdue for inspection.

**Maintenance Delays** — Without proper tracking, maintenance work gets delayed or forgotten entirely. Assets that could have been repaired cheaply with early intervention end up requiring expensive emergency fixes.

**Poor Accountability** — When maintenance is not logged properly, it becomes impossible to hold teams accountable or review service history for a specific asset.

**Budget Misallocation** — Without data, city planners struggle to allocate maintenance budgets effectively. Resources get spent reactively on emergencies rather than proactively on prevention.

**Data Loss** — Spreadsheets get corrupted. Files get lost. Staff with critical knowledge leave, taking that institutional knowledge with them.

### Who Is Affected

This problem affects city administrators, civil engineers, public works departments, maintenance crews, urban planners, finance officers, and ultimately the citizens who depend on functioning infrastructure every day.

---

## 3. Solution Architecture

The system is built as a modern full-stack web application with a clear separation between the frontend interface, the backend data layer, and the authentication system. Here is a high-level description of how the components work together.

### How It Works

The user accesses the application through a web browser. The frontend, built with Next.js and React, handles all user interactions including forms, dashboards, search, and filtering. When a user performs an action — such as adding a new asset or updating a condition — the frontend communicates directly with Supabase using the Supabase JavaScript client library.

Supabase serves as the backend. It provides a hosted PostgreSQL database, a RESTful API that is auto-generated from the database schema, a real-time subscription system, an authentication service, and file storage for asset images. Because Supabase handles all of this out of the box, there is no need to build and maintain a separate backend server.

Authentication is handled through Supabase Auth. Users log in with email and password. Their session is stored and managed by Supabase. On the frontend, protected routes check for a valid session before rendering content.

Role-based access is managed through a combination of Supabase Row Level Security policies on the database side and conditional rendering on the frontend side.

### Architecture Diagram

```
[ User / Browser ]
       |
       v
[ Next.js Frontend ]  ←→  [ Supabase Auth ]
       |
       v
[ Supabase Client (JS SDK) ]
       |
       v
[ Supabase Backend ]
   ├── PostgreSQL Database
   ├── Auto-generated REST API
   ├── Row Level Security Policies
   └── Storage Buckets (Images)
```

---

## 4. Tech Stack

### Frontend

**Next.js** is the main framework. It provides server-side rendering, file-based routing, and a great developer experience for building React applications. The App Router pattern is used for routing and layout management.

**React** is the underlying UI library. All interface components are built as React components with hooks for state and side effects.

**TypeScript** is used throughout the project for type safety. All data models, API responses, and component props are typed to catch errors early and improve code readability.

**Tailwind CSS** is the utility-first CSS framework used for styling. It enables rapid UI development without writing custom stylesheets for every component.

**Shadcn UI** provides pre-built, accessible, and customizable UI components such as buttons, dialogs, tables, dropdowns, and form inputs. These are installed directly into the project rather than imported as a dependency, which allows full customization.

**Recharts** is used for the dashboard charts and visual analytics. It is a composable chart library built on top of React and SVG.

### Backend

**Supabase** is the backend-as-a-service platform powering the entire data layer. It provides a hosted PostgreSQL database, automatic REST API generation, real-time subscriptions, authentication, and storage — all managed from a single dashboard.

**PostgreSQL** is the underlying database. It is a powerful, open-source relational database that supports complex queries, foreign key relationships, and indexing.

### DevOps and Deployment

**Vercel** is the recommended deployment platform for the Next.js frontend. It integrates directly with GitHub and provides automatic deployments on every push.

**Supabase Cloud** hosts the database, auth, and storage. The free tier is sufficient for hackathon use.

---

## 5. System Features

### 5.1 Dashboard

The dashboard is the first screen users see after logging in. It is designed to give a quick and clear overview of the city's infrastructure health without requiring the user to dig through individual records.

The dashboard displays the following key metrics:

- **Total Assets** — the total number of infrastructure assets registered in the system
- **Assets by Condition** — a breakdown of how many assets are in Good, Fair, Poor, or Critical condition
- **Assets by Status** — a breakdown by Operational, Damaged, Under Maintenance, or Inactive status
- **Assets by Category** — a count of assets grouped by type such as Roads, Bridges, Water Utilities, and so on
- **Critical Assets** — a dedicated panel that highlights assets marked as Critical condition or Damaged status, so these can be addressed immediately
- **Recent Activity** — a log of the most recently added or updated assets

Charts display this data visually so that administrators can understand infrastructure health at a glance without reading through tables of records.

### 5.2 Asset Management

This is the core module of the system. It allows authorized users to create, view, update, and delete infrastructure asset records.

**Creating an Asset** — The user fills out a structured form with the following information: asset name, asset code, category, description, physical location, installation date, current condition, current status, and priority level. An optional image can be uploaded as visual evidence or reference for the asset.

**Viewing Assets** — Assets are displayed in a searchable, filterable table. Users can click on any asset to open its full profile page, which shows all details including maintenance history.

**Updating an Asset** — Any field on the asset record can be updated. When a maintenance team completes work on an asset, they can update its condition and status accordingly.

**Deleting an Asset** — Admins can permanently remove an asset from the system, or assets can be archived to preserve historical data.

### 5.3 Search and Filtering

Users can search and filter assets using multiple criteria simultaneously. Available filters include asset type or category, physical location or district, current condition, current operational status, and priority level. This makes it easy to answer specific operational questions such as "show me all roads in the northern district that are in Poor condition" or "show me all assets that are currently Under Maintenance."

### 5.4 Maintenance Tracking

Every infrastructure asset has a maintenance log associated with it. Maintenance team members can create log entries each time an inspection or repair is performed.

Each log entry captures: the date of the maintenance activity, the type of activity such as Inspection, Routine Repair, Emergency Repair, or Replacement, the name or department of the person or team that performed the work, detailed notes about what was found and what was done, and the updated condition of the asset after the work was completed.

This creates a full service history for every asset, which is useful for understanding patterns, planning future maintenance, and demonstrating accountability.

### 5.5 Alerts and Priority System

The system automatically surfaces assets that need attention based on their recorded condition and status. Assets marked as Critical or Damaged are flagged prominently on the dashboard and can be filtered to in the asset list. The priority field allows teams to manually escalate specific assets that require faster response regardless of their current condition label.

### 5.6 Image Upload

Users can upload images when creating or updating an asset. These images are stored in Supabase Storage and linked to the asset record. This is useful for capturing the current state of an asset at the time of inspection, providing visual evidence of damage, or documenting the before and after of a repair.

---

## 6. Database Design

The database is built in PostgreSQL and hosted on Supabase. The schema is designed to be clean, relational, and easy to extend.

### Table: `infrastructure_assets`

This is the primary table that stores all infrastructure asset records.

```sql
CREATE TABLE infrastructure_assets (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_code          VARCHAR(50) UNIQUE NOT NULL,
  asset_name          VARCHAR(255) NOT NULL,
  asset_type          VARCHAR(100) NOT NULL,
  description         TEXT,
  location            VARCHAR(255) NOT NULL,
  latitude            DECIMAL(10, 8),
  longitude           DECIMAL(11, 8),
  status              VARCHAR(50) DEFAULT 'Operational',
  condition           VARCHAR(50) DEFAULT 'Good',
  priority            VARCHAR(50) DEFAULT 'Low',
  installation_date   DATE,
  last_inspection_date TIMESTAMPTZ,
  image_url           TEXT,
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Field Explanations:**

`id` is a universally unique identifier auto-generated for every record. It is used as the primary key and referenced by other tables.

`asset_code` is a human-readable code assigned to the asset such as `RD-001` for the first road or `STL-042` for a streetlight. It must be unique across all assets.

`asset_type` categorizes the asset. Accepted values include Road, Bridge, Streetlight, Water Pipeline, Drainage System, Public Building, Park, and others as needed.

`status` reflects the current operational state of the asset. Accepted values are `Operational`, `Damaged`, `Under Maintenance`, and `Inactive`.

`condition` reflects the physical state of the asset based on inspection. Accepted values are `Good`, `Fair`, `Poor`, and `Critical`.

`priority` determines how urgently the asset needs attention. Accepted values are `Low`, `Medium`, `High`, and `Critical`.

`latitude` and `longitude` are optional fields for geolocation, used if a map view is implemented.

`created_by` is a foreign key referencing the Supabase auth user who created the record, enabling accountability and audit trails.

---

### Table: `maintenance_logs`

This table stores the service and inspection history for each infrastructure asset.

```sql
CREATE TABLE maintenance_logs (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id          UUID REFERENCES infrastructure_assets(id) ON DELETE CASCADE,
  maintenance_date  DATE NOT NULL,
  maintenance_type  VARCHAR(100) NOT NULL,
  performed_by      VARCHAR(255) NOT NULL,
  notes             TEXT,
  condition_after   VARCHAR(50),
  cost              DECIMAL(12, 2),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

**Field Explanations:**

`asset_id` is the foreign key that links each log entry to a specific infrastructure asset. The `ON DELETE CASCADE` clause means that if an asset is deleted, all its associated maintenance logs are deleted as well.

`maintenance_type` describes the kind of work performed. Common values include `Inspection`, `Routine Maintenance`, `Emergency Repair`, `Replacement`, and `Upgrade`.

`condition_after` records the condition of the asset as assessed immediately after the maintenance work was completed. This allows the system to track whether the asset improved, stayed the same, or continued to deteriorate.

`cost` is an optional field to record the financial cost of the maintenance activity, which can be useful for budget reporting and analytics.

---

### Table: `users_profiles`

This table extends the Supabase auth user with additional profile information and role assignment.

```sql
CREATE TABLE user_profiles (
  id          UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name   VARCHAR(255),
  department  VARCHAR(100),
  role        VARCHAR(50) DEFAULT 'viewer',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

`role` determines what the user is allowed to do in the system. Accepted values are `admin`, `staff`, and `viewer`.

---

### Indexes

The following indexes are created to improve query performance on the most frequently filtered columns:

```sql
CREATE INDEX idx_assets_type      ON infrastructure_assets(asset_type);
CREATE INDEX idx_assets_status    ON infrastructure_assets(status);
CREATE INDEX idx_assets_condition ON infrastructure_assets(condition);
CREATE INDEX idx_assets_location  ON infrastructure_assets(location);
CREATE INDEX idx_logs_asset_id    ON maintenance_logs(asset_id);
```

---

## 7. API Reference

Because the backend is powered by Supabase, all database interactions happen through the Supabase JavaScript client. There is no custom REST API to build or document separately. Below are the key data operations used throughout the application.

### Fetch All Assets

```typescript
const { data, error } = await supabase
  .from('infrastructure_assets')
  .select('*')
  .order('created_at', { ascending: false });
```

### Fetch a Single Asset with Maintenance Logs

```typescript
const { data, error } = await supabase
  .from('infrastructure_assets')
  .select(`
    *,
    maintenance_logs (*)
  `)
  .eq('id', assetId)
  .single();
```

### Create a New Asset

```typescript
const { data, error } = await supabase
  .from('infrastructure_assets')
  .insert({
    asset_code: 'RD-001',
    asset_name: 'Main Street Road',
    asset_type: 'Road',
    location: 'Downtown District',
    status: 'Operational',
    condition: 'Good',
    priority: 'Low'
  });
```

### Update an Asset

```typescript
const { data, error } = await supabase
  .from('infrastructure_assets')
  .update({ condition: 'Poor', status: 'Damaged' })
  .eq('id', assetId);
```

### Delete an Asset

```typescript
const { error } = await supabase
  .from('infrastructure_assets')
  .delete()
  .eq('id', assetId);
```

### Add a Maintenance Log

```typescript
const { data, error } = await supabase
  .from('maintenance_logs')
  .insert({
    asset_id: assetId,
    maintenance_date: '2026-03-06',
    maintenance_type: 'Inspection',
    performed_by: 'John Doe',
    notes: 'Surface cracking detected on north lane.',
    condition_after: 'Poor'
  });
```

### Filter Assets by Condition and Status

```typescript
const { data, error } = await supabase
  .from('infrastructure_assets')
  .select('*')
  .eq('condition', 'Critical')
  .eq('status', 'Damaged');
```

---

## 8. Authentication & Roles

### Authentication Flow

Authentication is handled entirely by Supabase Auth. The application uses email and password login.

When a user visits a protected page without a valid session, they are redirected to the login page. After successful login, Supabase returns a session token which is stored in the browser and automatically attached to subsequent requests.

```typescript
// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@city.gov',
  password: 'securepassword'
});

// Sign Out
await supabase.auth.signOut();

// Get Current Session
const { data: { session } } = await supabase.auth.getSession();
```

### Role Definitions

| Role | Permissions |
|---|---|
| `admin` | Full access: create, read, update, delete assets and logs. Manage users. View all analytics. |
| `staff` | Create and update assets. Add maintenance logs. Upload images. Cannot delete records or manage users. |
| `viewer` | Read-only access. Can view the dashboard, asset list, and asset profiles. Cannot create or edit anything. |

### Row Level Security

Supabase Row Level Security is enabled on all tables to enforce role-based data access at the database level. This means even if someone bypasses the frontend, the database itself enforces who can read or write what.

```sql
-- Example: Only admins can delete assets
CREATE POLICY "Only admins can delete"
ON infrastructure_assets
FOR DELETE
USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);
```

---

## 9. Frontend Structure

```
/app
  /dashboard          → Main dashboard with metrics and charts
  /assets             → Asset list with search and filters
  /assets/[id]        → Individual asset profile and maintenance history
  /assets/new         → Form to create a new asset
  /assets/[id]/edit   → Form to edit an existing asset
  /login              → Login page
  /profile            → User profile settings

/components
  /ui                 → Reusable UI components (buttons, inputs, modals)
  /dashboard          → Dashboard-specific components (charts, stat cards)
  /assets             → Asset-specific components (table, form, detail card)
  /maintenance        → Maintenance log components

/lib
  supabase.ts         → Supabase client initialization
  types.ts            → TypeScript type definitions for all data models
  utils.ts            → Shared utility functions

/hooks
  useAssets.ts        → Custom hook for fetching and managing assets
  useAuth.ts          → Custom hook for authentication state
```

---

## 10. Setup & Installation

### Prerequisites

Before setting up the project locally, make sure you have the following installed: Node.js version 18 or higher, npm or yarn, a Supabase account, and Git.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/city-infrastructure-system.git
cd city-infrastructure-system
```

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Create a Supabase Project

Go to [supabase.com](https://supabase.com) and create a new project. Once the project is ready, navigate to the SQL Editor in the Supabase dashboard and run the table creation scripts from the [Database Design](#6-database-design) section above to set up your schema.

### Step 4 — Configure Environment Variables

Create a file named `.env.local` in the root of the project and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under **Project API**.

### Step 5 — Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 11. Environment Configuration

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous public key | Yes |
| `NEXT_PUBLIC_APP_NAME` | Display name for the application | No |
| `NEXT_PUBLIC_MAP_API_KEY` | API key for map integration (Mapbox or Google Maps) | No |

---

## 12. Deployment Guide

### Deploy Frontend to Vercel

The easiest way to deploy the Next.js frontend is through Vercel.

Connect your GitHub repository to Vercel. Vercel will automatically detect that it is a Next.js project. Add your environment variables in the Vercel project settings under Environment Variables. Every time you push to the main branch, Vercel will automatically redeploy the application.

### Deploy Database via Supabase Cloud

The Supabase database is already hosted on Supabase Cloud from the moment you create your project. No additional deployment steps are needed for the backend. Simply ensure your production environment variables in Vercel point to the correct Supabase project URL and key.

---

## 13. Testing

### Manual Testing Checklist

The following flows should be tested manually before submission or deployment:

User authentication — login, logout, and protected route redirection should all work correctly. Asset creation — filling out the form and submitting should create a new record and redirect to the asset profile. Asset update — editing fields and saving should update the record in the database and reflect immediately in the UI. Maintenance log creation — adding a log entry should appear in the asset's maintenance history. Dashboard metrics — adding or updating assets should be reflected in the dashboard counts and charts. Search and filtering — applying filters should correctly narrow down the asset list. Image upload — uploading an image should store it in Supabase Storage and display it on the asset profile.

### Recommended Testing Tools

For unit and integration testing, **Jest** and **React Testing Library** are recommended. For end-to-end testing, **Playwright** or **Cypress** can be used to simulate real user flows in the browser.

---

## 14. Known Limitations

**No offline support** — The application requires a live internet connection to communicate with Supabase. There is no offline mode or local data caching implemented at this time.

**No real-time sync between users** — While Supabase supports real-time subscriptions, the current implementation does not push live updates to other users when data changes. A page refresh is required to see the latest data.

**Basic role management** — Role assignment currently requires direct database access. There is no in-app user management interface for admins to assign or change user roles through the UI.

**No audit trail** — The system records who created an asset but does not maintain a full audit log of every change made to every field over time.

**Image size limits** — Supabase Storage has upload limits depending on the plan. Large image files may need to be compressed before upload.

---

## 15. Future Roadmap

**Interactive Map View** — Integrate Mapbox or Leaflet to display all assets on a city map based on their geolocation coordinates. This would allow teams to visualize infrastructure health geographically.

**Predictive Maintenance Alerts** — Use asset age, condition trend, and inspection frequency data to automatically generate maintenance recommendations before problems become critical.

**Mobile Inspection App** — Build a mobile-friendly interface or React Native app specifically designed for maintenance crews to use in the field during inspections.

**Export and Reporting** — Allow admins to export asset data and maintenance logs as CSV or PDF reports for use in city council presentations or budget planning sessions.

**Notification System** — Send email or in-app notifications when assets are flagged as Critical, when maintenance is overdue, or when a new high-priority asset is created.

**Citizen Reporting Portal** — A public-facing form where citizens can submit reports of infrastructure issues they observe, which automatically creates a flagged asset record or alert for city staff to review.

**Budget and Cost Analytics** — Aggregate maintenance cost data to generate department-level and city-wide spending reports, helping finance officers plan infrastructure budgets more accurately.

