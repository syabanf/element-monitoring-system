#!/bin/sh
set -e

# ─── Wait for PostgreSQL ──────────────────────────────────────────────────────
echo "⏳  Waiting for PostgreSQL at ${DB_HOST:-postgres}:${DB_PORT:-5432}..."
until nc -z "${DB_HOST:-postgres}" "${DB_PORT:-5432}" 2>/dev/null; do
  sleep 1
done
echo "✅  PostgreSQL is ready."

# ─── Migrate ──────────────────────────────────────────────────────────────────
echo "🔄  Running database migrations..."
npx prisma migrate deploy

# ─── Seed (only if database is empty) ────────────────────────────────────────
echo "🌱  Checking if seed is needed..."
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });
p.user.count()
  .then(n => { console.log(n); return p.\$disconnect(); })
  .catch(() => { console.log(0); });
" 2>/dev/null)

if [ "${USER_COUNT:-0}" = "0" ]; then
  echo "🌱  Seeding database..."
  npx ts-node --project tsconfig.seed.json prisma/seed.ts
else
  echo "✅  Database already seeded (${USER_COUNT} users found), skipping."
fi

# ─── Start app ────────────────────────────────────────────────────────────────
echo "🚀  Starting Next.js on port ${PORT:-3000}..."
exec node_modules/.bin/next start
