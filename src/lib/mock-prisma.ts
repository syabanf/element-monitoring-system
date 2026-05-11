// Proxy-based Prisma mock — returns static dummy data without a database.
// Supports: findMany, findUnique, findFirst, count, create, update, delete, createMany, aggregate.

import { ALL_MOCK, RELATIONS, COUNT_RELATIONS } from "./mock-data";

type AnyObj = Record<string, unknown>;

// ─── Where matching ──────────────────────────────────────────────────────────

function matchesWhere(record: AnyObj, where?: AnyObj): boolean {
  if (!where) return true;
  return Object.entries(where).every(([key, val]) => {
    if (key === "AND") return (val as AnyObj[]).every((w) => matchesWhere(record, w));
    if (key === "OR")  return (val as AnyObj[]).some((w)  => matchesWhere(record, w));
    if (key === "NOT") return !(val as AnyObj[]).some((w) => matchesWhere(record, w));

    const recordVal = record[key];
    if (val === null) return recordVal === null || recordVal === undefined;
    if (typeof val === "object" && val !== null) {
      const op = val as AnyObj;
      if ("equals"      in op) return recordVal === op.equals;
      if ("not"         in op) return recordVal !== op.not;
      if ("in"          in op) return (op.in as unknown[]).includes(recordVal);
      if ("notIn"       in op) return !(op.notIn as unknown[]).includes(recordVal);
      if ("contains"    in op) return typeof recordVal === "string" && recordVal.toLowerCase().includes(String(op.contains).toLowerCase());
      if ("startsWith"  in op) return typeof recordVal === "string" && recordVal.startsWith(String(op.startsWith));
      if ("gt"          in op) return (recordVal as number) > (op.gt as number);
      if ("gte"         in op) return (recordVal as number) >= (op.gte as number);
      if ("lt"          in op) return (recordVal as number) < (op.lt as number);
      if ("lte"         in op) return (recordVal as number) <= (op.lte as number);
    }
    return recordVal === val;
  });
}

// ─── OrderBy ────────────────────────────────────────────────────────────────

function applyOrderBy(records: AnyObj[], orderBy?: AnyObj | AnyObj[]): AnyObj[] {
  if (!orderBy) return records;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...records].sort((a, b) => {
    for (const order of orders) {
      const [field, dir] = Object.entries(order)[0];
      const av = a[field], bv = b[field];
      if (av === bv) continue;
      const cmp = av === null || av === undefined ? -1 : bv === null || bv === undefined ? 1 : av < bv ? -1 : 1;
      return dir === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

// ─── Include resolver ────────────────────────────────────────────────────────

function resolveIncludes(modelName: string, record: AnyObj, include?: AnyObj): AnyObj {
  if (!include) return record;
  const result = { ...record };
  const relMap = RELATIONS[modelName] ?? {};
  const cntMap = COUNT_RELATIONS[modelName] ?? {};

  for (const [key, spec] of Object.entries(include)) {
    if (key === "_count") {
      const countSpec = (spec as AnyObj).select as AnyObj | undefined;
      const counts: AnyObj = {};
      const specKeys = countSpec ? Object.keys(countSpec) : Object.keys(cntMap);
      for (const ck of specKeys) {
        const arr = cntMap[ck] as AnyObj[] | undefined;
        if (!arr) { counts[ck] = 0; continue; }
        const [,fk, lk] = relMap[ck] ?? [];
        if (fk && lk) {
          counts[ck] = arr.filter((r) => (r as AnyObj)[fk] === record[lk]).length;
        } else {
          counts[ck] = arr.filter((r) => (r as AnyObj)[`${modelName}Id`] === record.id || (r as AnyObj).id === (record as AnyObj)[`${ck}Id`]).length;
        }
      }
      result._count = counts;
      continue;
    }

    if (!spec) continue;

    const rel = relMap[key];
    if (!rel) continue;
    const [relArr, fk, lk] = rel as [AnyObj[], string, string];

    const isMany = Array.isArray(relArr) && fk && lk && (relArr as AnyObj[]).some(r => r[fk] === record[lk] || r[fk] !== undefined);

    // Determine if it's a hasMany (foreign key on the related table pointing to this table)
    // or belongsTo (foreign key on this table pointing to related)
    const hasMany = fk && relArr.length > 0 && Object.prototype.hasOwnProperty.call(relArr[0], fk);

    if (hasMany) {
      // hasMany: filter related array by fk === record[lk]
      const nestedSpec = typeof spec === "object" && spec !== null && "include" in (spec as AnyObj) ? (spec as AnyObj).include as AnyObj : undefined;
      const whereSpec  = typeof spec === "object" && spec !== null && "where"   in (spec as AnyObj) ? (spec as AnyObj).where   as AnyObj : undefined;
      const takeSpec   = typeof spec === "object" && spec !== null && "take"    in (spec as AnyObj) ? (spec as AnyObj).take    as number  : undefined;
      let related = (relArr as AnyObj[]).filter((r) => r[fk] === record[lk]);
      if (whereSpec) related = related.filter((r) => matchesWhere(r, whereSpec));
      if (takeSpec)  related = related.slice(0, takeSpec);
      result[key] = related.map((r) => resolveIncludes(key, r, nestedSpec));
    } else {
      // belongsTo: find single record where relArr[lk] === record[fk]
      // fk is on this record pointing to lk on the related record
      const foreignVal = record[lk]; // e.g. record.siteId
      const found = (relArr as AnyObj[]).find((r) => r[fk] === foreignVal) ?? null;
      result[key] = found ? resolveIncludes(key, found as AnyObj, undefined) : null;
    }
  }
  return result;
}

// ─── Select ──────────────────────────────────────────────────────────────────

function applySelect(record: AnyObj, select?: AnyObj): AnyObj {
  if (!select) return record;
  const result: AnyObj = {};
  for (const [k, v] of Object.entries(select)) {
    if (v) result[k] = record[k];
  }
  return result;
}

// ─── Model factory ───────────────────────────────────────────────────────────

function createModelMock(modelName: string) {
  const records = () => (ALL_MOCK[modelName] ?? []) as AnyObj[];

  return {
    findMany: async (args?: AnyObj) => {
      let rows = records().filter((r) => matchesWhere(r, args?.where as AnyObj));
      rows = applyOrderBy(rows, args?.orderBy as AnyObj);
      if (args?.skip) rows = rows.slice(args.skip as number);
      if (args?.take)  rows = rows.slice(0, args.take as number);
      rows = rows.map((r) => resolveIncludes(modelName, r, args?.include as AnyObj));
      if (args?.select) rows = rows.map((r) => applySelect(r, args.select as AnyObj));
      return rows;
    },

    findUnique: async (args?: AnyObj) => {
      const row = records().find((r) => matchesWhere(r, args?.where as AnyObj)) ?? null;
      if (!row) return null;
      const resolved = resolveIncludes(modelName, row, args?.include as AnyObj);
      return args?.select ? applySelect(resolved, args.select as AnyObj) : resolved;
    },

    findFirst: async (args?: AnyObj) => {
      let rows = records().filter((r) => matchesWhere(r, args?.where as AnyObj));
      rows = applyOrderBy(rows, args?.orderBy as AnyObj);
      const row = rows[0] ?? null;
      if (!row) return null;
      const resolved = resolveIncludes(modelName, row, args?.include as AnyObj);
      return args?.select ? applySelect(resolved, args.select as AnyObj) : resolved;
    },

    count: async (args?: AnyObj) => {
      if (args?.select) {
        // grouped count (e.g. { _all: true })
        return records().filter((r) => matchesWhere(r, args?.where as AnyObj)).length;
      }
      return records().filter((r) => matchesWhere(r, args?.where as AnyObj)).length;
    },

    aggregate: async (args?: AnyObj) => {
      const rows = records().filter((r) => matchesWhere(r, args?.where as AnyObj));
      return { _count: rows.length, _avg: {}, _sum: {}, _min: {}, _max: {} };
    },

    groupBy: async () => [],

    // Mutations — return convincing fake results without persisting
    create: async (args?: AnyObj) => {
      const data = (args?.data ?? {}) as AnyObj;
      return { id: `mock_${Date.now()}`, createdAt: new Date(), updatedAt: new Date(), ...data };
    },

    createMany: async (args?: AnyObj) => {
      const data = (args?.data ?? []) as AnyObj[];
      return { count: data.length };
    },

    update: async (args?: AnyObj) => {
      const row = records().find((r) => matchesWhere(r, args?.where as AnyObj));
      return { ...(row ?? {}), ...(args?.data ?? {}), updatedAt: new Date() };
    },

    updateMany: async (args?: AnyObj) => {
      const count = records().filter((r) => matchesWhere(r, args?.where as AnyObj)).length;
      return { count };
    },

    upsert: async (args?: AnyObj) => {
      const row = records().find((r) => matchesWhere(r, args?.where as AnyObj));
      if (row) return { ...row, ...(args?.update ?? {}), updatedAt: new Date() };
      return { id: `mock_${Date.now()}`, createdAt: new Date(), updatedAt: new Date(), ...(args?.create ?? {}) };
    },

    delete: async (args?: AnyObj) => {
      return records().find((r) => matchesWhere(r, args?.where as AnyObj)) ?? null;
    },

    deleteMany: async (args?: AnyObj) => {
      const count = records().filter((r) => matchesWhere(r, args?.where as AnyObj)).length;
      return { count };
    },
  };
}

// ─── Top-level mock client ────────────────────────────────────────────────────

const MODEL_NAMES = Object.keys(ALL_MOCK);

export function createMockPrisma() {
  const client: AnyObj = {
    $connect:    async () => {},
    $disconnect: async () => {},
    $transaction: async (fn: (tx: AnyObj) => Promise<unknown>) => fn(client),
  };

  for (const model of MODEL_NAMES) {
    client[model] = createModelMock(model);
  }

  return client;
}
