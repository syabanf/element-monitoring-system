import { ALL_MOCK, RELATIONS, COUNT_RELATIONS } from "./mock-data";

type WhereClause = Record<string, unknown>;
type RelDef = [Record<string, unknown>[], string, string];

// ─── Relation helpers ────────────────────────────────────────────────────────

function relDef(modelName: string, field: string): RelDef | undefined {
  return (RELATIONS[modelName] ?? {})[field] as RelDef | undefined;
}

/** Resolve a single belongsTo record (fk === "id") or first hasMany match. */
function lookupBelongsTo(
  item: Record<string, unknown>,
  def: RelDef,
): Record<string, unknown> | null {
  const [col, fk, lk] = def;
  const localVal = item[lk];
  if (localVal === null || localVal === undefined) return null;
  return (col.find((r) => r[fk] === localVal) as Record<string, unknown>) ?? null;
}

/** Resolve all hasMany records (fk !== "id"). */
function lookupHasMany(
  item: Record<string, unknown>,
  def: RelDef,
): Record<string, unknown>[] {
  const [col, fk, lk] = def;
  const localVal = item[lk];
  return col.filter((r) => r[fk] === localVal) as Record<string, unknown>[];
}

function isBelongsTo(def: RelDef): boolean {
  return def[1] === "id";
}

// ─── Where matching ──────────────────────────────────────────────────────────

function matchesWhere(
  item: Record<string, unknown>,
  where: WhereClause,
  modelName?: string,
): boolean {
  for (const [key, val] of Object.entries(where)) {
    if (key === "AND") {
      if (!(val as WhereClause[]).every((w) => matchesWhere(item, w, modelName))) return false;
      continue;
    }
    if (key === "OR") {
      if (!(val as WhereClause[]).some((w) => matchesWhere(item, w, modelName))) return false;
      continue;
    }
    if (key === "NOT") {
      if (matchesWhere(item, val as WhereClause, modelName)) return false;
      continue;
    }

    // Nested relation filter — e.g. where: { asset: { pillar: "ELECTRICITY" } }
    if (
      modelName &&
      val !== null &&
      typeof val === "object" &&
      !Array.isArray(val)
    ) {
      const rd = relDef(modelName, key);
      if (rd) {
        const subWhere = val as WhereClause;
        if (isBelongsTo(rd)) {
          const related = lookupBelongsTo(item, rd);
          if (!related) return false;
          if (!matchesWhere(related, subWhere, key)) return false;
        } else {
          const related = lookupHasMany(item, rd);
          // hasMany: at least one child must match
          if (!related.some((r) => matchesWhere(r, subWhere, key))) return false;
        }
        continue;
      }
    }

    // Operator object: { in, contains, gt, gte, lt, lte, … }
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
      continue;
    }

    // Primitive equality
    if (item[key] !== val) return false;
  }
  return true;
}

// ─── OrderBy helpers ─────────────────────────────────────────────────────────

/**
 * Resolve a possibly-nested field path through relations.
 * e.g. resolveField(sensor, "sensor", { site: { name: "asc" } }) via asset
 * Called with the orderBy entry: e.g. { site: { name: "asc" } }
 */
function resolveOrderValue(
  item: Record<string, unknown>,
  modelName: string,
  orderEntry: Record<string, unknown>,
): unknown {
  const [[key, val]] = Object.entries(orderEntry);
  if (val === "asc" || val === "desc") {
    // Direct field
    return item[key];
  }
  // Nested — resolve through relation
  const rd = relDef(modelName, key);
  if (!rd) return undefined;
  const related = isBelongsTo(rd) ? lookupBelongsTo(item, rd) : (lookupHasMany(item, rd)[0] ?? null);
  if (!related) return undefined;
  return resolveOrderValue(related, key, val as Record<string, unknown>);
}

function getOrderDir(entry: Record<string, unknown>): "asc" | "desc" {
  const [[, val]] = Object.entries(entry);
  if (val === "asc" || val === "desc") return val;
  return getOrderDir(val as Record<string, unknown>);
}

function applyOrderBy(
  items: Record<string, unknown>[],
  orderBy: unknown,
  modelName?: string,
): Record<string, unknown>[] {
  if (!orderBy) return items;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...items].sort((a, b) => {
    for (const order of orders) {
      const dir = getOrderDir(order as Record<string, unknown>);
      const av = modelName
        ? resolveOrderValue(a, modelName, order as Record<string, unknown>)
        : a[(Object.keys(order as object)[0])];
      const bv = modelName
        ? resolveOrderValue(b, modelName, order as Record<string, unknown>)
        : b[(Object.keys(order as object)[0])];
      if (av === bv) continue;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = (av as string | number) < (bv as string | number) ? -1 : 1;
      return dir === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

// ─── Count helper ─────────────────────────────────────────────────────────────

function computeCount(
  item: Record<string, unknown>,
  modelName: string,
  countSelect: Record<string, boolean | unknown>,
): Record<string, number> {
  const countRelMap = COUNT_RELATIONS[modelName] ?? {};
  const id = item["id"] as string;
  const counts: Record<string, number> = {};

  for (const field of Object.keys(countSelect)) {
    const collection = countRelMap[field] as Record<string, unknown>[] | undefined;
    if (!collection) { counts[field] = 0; continue; }
    const rd = relDef(modelName, field);
    const fk = rd?.[1];
    counts[field] = fk && fk !== "id"
      ? collection.filter((r) => r[fk] === id).length
      : collection.length;
  }
  return counts;
}

// ─── Select with nested relations ─────────────────────────────────────────────

function resolveSelectWithRelations(
  item: Record<string, unknown>,
  modelName: string,
  select: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(select)) {
    if (!val) continue;
    if (typeof val === "object" && "select" in (val as object)) {
      // Nested relation select
      const rd = relDef(modelName, key);
      if (rd) {
        const nestedSel = (val as { select: Record<string, unknown> }).select;
        if (isBelongsTo(rd)) {
          const single = lookupBelongsTo(item, rd);
          result[key] = single ? resolveSelectWithRelations(single, key, nestedSel) : null;
        } else {
          const many = lookupHasMany(item, rd);
          result[key] = many.map((r) => resolveSelectWithRelations(r, key, nestedSel));
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

// ─── Include resolution ───────────────────────────────────────────────────────

function resolveIncludes(
  item: Record<string, unknown>,
  modelName: string,
  include: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!include) return item;
  const result = { ...item };

  for (const [rel, incVal] of Object.entries(include)) {
    if (!incVal) continue;

    // _count inside include
    if (rel === "_count") {
      const countSelect =
        typeof incVal === "object" && "select" in (incVal as object)
          ? (incVal as { select: Record<string, boolean> }).select
          : (incVal as Record<string, boolean>);
      result._count = computeCount(item, modelName, countSelect);
      continue;
    }

    const rd = relDef(modelName, rel);
    if (!rd) continue;

    const isObjInc = typeof incVal === "object" && incVal !== null;
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
    const nestedOrderBy = isObjInc && "orderBy" in (incVal as object)
      ? (incVal as { orderBy: unknown }).orderBy
      : undefined;

    const transform = (r: Record<string, unknown>): Record<string, unknown> => {
      if (nestedInclude) r = resolveIncludes(r, rel, nestedInclude as Record<string, unknown>);
      if (nestedSelect) r = resolveSelectWithRelations(r, rel, nestedSelect as Record<string, unknown>);
      return r;
    };

    if (isBelongsTo(rd)) {
      const single = lookupBelongsTo(item, rd);
      result[rel] = single ? transform(single) : null;
    } else {
      let many = lookupHasMany(item, rd);
      if (nestedWhere) many = many.filter((r) => matchesWhere(r, nestedWhere, rel));
      if (nestedOrderBy) many = applyOrderBy(many, nestedOrderBy, rel);
      if (nestedTake !== undefined) many = many.slice(0, nestedTake);
      result[rel] = many.map(transform);
    }
  }
  return result;
}

// ─── Model mock factory ───────────────────────────────────────────────────────

function createModelMock(modelName: string) {
  return {
    findMany: async (args?: {
      where?: WhereClause;
      orderBy?: unknown;
      take?: number;
      skip?: number;
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
    }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      let items = args?.where
        ? all.filter((i) => matchesWhere(i, args.where!, modelName))
        : [...all];
      items = applyOrderBy(items, args?.orderBy, modelName);
      if (args?.skip) items = items.slice(args.skip);
      if (args?.take !== undefined) items = items.slice(0, args.take);
      return items.map((i) => {
        let r = resolveIncludes(i, modelName, args?.include);
        if (args?.select) r = resolveSelectWithRelations(r, modelName, args.select);
        return r;
      });
    },

    findUnique: async (args: {
      where: WhereClause;
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
    }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      const item = all.find((i) => matchesWhere(i, args.where, modelName)) ?? null;
      if (!item) return null;
      let r = resolveIncludes(item, modelName, args.include);
      if (args.select) r = resolveSelectWithRelations(r, modelName, args.select);
      return r;
    },

    findFirst: async (args?: {
      where?: WhereClause;
      orderBy?: unknown;
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
    }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      const filtered = args?.where
        ? all.filter((i) => matchesWhere(i, args.where!, modelName))
        : [...all];
      const sorted = applyOrderBy(filtered, args?.orderBy, modelName);
      const item = sorted[0] ?? null;
      if (!item) return null;
      let r = resolveIncludes(item, modelName, args?.include);
      if (args?.select) r = resolveSelectWithRelations(r, modelName, args.select);
      return r;
    },

    count: async (args?: { where?: WhereClause }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      if (!args?.where) return all.length;
      return all.filter((i) => matchesWhere(i, args.where!, modelName)).length;
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
        const record = {
          id: `mock_${modelName}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          createdAt: now,
          updatedAt: now,
          ...data,
        };
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
      const idx = all.findIndex((i) => matchesWhere(i, args.where, modelName));
      if (idx === -1) throw new Error(`Mock ${modelName}: record not found`);
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
      const idx = all.findIndex((i) => matchesWhere(i, args.where, modelName));
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
      const idx = all.findIndex((i) => matchesWhere(i, args.where, modelName));
      if (idx === -1) throw new Error(`Mock ${modelName}: record not found`);
      const [deleted] = all.splice(idx, 1);
      return deleted;
    },

    deleteMany: async (args?: { where?: WhereClause }) => {
      const all = ALL_MOCK[modelName] as Record<string, unknown>[];
      const before = all.length;
      const keep = args?.where
        ? all.filter((i) => !matchesWhere(i, args.where!, modelName))
        : [];
      ALL_MOCK[modelName] = keep;
      return { count: before - keep.length };
    },

    updateMany: async (args: { where?: WhereClause; data: Record<string, unknown> }) => {
      const all = ALL_MOCK[modelName] as Record<string, unknown>[];
      let count = 0;
      for (let i = 0; i < all.length; i++) {
        if (!args.where || matchesWhere(all[i], args.where, modelName)) {
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
      const items = args?.where
        ? all.filter((i) => matchesWhere(i, args.where!, modelName))
        : all;
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

    groupBy: async (args?: { by?: string[]; _count?: Record<string, boolean>; where?: WhereClause }) => {
      const all = (ALL_MOCK[modelName] ?? []) as Record<string, unknown>[];
      const items = args?.where
        ? all.filter((i) => matchesWhere(i, args.where!, modelName))
        : all;
      if (!args?.by?.length) return [];
      const groups = new Map<string, Record<string, unknown>[]>();
      for (const item of items) {
        const key = args.by.map((f) => String(item[f])).join("|");
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(item);
      }
      return Array.from(groups.entries()).map(([, group]) => {
        const result: Record<string, unknown> = {};
        for (const f of args.by!) result[f] = group[0][f];
        if (args._count) {
          result._count = {};
          for (const f of Object.keys(args._count)) {
            (result._count as Record<string, number>)[f] = group.length;
          }
        }
        return result;
      });
    },
  };
}

// ─── Export ───────────────────────────────────────────────────────────────────

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
