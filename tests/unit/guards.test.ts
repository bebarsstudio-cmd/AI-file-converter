import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkRateLimit,
  clampNumber,
  clientKey,
  numberFromEnv,
  readJsonBody,
  requireFirebaseUser,
  resetRateLimits,
} from "../../lib/api/guards.ts";

/* ------------------------------- helpers --------------------------------- */

function jsonRequest(body: string, headers: Record<string, string> = {}) {
  return new Request("http://test.local/api", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body,
  });
}

/* ----------------------------- readJsonBody ------------------------------- */

test("readJsonBody accepts valid JSON", async () => {
  const result = await readJsonBody(jsonRequest('{"hello":"world"}'), 1024);
  assert.deepEqual(result, { ok: true, value: { hello: "world" } });
});

test("readJsonBody rejects malformed JSON with 400", async () => {
  const result = await readJsonBody(jsonRequest("{nope"), 1024);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 400);
});

test("readJsonBody rejects empty bodies with 400", async () => {
  const result = await readJsonBody(jsonRequest("   "), 1024);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 400);
});

test("readJsonBody refuses oversized bodies with 413", async () => {
  const big = JSON.stringify({ payload: "x".repeat(4096) });
  const overCap = await readJsonBody(jsonRequest(big), 1024);
  assert.equal(overCap.ok, false);
  if (!overCap.ok) assert.equal(overCap.status, 413);

  // A body exactly at the cap is still fine.
  const atCap = await readJsonBody(jsonRequest("1234"), 4);
  assert.deepEqual(atCap, { ok: true, value: 1234 });
});

/* ---------------------------- rate limiting ------------------------------- */

test("checkRateLimit allows up to the limit, then answers 429", () => {
  resetRateLimits();
  const key = "test-client";
  for (let i = 0; i < 3; i++) {
    assert.equal(checkRateLimit(key, { limit: 3 }), null);
  }
  const blocked = checkRateLimit(key, { limit: 3 });
  assert.ok(blocked, "expected the fourth request to be blocked");
  assert.equal(blocked?.status, 429);
});

test("checkRateLimit frees the budget once the window passes", async () => {
  resetRateLimits();
  const key = "window-test";
  assert.equal(checkRateLimit(key, { limit: 1, windowMs: 50 }), null);
  assert.ok(checkRateLimit(key, { limit: 1, windowMs: 50 }));
  await new Promise((resolve) => setTimeout(resolve, 70));
  assert.equal(checkRateLimit(key, { limit: 1, windowMs: 50 }), null);
});

test("separate keys get separate budgets", () => {
  resetRateLimits();
  assert.equal(checkRateLimit("client-a", { limit: 1 }), null);
  assert.ok(checkRateLimit("client-a", { limit: 1 }));
  assert.equal(checkRateLimit("client-b", { limit: 1 }), null);
});

/* ------------------------- config and identity ---------------------------- */

test("clientKey prefers the first x-forwarded-for hop", () => {
  const forwarded = new Request("http://test.local", {
    headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
  });
  assert.equal(clientKey(forwarded), "1.2.3.4");

  const real = new Request("http://test.local", {
    headers: { "x-real-ip": "9.9.9.9" },
  });
  assert.equal(clientKey(real), "9.9.9.9");

  assert.equal(clientKey(new Request("http://test.local")), "local");
});

test("clampNumber buckets values and ignores non-numbers", () => {
  assert.equal(clampNumber(0.5, 0, 2), 0.5);
  assert.equal(clampNumber(99, 0, 2), 2);
  assert.equal(clampNumber(-3, 0, 2), 0);
  assert.equal(clampNumber("2", 0, 2), undefined);
  assert.equal(clampNumber(Number.NaN, 0, 2), undefined);
  assert.equal(clampNumber(undefined, 0, 2), undefined);
});

test("numberFromEnv reads positive integers and falls back safely", () => {
  process.env.TEST_GUARD_NUMBER = "42";
  assert.equal(numberFromEnv("TEST_GUARD_NUMBER", 7), 42);

  process.env.TEST_GUARD_NUMBER = "banana";
  assert.equal(numberFromEnv("TEST_GUARD_NUMBER", 7), 7);

  process.env.TEST_GUARD_NUMBER = "-5";
  assert.equal(numberFromEnv("TEST_GUARD_NUMBER", 7), 7);

  delete process.env.TEST_GUARD_NUMBER;
  assert.equal(numberFromEnv("TEST_GUARD_NUMBER", 7), 7);
});

/* --------------------------- optional sign-in ----------------------------- */

test("requireFirebaseUser is a no-op unless AI_REQUIRE_AUTH=1", async () => {
  delete process.env.AI_REQUIRE_AUTH;
  const result = await requireFirebaseUser(new Request("http://test.local"));
  assert.deepEqual(result, { ok: true, value: null });
});

test("requireFirebaseUser demands a token when enabled", async () => {
  process.env.AI_REQUIRE_AUTH = "1";
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
  try {
    const result = await requireFirebaseUser(new Request("http://test.local"));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 401);
  } finally {
    delete process.env.AI_REQUIRE_AUTH;
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  }
});

test("requireFirebaseUser accepts a token Firebase vouches for", async () => {
  process.env.AI_REQUIRE_AUTH = "1";
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ users: [{ localId: "uid-123" }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  try {
    const result = await requireFirebaseUser(
      new Request("http://test.local", {
        headers: { authorization: "Bearer fake-token" },
      })
    );
    assert.deepEqual(result, { ok: true, value: { uid: "uid-123" } });
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.AI_REQUIRE_AUTH;
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  }
});

test("requireFirebaseUser rejects tokens Firebase refuses", async () => {
  process.env.AI_REQUIRE_AUTH = "1";
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("{}", { status: 400 });
  try {
    const result = await requireFirebaseUser(
      new Request("http://test.local", {
        headers: { authorization: "Bearer stale-token" },
      })
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 401);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.AI_REQUIRE_AUTH;
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  }
});
