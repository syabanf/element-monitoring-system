# Element Monitoring System

**Integrated Gas, Water & Electrical Monitoring Platform**  
Built for WIT.ID · Industrial IoT Dashboard · MVP v1.0

---

## Overview

Element Monitoring System is a unified industrial utility monitoring platform covering:

- **Electricity** — kWh, kW demand, power factor, THD, sub-meters
- **Water** — flow, pressure, volume, leak detection, NRW
- **Wastewater** — pH, COD, TSS, conductivity, compliance
- **Gas / Air** — LEL, CO, CH₄, H₂S, worker exposure
- **Thermal / HVAC** — zone temp, chiller COP, AHU
- **Compressed Air** — pressure, dew point, leak loss
- **Environment** — PM2.5, CO₂, noise, humidity

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Database | PostgreSQL + Prisma v7 |
| Auth | NextAuth v5 (credentials + JWT) |
| Cache | Redis (via Docker Compose) |
| Container | Docker Compose |

---

## Quick Start

### Prerequisites

- Node.js 20+
- Docker + Docker Compose

### 1. Install dependencies

```bash
npm install
```

### 2. Start database

```bash
docker compose up -d
```

This starts PostgreSQL on port 5432 and Redis on port 6379.

### 3. Configure environment

```bash
cp .env.example .env
```

The default `.env` works with the Docker Compose setup out of the box.

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed demo data

```bash
npm run seed
```

This creates 1 org, 8 users, 4 sites, 80 assets, 160 sensors, 7,680 telemetry readings, 40 alerts, and more.

### 6. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Login Credentials

All passwords: `password123`

| Email | Role |
|---|---|
| admin@wit.id | Super Admin |
| executive@wit.id | Executive |
| energymgr@wit.id | Energy Manager |
| opsup@wit.id | Operations Supervisor |
| tech@wit.id | Technician |
| finance@wit.id | Finance |
| ehs@wit.id | EHS / Compliance |
| viewer@wit.id | Viewer |

---

## Routes

| Route | Page |
|---|---|
| `/login` | Login |
| `/dashboard/executive` | Executive Dashboard |
| `/dashboard/operations` | Operations Dashboard |
| `/dashboard/energy` | Energy Manager Dashboard |
| `/dashboard/compliance` | Compliance Dashboard |
| `/sites` | Site list |
| `/sites/[id]` | Site detail |
| `/assets` | Asset registry |
| `/sensors` | Sensor registry |
| `/gateways` | Gateway registry |
| `/telemetry` | Live telemetry |
| `/alerts` | Alert console |
| `/alerts/[id]` | Alert detail + resolution |
| `/reports` | Report center |
| `/users` | User management |
| `/alert-rules` | Alert rule management |
| `/integrations` | Integration settings |
| `/audit-log` | Audit log |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/[...nextauth]` | NextAuth login/logout |
| GET | `/api/sites` | List sites |
| GET | `/api/assets` | List assets |
| GET | `/api/sensors` | List sensors |
| POST | `/api/telemetry/ingest` | Ingest telemetry reading |
| GET | `/api/telemetry/live` | Latest sensor readings |
| GET | `/api/alerts` | List alerts |
| POST | `/api/alerts/[id]/acknowledge` | Acknowledge alert |
| POST | `/api/alerts/[id]/resolve` | Resolve alert |
| GET | `/api/dashboard/summary` | Dashboard KPI summary |
| GET | `/api/reports` | List reports |
| POST | `/api/reports` | Generate report |
| GET | `/api/audit` | Audit log |
| GET | `/api/users` | List users |
| GET | `/api/alert-rules` | List alert rules |

### Telemetry Ingestion Example

```bash
curl -X POST http://localhost:3000/api/telemetry/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "sensorId": "<sensor-id>",
    "metricName": "kWh",
    "metricValue": 142.5,
    "unit": "kWh",
    "sourceProtocol": "Modbus",
    "qualityStatus": "GOOD"
  }'
```

---

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript type check
npm run seed         # Seed demo data
docker compose up    # Start PostgreSQL + Redis
docker compose down  # Stop services
npx prisma studio    # Visual database browser
npx prisma migrate dev --name <name>  # Create migration
```

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/         # Protected routes with sidebar layout
│   │   ├── dashboard/       # executive, operations, energy, compliance
│   │   ├── sites/           # Site list + detail
│   │   ├── assets/          # Asset registry
│   │   ├── sensors/         # Sensor registry
│   │   ├── gateways/        # Gateway registry
│   │   ├── telemetry/       # Live telemetry
│   │   ├── alerts/          # Alert console + detail
│   │   ├── reports/         # Report center
│   │   ├── users/           # User management
│   │   ├── alert-rules/     # Alert rule management
│   │   ├── integrations/    # Integration settings
│   │   └── audit-log/       # Audit log
│   ├── api/                 # REST API route handlers
│   └── login/               # Auth page (standalone, no sidebar)
├── components/
│   ├── dashboard/           # KpiCard, TrendChart, PillarStatusCard, AlertSummaryRow
│   ├── layout/              # Sidebar, Topbar
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── auth.ts              # NextAuth v5 config (credentials + JWT)
│   └── prisma.ts            # Prisma client singleton
└── types/
    └── next-auth.d.ts       # Session type extensions (id, role, organizationId)
prisma/
├── schema.prisma            # 17-model database schema
├── seed.ts                  # Demo data seeder
└── migrations/              # Migration files
```

---

## Known Limitations & Roadmap

### Current MVP Scope
- Dashboard KPIs use realistic simulated values alongside real DB counts
- Alert engine evaluates rules on-demand — no background worker yet
- Report exports generate metadata; CSV download is a frontend placeholder
- Map view (MapLibre/OpenLayers) not yet implemented
- Notification dispatch (Teams, Slack, PagerDuty) is configuration UI only

### Production Next Steps
- [ ] MQTT broker integration (Mosquitto / HiveMQ) for real device ingestion
- [ ] Background alert engine worker via BullMQ
- [ ] TimescaleDB or InfluxDB for high-frequency time-series at scale
- [ ] SSO via Microsoft Entra ID / Active Directory
- [ ] PDF report generation (Puppeteer or react-pdf)
- [ ] ML anomaly detection engine
- [ ] Teams / Slack / PagerDuty webhook dispatch
- [ ] SAP PM / ServiceNow work order creation API
- [ ] Geographic site map (MapLibre GL)
- [ ] Mobile PWA field view
- [ ] Playwright end-to-end smoke tests

---

## License

Developed for WIT.ID collaboration. Not for public distribution.  
© 2026 WIT.ID. All rights reserved.
