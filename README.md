# AutoLead

AutoLead is a dual-panel lead monitoring and management web application designed for local XAMPP execution, featuring real-time synchronization between administrators and employees.

## Description

AutoLead streamlines business operations by offering granular employee monitoring, interactive pipelines, secure role-based access control, audio call logging, and automated task tracking through a zero-framework, high-performance vanilla web architecture.

## Key Features & Architecture

### 1. Centralized Authentication & Security
* **Role-Based Access Control (RBAC)**: Secure server-side session management (`config/session.php`) enforcing strict `admin` and `employee` access headers.
* **Cryptographic Password Provisioning**: Passwords are securely hashed using **Argon2id / Bcrypt (Cost 12)**.
* **Brute-Force & Timing-Attack Protection**: Hardened authentication middleware with rate-limiting, failed attempt lockouts, and dummy hash timing safeguards.

### 2. Admin Panel (Central Command Hub)
* **Dashboard (`admin/dashboard.html`)**: Real-time KPI summary cards, 7-day rolling Lead Growth chart (Chart.js), Leads Funnel overview table, and filterable New Leads triage (*Today*, *This Week*, *This Month*, *All*).
* **Employee Monitoring (`admin/employee-monitoring.html`)**: Filterable pipelines by Employee Code (`EMP001`, `EMP002`, `EMP003`), activity status override dropdowns (`Active`, `Inactive`, `Pending`, `Checked`), and hard-action **Send** (escalate priority task) or **Delete** overrides.
* **Lead Preview & Audio Audit Trail (`admin/lead-preview.html`)**: Granular prospect profile inspection, quick-interaction logger (calls, emails, tasks, notes), chronological interaction audit log, and a custom Audio Player modal featuring a staggered CSS keyframe waveform visualizer (`@keyframes waveBounce`).
* **Global Tasks Management (`admin/tasks.html`)**: System-wide deliverable tracking table with automated red text highlights for overdue rows and status intervention dropdowns (`Pending`, `Complete`, `Overdue`).
* **Quick View Business Intelligence (`admin/analytics.html`)**: Executive conversion KPIs, 9-month longitudinal trajectory line graph (`Oct–Jun`), and outcome distribution doughnut chart paired with a custom HTML color legend.
* **Lead Ingestion & Account Provisioning (`admin/add-lead.html` & Dashboard Modal)**: Validated prospect intake form with direct employee code assignment and a secure Account Provisioning modal that updates directory tables in real time.

### 3. Employee Panel (My Workspace)
* **Workspace Dashboard (`employee/dashboard.html`)**: Personalized hub featuring a prominent **COMPLETE TASK** lead exhaustion button, 4-week personal growth chart, and 4 segmented action queues (*My Lead Funnel*, *My New Leads*, *Recently Assigned Leads*, and red-highlighted *Overdue Tasks*).
* **Email Campaigns Monitor (`employee/campaigns.html`)**: Outreach monitor with status filtering (*Running*, *Scheduled*, *Complete*), dual animated CSS progress bars, and `setInterval` percentage counters tracking *Open %* and *Click %*.
* **Smart Views Categorized Workspace (`employee/smart-views.html`)**: Swipeable 5-tab interface (*New lead*, *Prospect*, *Incoming Calls*, *Outgoing Calls*, *Followup*) allowing rapid switching without page reloads.
* **Pipeline & Activity Management (`employee/manage-lead.html`, `manage-activity.html`, `manage-task.html`)**: Real-time search filtering, instant stage-progression timestamp updates (`"Just now"`), resolution status tracking, and automated overdue/reminder clean-up.

## Technology Stack

* **Backend**: Raw PHP 8+ with Singleton PDO MySQL connectivity.
* **Frontend**: Vanilla ES6+ JavaScript, HTML5, and Modern CSS3 (CSS Variables, Grid, Flexbox).
* **Database**: Normalized MySQL / MariaDB (XAMPP environment).
* **Data Visualization**: Chart.js via CDN.
* **Server Stack**: Apache (XAMPP local server).

## File Structure & Purpose

```text
autolead/
|-- index.html                    # Centralized authentication portal with role toggling
|-- asset/                        # Brand asset directory
|   |-- icon.png                  # Website icon
|   |-- logo.png                  # Website logo
|-- config/                       # Backend configuration and security
|   |-- db.php                    # Singleton MySQL PDO connection handler
|   |-- session.php               # Server-side session management and RBAC middleware
|-- database/                     # Database schema definition
|   |-- autolead.sql              # Normalized SQL dump with comprehensive initial seed data
|-- api/                          # REST-like PHP JSON endpoints
|   |-- auth.php                  # Authentication handler (login, session validation, logout)
|   |-- admin_api.php             # Admin operations (metrics, lead ingestion, overrides, account provisioning)
|   |-- employee_api.php          # Employee operations (workspaces, smart views, stage updates, task exhaustion)
|-- admin/                        # Admin panel views
|   |-- dashboard.html            # Central command hub with growth charts and funnel tables
|   |-- employee-monitoring.html  # Employee pipeline filtering and audit controls
|   |-- lead-preview.html         # Granular prospect profiles, quick loggers, and audio players
|   |-- tasks.html                # Global task execution and overdue intervention board
|   |-- analytics.html            # Executive KPIs, conversion trajectories, and outcome charts
|   |-- add-lead.html             # Validated lead intake form with direct employee assignment
|-- employee/                     # Employee panel views
|   |-- dashboard.html            # Workspace hub featuring the complete task exhaustion trigger
|   |-- campaigns.html            # Email outreach monitor with open and click rate telemetry
|   |-- smart-views.html          # Segmented 5-tab pipeline management interface
|   |-- manage-lead.html          # Pipeline progression table with stage dropdowns
|   |-- manage-activity.html      # Interaction audit logs and resolution trackers
|   |-- manage-task.html          # Deliverable execution and overdue clean-up table
|-- css/                          # Cascade-driven stylesheets
|   |-- style.css                 # Global design system, variables, themes, modals, and grid utilities
|   |-- auth.css                  # Scoped layout for authentication forms
|   |-- admin/                    # Admin-specific stylesheets (dashboard, monitoring, preview, tasks, analytics, add-lead)
|   |-- employee/                 # Employee-specific stylesheets (dashboard, campaigns, smart-views, manage-tables)
|-- js/                           # Modular ES6+ script files
|   |-- main.js                   # Theme loader, DOM mutation observers, toast alerts, and modal utilities
|   |-- auth.js                   # Asynchronous login submission and role validation controller
|   |-- admin/                    # Admin-specific controllers (dashboard, monitoring, preview, tasks, analytics, add-lead)
|   |-- employee/                 # Employee-specific controllers (nav-dropdown, dashboard, campaigns, smart-views, manage-tables)
```

---

## Future Scope
* Role-Based Access Control Granularity: Expand permission tiers to support multi-level regional managers, team leads, and restricted auditor roles.

* Automated Webhooks & Integrations: Integrate incoming webhooks from external lead generation channels (e.g., Facebook Lead Ads, Google Ads) for automated database ingestion.

* Real-Time WebSockets: Implement Ratchet or Node.js WebSocket communication layers to replace HTTP polling for instantaneous cross-panel updates.

* Advanced CRM Reporting: Add export capabilities (CSV, PDF summary reports) for historical sales performance and employee conversion benchmarking.

* Email Gateway Integration: Connect the email campaigns module directly to SMTP servers (SendGrid, Mailgun) for live outbound message broadcasting and tracking.
