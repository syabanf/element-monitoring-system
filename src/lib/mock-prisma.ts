import { ALL_MOCK, RELATIONS, COUNT_RELATIONS } from "./mock-data";

type WhereClause = Record<string, unknown>;
type OrderByClause = Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];

function matchesWhere(item: Record<string, unknown>, where: WhereClause): boolean {
  for (const [key, val] of Object.entries(where)) {
    if (key === "AND") {
      if (!(val as WhereClause[]).every((w) => matchesWhere(item, w))) return false;
      continue;
    }
    if (key === "OR") {
      if (!(val as WhereClause[]).some((w) => matchesWhere(item, w))) return false;
      continue;
    }
    if (key === "NOT") {
      if (matchesWhere(item, val as WhereClause)) return false;
      continue;
    }
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      const ops = val as Record<string, unknown>;
      const field = item[key];
      if ("equals" in ops && field !== ops.equals) return false;
      if ("not" in ops && field === ops.not) return false;
      if ("in" in ops && !(ops.in as unknown[]).includes(field)) return false;
      if ("notIn" in ops && (ops.notIn as unknown[]).includes(field)) return false;
      if ("contains" in ops) {
        const ci = ops.mode === "insensitive";
        const a = ci ? String(field ?? "").toLowerCase() : String(field ?? "");
        const b = ci ? String(ops.contains).toLowerCase() : String(ops.contains);
        if (!a.includes(b)) return false;
      }
      if ("startsWith" in ops && !String(field ?? "").startsWith(String(ops.startsWith))) return false;
      if ("gt" in ops && !((field as number) > (ops.gt as number))) return false;
      if ("gte" in ops && !((field as number) >= (ops.gte as number))) return false;
      if ("lt" in ops && !((field as number) < (ops.lt as number))) return false;
      if ("lte" in ops && !((field as number) <= (ops.lte as number))) return false;
      if ("gte" in ops && field instanceof Date && ops.gte instanceof Date && field < ops.gte) return false;
      if ("lte" in ops && field instanceof Date && ops.lte instanceof Date && field > ops.lte) return false;
    } else {
      if (item[key] !== val) return false;
    }
  }
  return true;
}

function applyOrderBy(items: Record<string, unknown>[], orderBy: OrderByClause | undefined): Record<string, unknown>[] {
  if (!orderBy) return items;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...items].sort((a, b) => {
    for (const order of orders) {
      for (const [field, dir] of Object.entries(order)) {
        const av = a[field] as string | number | Date;
        const bv = b[field] as string | number | Date;
        if (av === bv) continue;
        const cmp = av < bv ? -1 : 1;
        return dir === "desc" ? -cmp : cmp;
      }
    }
    return 0;
  });
}

function resolveIncludes(
  item: Record<string, unknown>,
  modelName: string,
  include: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!include) return item;
  const result = { ...item };
  const relMap = RELATIONS[modelName] ?? {};
  for (const [rel, incVal] of Object.entries(include)) {
    if (!incVal) continue;
    const relDef = relMap[rel];
    if (!relDef) continue;
    const [collection, foreignKey, localKey] = relDef as [Record<string, unknown>[], string, string];
    const localVal = item[localKey];
    const nestedInclude = typeof incVal === "object" && "include" in (incVal as object)
      ? (incVal as { include: Record<string, unknown> }).include
      : undefined;
    const match = collection.filter((r) => r[foreignKey] === localVal);
    // belongsTo: foreignKey === "id" means we're looking up by PK
    if (foreignKey === "id") {
      const single = match[0] ?? null;
      result[rel] = single && nestedInclude ? resolveIncludes(single as Record<string, unknown>, rel, nestedInclude) : single;
    } else {
      result[rel] = match.map((r) =>
        nestedInclude ? resolveIncludes(r as Record<string, unknown>, rel, nestedInclude) : r,
      );
    }
  }
  return result;
}

function resolveSelect(item: Record<string, unknown>, select: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!select) return item;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(select)) {
    if (!val) continue;
    if (key === "_count" && typeof val === "object") {
      const countSelect = (val as { select: Record<string, boolean> }).select ?? val;
      const counts: Record<string, number> = {};
      // handled separately
      result["_count"] = counts;
      continue;
    }
    result[key] = item[key];
  }
  return result;
}

function applyCount(item: Record<string, unknown>, modelName: string, selectArg: unknown): Record<string, unknown> {
  if (!selectArg || typeof selectArg !== "object") return item;
  const countFields = (selectArg as { select?: Record<string, boolean> }).select ?? selectArg;
  const countRelMap = COUNT_RELATIONS[modelName] ?? {};
  const counts: Record<string, number> = {};
  for (const [field] of Object.entries(countFields as Record<string, unknown>)) {
    const collection = countRelMap[field] as Record<string, unknown>[] | undefined;
    if (!collection) { counts[field] = 0; continue; }
    const id = item["id"] as string;
    // figure out the FK name from RELATIONS
    const relDef = (RELATIONS[modelName] ?? {})[field];
    const fk = relDef ? (relDef as [unknown[], string, string])[1] : "";
    counts[field] = fk ? collection.filter((r) => r[fk] === id).length : collection.length;
  }
  return { ...item, _count: counts };
}

function createModelMock(modelName: string) {
  return {
    findMany: async (args?: {
      where?: WhereClause;
      orderBy?: OrderByClause;
      take?: number;
      skip?: number;
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
    }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      let items = args?.where ? all.filter((i) => matchesWhere(i, args.where!)) : all;
      items = applyOrderBy(items, args?.orderBy);
      if (args?.skip) items = items.slice(args.skip);
      if (args?.take !== undefined) items = items.slice(0, args.take);
      return items.map((i) => {
        let r = resolveIncludes(i, modelName, args?.include);
        if (args?.select?._count) r = applyCount(r, modelName, args.select._count);
        return r;
      });
    },

    findUnique: async (args: { where: WhereClause; include?: Record<string, unknown>; select?: Record<string, unknown> }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      const item = all.find((i) => matchesWhere(i, args.where)) ?? null;
      if (!item) return null;
      let r = resolveIncludes(item, modelName, args.include);
      if (args.select?._count) r = applyCount(r, modelName, args.select._count);
      return r;
    },

    findFirst: async (args?: { where?: WhereClause; orderBy?: OrderByClause; include?: Record<string, unknown> }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      const items = args?.where ? all.filter((i) => matchesWhere(i, args.where!)) : all;
      const sorted = applyOrderBy(items, args?.orderBy);
      const item = sorted[0] ?? null;
      if (!item) return null;
      return resolveIncludes(item, modelName, args?.include);
    },

    count: async (args?: { where?: WhereClause }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      if (!args?.where) return all.length;
      return all.filter((i) => matchesWhere(i, args.where!)).length;
    },

    create: async (args: { data: Record<string, unknown>; include?: Record<string, unknown> }) => {
      const now = new Date();
      const record = { id: `mock_${modelName}_${Date.now()}`, createdAt: now, updatedAt: now, ...args.data };
      (ALL_MOCK[modelName] as Record<string, unknown>[]).push(record);
      return resolveIncludes(record, modelName, args.include);
    },

    createMany: async (args: { data: Record<string, unknown>[] }) => {
      const now = new Date();
      for (const data of args.data) {
        const record = { id: `mock_${modelName}_${Date.now()}_${Math.random()}`, createdAt: now, updatedAt: now, ...data };
        (ALL_MOCK[modelName] as Record<string, unknown>[]).push(record);
      }
      return { count: args.data.length };
    },

    update: async (args: { where: WhereClause; data: Record<string, unknown>; include?: Record<string, unknown> }) => {
      const all = (ALL_MOCK[modelName] as Record<string, unknown>[]);
      const idx = all.findIndex((i) => matchesWhere(i, args.where));
      if (idx === -1) throw new Error(`Mock: ${modelName} not found`);
      all[idx] = { ...all[idx], ...args.data, updatedAt: new Date() };
      return resolveIncludes(all[idx], modelName, args.include);
    },

    upsert: async (args: { where: WhereClause; create: Record<string, unknown>; update: Record<string, unknown>; include?: Record<string, unknown> }) => {
      const all = (ALL_MOCK[modelName] as Record<string, unknown>[]);
      const idx = all.findIndex((i) => matchesWhere(i, args.where));
      if (idx === -1) {
        const now = new Date();
        const record = { id: `mock_${modelName}_${Date.now()}`, createdAt: now, updatedAt: now, ...args.create };
        all.push(record);
        return resolveIncludes(record, modelName, args.include);
      }
      all[idx] = { ...all[idx], ...args.update, updatedAt: new Date() };
      return resolveIncludes(all[idx], modelName, args.include);
    },

    delete: async (args: { where: WhereClause }) => {
      const all = (ALL_MOCK[modelName] as Record<string, unknown>[]);
      const idx = all.findIndex((i) => matchesWhere(i, args.where));
      if (idx === -1) throw new Error(`Mock: ${modelName} not found`);
      const [deleted] = all.splice(idx, 1);
      return deleted;
    },

    deleteMany: async (args?: { where?: WhereClause }) => {
      const all = (ALL_MOCK[modelName] as Record<string, unknown>[]);
      const before = all.length;
      const keep = args?.where ? all.filter((i) => !matchesWhere(i, args.where!)) : [];
      ALL_MOCK[modelName] = keep;
      return { count: before - keep.length };
    },

    updateMany: async (args: { where?: WhereClause; data: Record<string, unknown> }) => {
      const all = (ALL_MOCK[modelName] as Record<string, unknown>[]);
      let count = 0;
      for (let i = 0; i < all.length; i++) {
        if (!args.where || matchesWhere(all[i], args.where)) {
          all[i] = { ...all[i], ...args.data, updatedAt: new Date() };
          count++;
        }
      }
      return { count };
    },

    aggregate: async (args?: { where?: WhereClause; _count?: boolean; _sum?: Record<string, boolean>; _avg?: Record<string, boolean>; _min?: Record<string, boolean>; _max?: Record<string, boolean> }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      const items = args?.where ? all.filter((i) => matchesWhere(i, args.where!)) : all;
      const result: Record<string, unknown> = {};
      if (args?._count) result._count = items.length;
      for (const op of ["_sum", "_avg", "_min", "_max"] as const) {
        if (!args?.[op]) continue;
        const agg: Record<string, number | null> = {};
        for (const field of Object.keys(args[op]!)) {
          const vals = items.map((i) => i[field] as number).filter((v) => v !== null && v !== undefined);
          if (vals.length === 0) { agg[field] = null; continue; }
          if (op === "_sum") agg[field] = vals.reduce((a, b) => a + b, 0);
          else if (op === "_avg") agg[field] = vals.reduce((a, b) => a + b, 0) / vals.length;
          else if (op === "_min") agg[field] = Math.min(...vals);
          else if (op === "_max") agg[field] = Math.max(...vals);
        }
        result[op] = agg;
      }
      return result;
    },

    groupBy: async () => [],
  };
}

const MODEL_NAMES = Object.keys(ALL_MOCK);

export function createMockPrisma() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: Record<string, any> = {
    $connect: async () => {},
    $disconnect: async () => {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $transaction: async (fnOrOps: any) => {
      if (typeof fnOrOps === "function") return fnOrOps(client);
      return Promise.all(fnOrOps);
    },
    $queryRaw: async () => [],
    $executeRaw: async () => 0,
  };
  for (const model of MODEL_NAMES) {
    client[model] = createModelMock(model);
  }
  return client;
}
