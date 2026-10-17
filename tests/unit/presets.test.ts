import { test } from "node:test";
import assert from "node:assert/strict";
import { PRESETS } from "../../presets/presets.ts";
import { PRESET_CATEGORIES, PRESET_TARGETS } from "../../types/preset.ts";

test("the preset catalog is big enough to be useful", () => {
  assert.ok(
    PRESETS.length >= 50,
    `expected at least 50 presets, found ${PRESETS.length}`
  );
});

test("preset ids are unique and url-friendly", () => {
  const seen = new Set<string>();
  for (const preset of PRESETS) {
    assert.match(preset.id, /^[a-z0-9-]+$/, `bad id: ${preset.id}`);
    assert.ok(!seen.has(preset.id), `duplicate id: ${preset.id}`);
    seen.add(preset.id);
  }
});

test("every preset carries complete, valid data", () => {
  for (const preset of PRESETS) {
    assert.ok(preset.name.trim().length > 2, `${preset.id}: name too short`);
    assert.ok(
      preset.description.trim().length > 4,
      `${preset.id}: description too short`
    );
    assert.ok(preset.emoji.trim().length > 0, `${preset.id}: missing emoji`);
    assert.ok(
      (PRESET_CATEGORIES as readonly string[]).includes(preset.category),
      `${preset.id}: unknown category "${preset.category}"`
    );
    assert.ok(
      (PRESET_TARGETS as readonly string[]).includes(preset.target),
      `${preset.id}: unknown target "${preset.target}"`
    );
    assert.ok(
      preset.prompt.trim().length > 20,
      `${preset.id}: prompt too short`
    );
    assert.ok(
      preset.prompt.length <= 800,
      `${preset.id}: prompt too long (${preset.prompt.length} chars)`
    );
  }
});
