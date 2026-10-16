/** A reusable transformation recipe shown in the preset strip on the home page. */
export const PRESET_TARGETS = [
  "C++",
  "Java",
  "JavaScript",
  "TypeScript",
  "Auto",
] as const;
export type PresetTarget = (typeof PRESET_TARGETS)[number];

export const PRESET_CATEGORIES = [
  "Convert",
  "Modernize",
  "Refactor",
  "Quality",
  "Design",
  "Games",
  "Analyze",
] as const;
export type PresetCategory = (typeof PRESET_CATEGORIES)[number];

export interface Preset {
  /** Stable identifier used for keys and selection tracking. */
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: PresetCategory;
  /** Language the recipe converts to; "Auto" keeps the user's current choice. */
  target: PresetTarget;
  /** The instruction that gets applied to the prompt composer. */
  prompt: string;
}
