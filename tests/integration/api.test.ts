import { test } from "node:test";
import assert from "node:assert/strict";

/**
 * End-to-end checks against a running dev server. They only exercise
 * validation paths that never reach the AI provider, so they are safe (and
 * free) to run any time. When no server is listening the whole file skips.
 *
 *   npm run dev            # in another terminal
 *   npm run test:integration
 *
 * Point BASE_URL at another host to test a deployed instance.
 */

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const SKIP_REASON = `no 1devv server reachable at ${BASE} — run "npm run dev" first`;

let serverCheck: Promise<boolean> | null = null;

function serverUp(): Promise<boolean> {
  serverCheck ??= fetch(BASE, { signal: AbortSignal.timeout(2000) })
    .then(() => true)
    .catch(() => false);
  return serverCheck;
}

function postJson(path: string, body: string) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

test("the chat status endpoint answers with its shape", async (t) => {
  if (!(await serverUp())) return t.skip(SKIP_REASON);

  const res = await fetch(`${BASE}/api/ai/chat`);
  const data = await res.json();
  // 200 = provider configured; 500 = no AI key in .env.local yet. Either way
  // the body must carry an honest `ok` flag instead of crashing.
  assert.ok(
    res.status === 200 || res.status === 500,
    `unexpected status ${res.status}`
  );
  assert.equal(typeof data.ok, "boolean");
  if (data.ok) {
    assert.equal(typeof data.provider, "string");
    assert.equal(typeof data.model, "string");
  } else {
    assert.equal(res.status, 500);
    assert.equal(typeof data.error, "string");
  }
});

test("malformed JSON is rejected with 400", async (t) => {
  if (!(await serverUp())) return t.skip(SKIP_REASON);

  const res = await postJson("/api/ai/chat", "{not json");
  assert.equal(res.status, 400);
});

test("an unknown mode is rejected with 400", async (t) => {
  if (!(await serverUp())) return t.skip(SKIP_REASON);

  const res = await postJson("/api/ai/create", '{"mode":"delete-everything"}');
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error, /mode/);
});

test("oversized bodies are refused before any AI work", async (t) => {
  if (!(await serverUp())) return t.skip(SKIP_REASON);

  const res = await postJson(
    "/api/ai/create",
    JSON.stringify({ mode: "generate", idea: "x".repeat(1_100_000) })
  );
  assert.equal(res.status, 413);
});

test("chat validation: an empty messages array is rejected", async (t) => {
  if (!(await serverUp())) return t.skip(SKIP_REASON);

  const res = await postJson("/api/ai/chat", '{"messages":[]}');
  assert.equal(res.status, 400);
});
