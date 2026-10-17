import { test } from "node:test";
import assert from "node:assert/strict";
import { asRecord, stripCodeFences } from "../../lib/ai/parse.ts";

test("stripCodeFences removes surrounding markdown fences", () => {
  assert.equal(stripCodeFences("plain code"), "plain code");
  assert.equal(stripCodeFences("```js\nconst a = 1;\n```"), "const a = 1;");
  assert.equal(stripCodeFences("```\n<html></html>\n```"), "<html></html>");
  assert.equal(stripCodeFences("  ```python\nx = 1\n```  "), "x = 1");
});

test("stripCodeFences leaves inner backticks alone", () => {
  const js = "const t = `hello ${name}`;";
  assert.equal(stripCodeFences(js), js);
  assert.equal(stripCodeFences("```js\n" + js + "\n```"), js);
});

test("asRecord accepts plain objects and rejects everything else", () => {
  assert.deepEqual(asRecord({ a: 1 }), { a: 1 });
  assert.equal(asRecord([1, 2]), null, "arrays are not records");
  assert.equal(asRecord("text"), null);
  assert.equal(asRecord(null), null);
  assert.equal(asRecord(42), null);
  assert.equal(asRecord(undefined), null);
});
