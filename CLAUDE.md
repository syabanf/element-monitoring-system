# CLAUDE.md

## Project

Element Monitoring System by WIT.ID.

Industrial utility monitoring platform for electricity, water, wastewater, gas/air, environment, thermal/HVAC, and compressed air/process gases.

## Tech Stack

- Next.js 14 App Router
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- PostgreSQL + Prisma
- Recharts
- Docker Compose

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck  # tsc --noEmit
npm run test
npm run seed       # npx ts-node --project tsconfig.seed.json prisma/seed.ts
docker compose up
```

## Coding Rules

- TypeScript strictly — no `any`
- Business logic stays out of React components
- Separate: domain services | API handlers | UI components
- Realistic seed data
- Audit log for every critical action
- RBAC enforced on all API routes

## Design System

WIT.ID visual style:
- Background: #0a0a0a (near black)
- Surface: #111111
- Card: #1a1a1a
- Border: #2a2a2a
- Text primary: #ffffff
- Text muted: #888888
- Accent red: #e11d48 (rose-600)
- Accent red hover: #be123c
- Success: #22c55e
- Warning: #f59e0b
- Danger: #ef4444

## Domain Concepts

- **Pillar**: electricity | water | wastewater | gas_air | environment | thermal_hvac | compressed_air
- **Telemetry**: time-series sensor readings stored per sensor per metric
- **Alert**: generated when a telemetry value breaches an AlertRule
- **WorkOrder**: linked to alert resolution workflow
- **AuditLog**: immutable, append-only

## Do Not

- No hardcoded values in UI components
- No untyped API responses
- No skipping RBAC
- No skipping audit log on critical actions
- No external paid services required for local MVP
