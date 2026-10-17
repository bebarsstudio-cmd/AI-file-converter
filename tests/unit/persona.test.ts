import { test } from "node:test";
import assert from "node:assert/strict";
import { CREATOR, PERSONA, withPersona } from "../../lib/ai/persona.ts";
import type { ChatMessage } from "../../lib/ai/provider.ts";

const user: ChatMessage = { role: "user", content: "Who created you?" };

test("withPersona prepends the SourceAI persona once", () => {
  const messages = withPersona([user]);
  assert.equal(messages.length, 2);
  assert.equal(messages[0].role, "system");
  assert.equal(messages[0].content, PERSONA);
  assert.match(messages[0].content, /created by SourceAI/);
  assert.equal(messages[1], user);
});

test("withPersona never stacks a second persona", () => {
  const once = withPersona([user]);
  const twice = withPersona(once);
  assert.equal(twice, once, "returns the same array untouched");
  assert.equal(twice.filter((m) => m.role === "system").length, 1);
});

test("withPersona keeps client system messages, just puts the persona first", () => {
  const clientSystem: ChatMessage = {
    role: "system",
    content: "Reply in French.",
  };
  const messages = withPersona([clientSystem, user]);
  assert.equal(messages.length, 3);
  assert.equal(messages[1], clientSystem);
});

test("withPersona does not mutate the caller's array", () => {
  const original = [user];
  withPersona(original);
  assert.equal(original.length, 1);
});

test("CREATOR is the single source of the brand name", () => {
  assert.equal(CREATOR, "SourceAI");
  assert.match(PERSONA, /created by SourceAI/);
  assert.match(PERSONA, /never claim/i);
});
