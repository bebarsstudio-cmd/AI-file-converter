/**
 * Request guards for the AI route handlers — everything that runs before a
 * request is allowed to reach the AI provider:
 *
 *   - request-body size caps       (readJsonBody)
 *   - a per-IP sliding-window rate limit (checkRateLimit)
 *   - an optional sign-in requirement    (requireFirebaseUser)
 *   - small config helpers               (numberFromEnv, clampNumber)
 *
 * These helpers have no framework or local imports, so the unit tests run
 * them directly with the built-in `node:test` runner. The route handlers
 * turn the results into `NextResponse.json(...)`.
 *
 * Tuning lives in .env.local (see .env.example): AI_REQUIRE_AUTH,
 * AI_RATE_LIMIT_PER_MINUTE, AI_MAX_BODY_KB, AI_MAX_OUTPUT_TOKENS.
 */

/** A guard that refused a request: HTTP status + message safe to show users. */
export interface GuardFailure {
  ok: false;
  status: number;
  error: string;
}

/** A guard that let a request through. */
export interface GuardSuccess<T> {
  ok: true;
  value: T;
}

export type GuardResult<T> = GuardSuccess<T> | GuardFailure;

/* -------------------------------- config --------------------------------- */

/** Reads a positive integer from the environment, falling back when unset/invalid. */
export function numberFromEnv(name: string, fallback: number): number {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : fallback;
}

/** Buckets a number into [min, max]; returns undefined for non-numbers. */
export function clampNumber(
  value: unknown,
  min: number,
  max: number
): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(max, Math.max(min, value));
}

/* ----------------------------- request body ------------------------------ */

const encoder = new TextEncoder();

/** Body-cap rejection (HTTP 413). */
function tooLarge(maxBytes: number): GuardFailure {
  return {
    ok: false,
    status: 413,
    error: `The request body is too large (max ${Math.max(1, Math.floor(maxBytes / 1024))} KB).`,
  };
}

/**
 * Reads the request body as JSON, refusing anything over `maxBytes`.
 * Malformed or empty bodies get a 400; oversized bodies get a 413.
 */
export async function readJsonBody(
  request: Request,
  maxBytes: number
): Promise<GuardResult<unknown>> {
  // Refuse before reading when the client already declares a huge body.
  const declared = Number(request.headers.get("content-length") ?? Number.NaN);
  if (Number.isFinite(declared) && declared > maxBytes) return tooLarge(maxBytes);

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, status: 400, error: "Could not read the request body." };
  }

  if (encoder.encode(text).length > maxBytes) return tooLarge(maxBytes);
  if (!text.trim()) {
    return { ok: false, status: 400, error: "Body must be a JSON object." };
  }

  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON body." };
  }
}

/* ------------------------------ rate limit -------------------------------- */

interface RateLimitEntry {
  /** Timestamps (ms) of the requests still inside the current window. */
  hits: number[];
}

const entries = new Map<string, RateLimitEntry>();
const MAX_TRACKED_KEYS = 10_000;

/**
 * In-memory sliding-window limit keyed by client. Returns null when the
 * request may proceed, or a 429 failure when the caller is over budget.
 *
 * This protects one long-running server — the way 1devv is meant to be
 * hosted. On a multi-instance or serverless host every instance keeps its
 * own counters, so treat it as a seat-belt rather than a wall.
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs = 60_000 }: { limit: number; windowMs?: number }
): GuardFailure | null {
  const now = Date.now();

  let entry = entries.get(key);
  if (!entry) {
    // Simple LRU sweep so an attacker can't grow the map forever.
    if (entries.size >= MAX_TRACKED_KEYS) {
      const oldest = entries.keys().next().value;
      if (oldest !== undefined) entries.delete(oldest);
    }
    entry = { hits: [] };
  }
  entry.hits = entry.hits.filter((at) => now - at < windowMs);

  // Refresh the entry's recency so the LRU sweep keeps hot keys.
  entries.delete(key);
  entries.set(key, entry);

  if (entry.hits.length >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((windowMs - (now - entry.hits[0])) / 1000)
    );
    return {
      ok: false,
      status: 429,
      error: `Too many requests — wait about ${retryAfterSeconds}s and try again.`,
    };
  }

  entry.hits.push(now);
  return null;
}

/** Clears all rate-limit state (used by tests). */
export function resetRateLimits(): void {
  entries.clear();
}

/** Best-effort client identity for rate limiting (proxy header, then IP). */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "local";
}

/* ----------------------------- optional auth ------------------------------ */

/**
 * When AI_REQUIRE_AUTH=1, only signed-in users may call the AI routes: the
 * request must carry `Authorization: Bearer <Firebase ID token>`.
 *
 * Verification uses the project's public Firebase web API key (a single
 * lookup call — no service account needed), which is the lightweight option
 * for self-hosting. For a bigger deployment, switch to the Firebase Admin
 * SDK's `verifyIdToken()`.
 */
export async function requireFirebaseUser(
  request: Request
): Promise<GuardResult<{ uid: string } | null>> {
  if (process.env.AI_REQUIRE_AUTH !== "1") {
    return { ok: true, value: null };
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : "";
  if (!token) {
    return { ok: false, status: 401, error: "Sign in to use the AI features." };
  }

  const webApiKey = (process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "").trim();
  if (!webApiKey) {
    return {
      ok: false,
      status: 500,
      error: "AI_REQUIRE_AUTH is on, but NEXT_PUBLIC_FIREBASE_API_KEY is not set.",
    };
  }

  let res: Response;
  try {
    res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(webApiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
        signal: AbortSignal.timeout(10_000),
      }
    );
  } catch {
    return {
      ok: false,
      status: 502,
      error: "Could not reach the sign-in service to verify your session. Try again.",
    };
  }

  const invalid: GuardFailure = {
    ok: false,
    status: 401,
    error: "Your session has expired — sign in again.",
  };
  if (!res.ok) return invalid;

  const data = (await res.json().catch(() => null)) as {
    users?: Array<{ localId?: unknown }>;
  } | null;
  const uid = data?.users?.[0]?.localId;
  return typeof uid === "string" && uid ? { ok: true, value: { uid } } : invalid;
}
