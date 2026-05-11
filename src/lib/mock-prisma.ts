import { ALL_MOCK, RELATIONS, COUNT_RELATIONS } from "./mock-data";

type WhereClause = Record<string, unknown>;
type OrderByClause = Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
type RelDef = [Record<string, unknown>[], string, string];

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
    } else {
      if (item[key] !== val) return false;
    }
  }
  return true;
}

function applyOrderBy(
  items: Record<string, unknown>[],
  orderBy: OrderByClause | undefined,
): Record<string, unknown>[] {
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

function computeCount(
  item: Record<string, unknown>,
  modelName: string,
  countSelect: Record<string, boolean>,
): Record<string, number> {
  const countRelMap = COUNT_RELATIONS[modelName] ?? {};
  const relMap = RELATIONS[modelName] ?? {};
  const id = item["id"] as string;
  const counts: Record<string, number> = {};

  for (const field of Object.keys(countSelect)) {
    const collection = countRelMap[field] as Record<string, unknown>[] | undefined;
    if (!collection) { counts[field] = 0; continue; }
    const relDef = relMap[field] as RelDef | undefined;
    const fk = relDef?.[1];
    counts[field] = fk && fk !== "id" ? collection.filter((r) => r[fk] === id).length : collection.length;
  }
  return counts;
}

// Resolve a `select` that may contain nested relation selects (e.g. site: { select: { name: true } })
function resolveSelectWithRelations(
  item: Record<string, unknown>,
  modelName: string,
  select: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const relMap = RELATIONS[modelName] ?? {};

  for (const [key, val] of Object.entries(select)) {
    if (!val) continue;
    if (typeof val === "object" && "select" in (val as object)) {
      // Nested relation with its own select
      const relDef = relMap[key] as RelDef | undefined;
      if (relDef) {
        const [collection, fk, lk] = relDef;
        const localVal = item[lk];
        const matched = collection.filter((r) => r[fk] === localVal);
        const nestedSelect = (val as { select: Record<string, unknown> }).select;
        if (fk === "id") {
          const single = matched[0] ?? null;
          result[key] = single ? resolveSelectWithRelations(single as Record<string, unknown>, key, nestedSelect) : null;
        } else {
          result[key] = matched.map((r) => resolveSelectWithRelations(r as Record<string, unknown>, key, nestedSelect));
        }
      } else {
        result[key] = item[key];
      }
    } else {
      result[key] = item[key];
    }
  }
  return result;
}

// Resolve `include` (which may contain _count, nested select, nested include, take, where)
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

    // _count is special — compute counts for the listed fields
    if (rel === "_count") {
      const countSelect =
        typeof incVal === "object" && "select" in (incVal as object)
          ? (incVal as { select: Record<string, boolean> }).select
          : (incVal as Record<string, boolean>);
      result._count = computeCount(item, modelName, countSelect);
      continue;
    }

    const relDef = relMap[rel] as RelDef | undefined;
    if (!relDef) continue;
    const [collection, fk, lk] = relDef;
    const localVal = item[lk];

    // Parse nested options from the include value
    const isObjInc = typeof incVal === "object";
    const nestedInclude = isObjInc && "include" in (incVal as object)
      ? (incVal as { include: Record<string, unknown> }).include
      : undefined;
    const nestedSelect = isObjInc && "select" in (incVal as object)
      ? (incVal as { select: Record<string, unknown> }).select
      : undefined;
    const nestedTake = isObjInc && "take" in (incVal as object)
      ? (incVal as { take: number }).take
      : undefined;
    const nestedWhere = isObjInc && "where" in (incVal as object)
      ? (incVal as { where: WhereClause }).where
      : undefined;

    let matched = collection.filter((r) => r[fk] === localVal);
    if (nestedWhere) matched = matched.filter((r) => matchesWhere(r as Record<string, unknown>, nestedWhere));
    if (nestedTake !== undefined) matched = matched.slice(0, nestedTake);

    const transform = (r: Record<string, unknown>): Record<string, unknown> => {
      if (nestedInclude) r = resolveIncludes(r, rel, nestedInclude);
      if (nestedSelect) r = resolveSelectWithRelations(r, rel, nestedSelect as Record<string, unknown>);
      return r;
    };

    if (fk === "id") {
      // belongsTo — single record
      const single = matched[0] ?? null;
      result[rel] = single ? transform(single as Record<string, unknown>) : null;
    } else {
      // hasMany — array
      result[rel] = matched.map((r) => transform(r as Record<string, unknown>));
    }
  }
  return result;
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
      let items = args?.where ? all.filter((i) => matchesWhere(i, args.where!)) : [...all];
      items = applyOrderBy(items, args?.orderBy);
      if (args?.skip) items = items.slice(args.skip);
      if (args?.take !== undefined) items = items.slice(0, args.take);
      return items.map((i) => resolveIncludes(i, modelName, args?.include));
    },

    findUnique: async (args: {
      where: WhereClause;
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
    }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      const item = all.find((i) => matchesWhere(i, args.where)) ?? null;
      if (!item) return null;
      return resolveIncludes(item, modelName, args.include);
    },

    findFirst: async (args?: {
      where?: WhereClause;
      orderBy?: OrderByClause;
      include?: Record<string, unknown>;
    }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      const filtered = args?.where ? all.filter((i) => matchesWhere(i, args.where!)) : [...all];
      const sorted = applyOrderBy(filtered, args?.orderBy);
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

    update: async (args: {
      where: WhereClause;
      data: Record<string, unknown>;
      include?: Record<string, unknown>;
    }) => {
      const all = ALL_MOCK[modelName] as Record<string, unknown>[];
      const idx = all.findIndex((i) => matchesWhere(i, args.where));
      if (idx === -1) throw new Error(`Mock: ${modelName} not found`);
      all[idx] = { ...all[idx], ...args.data, updatedAt: new Date() };
      return resolveIncludes(all[idx], modelName, args.include);
    },

    upsert: async (args: {
      where: WhereClause;
      create: Record<string, unknown>;
      update: Record<string, unknown>;
      include?: Record<string, unknown>;
    }) => {
      const all = ALL_MOCK[modelName] as Record<string, unknown>[];
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
      const all = ALL_MOCK[modelName] as Record<string, unknown>[];
      const idx = all.findIndex((i) => matchesWhere(i, args.where));
      if (idx === -1) throw new Error(`Mock: ${modelName} not found`);
      const [deleted] = all.splice(idx, 1);
      return deleted;
    },

    deleteMany: async (args?: { where?: WhereClause }) => {
      const all = ALL_MOCK[modelName] as Record<string, unknown>[];
      const before = all.length;
      const keep = args?.where ? all.filter((i) => !matchesWhere(i, args.where!)) : [];
      ALL_MOCK[modelName] = keep;
      return { count: before - keep.length };
    },

    updateMany: async (args: { where?: WhereClause; data: Record<string, unknown> }) => {
      const all = ALL_MOCK[modelName] as Record<string, unknown>[];
      let count = 0;
      for (let i = 0; i < all.length; i++) {
        if (!args.where || matchesWhere(all[i], args.where)) {
          all[i] = { ...all[i], ...args.data, updatedAt: new Date() };
          count++;
        }
      }
      return { count };
    },

    aggregate: async (args?: {
      where?: WhereClause;
      _count?: boolean;
      _sum?: Record<string, boolean>;
      _avg?: Record<string, boolean>;
      _min?: Record<string, boolean>;
      _max?: Record<string, boolean>;
    }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      const items = args?.where ? all.filter((i) => matchesWhere(i, args.where!)) : all;
      const result: Record<string, unknown> = {};
      if (args?._count) result._count = items.length;
      for (const op of ["_sum", "_avg", "_min", "_max"] as const) {
        if (!args?.[op]) continue;
        const agg: Record<string, number | null> = {};
        for (const field of Object.keys(args[op]!)) {
          const vals = items
            .map((i) => i[field] as number)
            .filter((v) => v !== null && v !== undefined && !isNaN(v));
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
