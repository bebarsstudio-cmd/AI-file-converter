import type { Preset } from "@/types/preset";

/**
 * Starter transformation recipes rendered by components/home/PresetStrip.tsx.
 * Pure data: adding or removing a recipe only requires editing this list.
 */
export const PRESETS: Preset[] = [
  // ---------------------------------------------------------------- Convert
  {
    id: "js-to-ts",
    name: "JS → TypeScript",
    description: "Strict types, identical behavior.",
    emoji: "🔷",
    category: "Convert",
    target: "TypeScript",
    prompt:
      "Convert every JavaScript file in this project to strict TypeScript. Keep the behavior identical, add explicit types for state, function parameters and return values, and fix type errors properly instead of silencing them with any.",
  },
  {
    id: "js-to-cpp",
    name: "JS → C++17",
    description: "Logic-preserving C++17 port.",
    emoji: "⚙️",
    category: "Convert",
    target: "C++",
    prompt:
      "Convert this JavaScript project to C++17. Preserve the logic, structure and controls exactly, use SDL2 for any windowing, rendering or input, and keep it buildable as a single main.cpp.",
  },
  {
    id: "webapp-to-cpp",
    name: "Web App → C++ (SDL2)",
    description: "Native desktop port, same feel.",
    emoji: "🖥️",
    category: "Convert",
    target: "C++",
    prompt:
      "Turn this web app into a native C++17 SDL2 desktop program. Reproduce the layout, styling and interactions as closely as practical, with a proper event loop, input handling and redraws.",
  },
  {
    id: "webapp-to-java",
    name: "Web App → Java (Swing)",
    description: "Desktop app on a vanilla JDK.",
    emoji: "☕",
    category: "Convert",
    target: "Java",
    prompt:
      "Convert this web app into a single-file Java Swing application. Preserve the layout, colors and interactions, and keep it runnable on a vanilla JDK with no external libraries.",
  },
  {
    id: "js-to-java",
    name: "JS Logic → Java",
    description: "Clean Java 17, stdlib only.",
    emoji: "🍵",
    category: "Convert",
    target: "Java",
    prompt:
      "Convert the JavaScript logic into clean Java 17: a single Main class with public static void main, standard library only, well-decomposed methods and identical behavior.",
  },
  {
    id: "vanilla-to-react",
    name: "Vanilla → React + TS",
    description: "DOM code becomes components.",
    emoji: "⚛️",
    category: "Convert",
    target: "TypeScript",
    prompt:
      "Restructure this vanilla HTML/CSS/JS project into a React + TypeScript app. Split the UI into focused components, replace direct DOM manipulation with state and hooks, and keep the styling pixel-identical.",
  },
  {
    id: "react-to-next",
    name: "React → Next.js",
    description: "Migrate to the App Router.",
    emoji: "▲",
    category: "Convert",
    target: "TypeScript",
    prompt:
      "Migrate this React app to Next.js with the App Router. Move pages into app/, mark client components where hooks or browser APIs are used, and keep every route and interaction working.",
  },
  {
    id: "canvas-game-to-sdl2",
    name: "Canvas Game → SDL2",
    description: "Same game, native window.",
    emoji: "🕹️",
    category: "Convert",
    target: "C++",
    prompt:
      "Port this canvas game to C++17 with SDL2. Convert the game loop, sprites, input handling and collision logic 1:1 so it plays and feels exactly the same.",
  },
  {
    id: "jquery-to-vanilla",
    name: "jQuery → Vanilla JS",
    description: "Drop the dependency entirely.",
    emoji: "🪄",
    category: "Convert",
    target: "JavaScript",
    prompt:
      "Replace all jQuery usage with modern vanilla JavaScript: querySelector, classList, addEventListener and fetch. No jQuery may remain, and behavior must not change.",
  },
  {
    id: "split-to-modules",
    name: "Single File → Modules",
    description: "Break one big file apart.",
    emoji: "🗃️",
    category: "Convert",
    target: "JavaScript",
    prompt:
      "Split this single-file script into well-named ES modules with clear responsibilities. Keep the public behavior identical and add one entry module that wires everything together.",
  },
  {
    id: "ts-to-js",
    name: "TypeScript → JavaScript",
    description: "Strip types, stay readable.",
    emoji: "🧼",
    category: "Convert",
    target: "JavaScript",
    prompt:
      "Convert this TypeScript back to clean ES2024 JavaScript. Remove type annotations, interfaces and generics, keep the runtime logic untouched, and keep JSDoc where it helps readability.",
  },
  {
    id: "game-to-java",
    name: "Game → Java (Swing)",
    description: "Java2D loop and controls.",
    emoji: "🎲",
    category: "Convert",
    target: "Java",
    prompt:
      "Port this game to a single-file Java Swing app: a proper game loop, keyboard controls and Java2D rendering that matches the original visuals as closely as possible.",
  },

  // -------------------------------------------------------------- Modernize
  {
    id: "es5-to-es2024",
    name: "ES5 → ES2024",
    description: "Modern syntax across the board.",
    emoji: "✨",
    category: "Modernize",
    target: "JavaScript",
    prompt:
      "Modernize ES5 code to ES2024: const and let, arrow functions, template literals, destructuring, default parameters, optional chaining and nullish coalescing. No behavior changes.",
  },
  {
    id: "var-to-scoped",
    name: "var → const / let",
    description: "Correct block scoping.",
    emoji: "🔐",
    category: "Modernize",
    target: "JavaScript",
    prompt:
      "Replace every var with const or let using correct block scoping. Where hoisting is currently relied on, restructure the code so it keeps working.",
  },
  {
    id: "callbacks-to-async",
    name: "Callbacks → async/await",
    description: "Promises, no pyramids.",
    emoji: "⏳",
    category: "Modernize",
    target: "JavaScript",
    prompt:
      "Rewrite callback-based asynchronous code as Promises with async/await. Preserve the exact ordering and error handling, and leave no callback pyramids behind.",
  },
  {
    id: "cjs-to-esm",
    name: "CommonJS → ESM",
    description: "import/export throughout.",
    emoji: "🔁",
    category: "Modernize",
    target: "JavaScript",
    prompt:
      "Convert CommonJS require and module.exports to ES module import/export syntax, handle interop details, and keep everything runnable on current Node.",
  },
  {
    id: "add-strict-types",
    name: "Add Strict Types",
    description: "Type everything, strict on.",
    emoji: "🧱",
    category: "Modernize",
    target: "TypeScript",
    prompt:
      "Add meaningful TypeScript types throughout: interfaces or type aliases for data shapes, explicit return types on exported functions, and strict mode enabled with zero errors.",
  },
  {
    id: "kill-any",
    name: "Erase every any",
    description: "No escape hatches left.",
    emoji: "🚧",
    category: "Modernize",
    target: "TypeScript",
    prompt:
      "Find every any annotation and unsafe cast, then replace them with accurate types or well-designed generics. The result must compile under strict mode with no any left.",
  },
  {
    id: "modern-dom",
    name: "Modern DOM APIs",
    description: "Move on from legacy calls.",
    emoji: "🎯",
    category: "Modernize",
    target: "JavaScript",
    prompt:
      "Modernize DOM code: querySelector over getElementById chains, classList over className surgery, dataset over getAttribute, and textContent or createElement over unsafe innerHTML.",
  },
  {
    id: "xhr-to-fetch",
    name: "XHR → fetch",
    description: "Awaitable network calls.",
    emoji: "📡",
    category: "Modernize",
    target: "JavaScript",
    prompt:
      "Replace every XMLHttpRequest with fetch and async/await, including response status checks, JSON parsing and proper error handling.",
  },

  // --------------------------------------------------------------- Refactor
  {
    id: "split-monolith",
    name: "Split the Monolith",
    description: "Focused files, one direction.",
    emoji: "🗂️",
    category: "Refactor",
    target: "Auto",
    prompt:
      "Split this project into focused files or modules with clear responsibilities and dependencies pointing in one direction. Keep all behavior and public entry points identical.",
  },
  {
    id: "extract-components",
    name: "Extract Components",
    description: "Reusable UI pieces.",
    emoji: "🧩",
    category: "Refactor",
    target: "TypeScript",
    prompt:
      "Find repeated or bulky UI and extract reusable components with clear props. No duplicated markup may remain, and the styling must stay unchanged.",
  },
  {
    id: "rename-for-clarity",
    name: "Rename for Clarity",
    description: "Names that explain intent.",
    emoji: "🏷️",
    category: "Refactor",
    target: "Auto",
    prompt:
      "Rename cryptic variables, functions and files to descriptive names that reflect intent. Keep public APIs stable and update every reference.",
  },
  {
    id: "dedupe",
    name: "Remove Duplication",
    description: "One source of truth per rule.",
    emoji: "🧬",
    category: "Refactor",
    target: "Auto",
    prompt:
      "Find repeated code blocks and extract shared helpers or abstractions, preserving behavior exactly. Prefer simple functions over clever indirection.",
  },
  {
    id: "flatten-nesting",
    name: "Flatten Deep Nesting",
    description: "Guard clauses, small functions.",
    emoji: "🪜",
    category: "Refactor",
    target: "Auto",
    prompt:
      "Flatten deeply nested conditionals and loops using guard clauses and early returns. Break oversized functions into small, well-named ones without changing behavior.",
  },
  {
    id: "dead-code-sweep",
    name: "Dead Code Sweep",
    description: "Delete what nothing uses.",
    emoji: "🧹",
    category: "Refactor",
    target: "Auto",
    prompt:
      "Identify and remove unused functions, variables, imports, CSS rules and assets. Double-check reachability before deleting anything, then list what was removed.",
  },
  {
    id: "organize-css",
    name: "Organize the CSS",
    description: "Structured, deduped styles.",
    emoji: "🧵",
    category: "Refactor",
    target: "Auto",
    prompt:
      "Reorganize the styles: group rules by component or section with consistent naming, remove duplicates and !important abuse, and keep the rendered result identical.",
  },
  {
    id: "apply-solid",
    name: "Apply SOLID",
    description: "Focused, injectable units.",
    emoji: "🏗️",
    category: "Refactor",
    target: "Auto",
    prompt:
      "Refactor toward SOLID principles: one responsibility per unit, dependencies passed in instead of hard-wired, and stable interfaces at the seams. Behavior must not change.",
  },

  // ---------------------------------------------------------------- Quality
  {
    id: "bug-hunt",
    name: "Hunt & Fix Bugs",
    description: "Find real bugs, explain them.",
    emoji: "🐛",
    category: "Quality",
    target: "Auto",
    prompt:
      "Carefully hunt for real bugs: off-by-one errors, wrong comparisons, race conditions and incorrect state updates. Fix each one and briefly explain what was wrong.",
  },
  {
    id: "null-safety",
    name: "Null-Safety Hardening",
    description: "No crashes on bad data.",
    emoji: "🛡️",
    category: "Quality",
    target: "Auto",
    prompt:
      "Harden this code against null and undefined, empty arrays, missing fields and failed lookups. Handle every path gracefully instead of throwing or crashing.",
  },
  {
    id: "error-handling",
    name: "Robust Error Handling",
    description: "Failures with clear messages.",
    emoji: "🚑",
    category: "Quality",
    target: "Auto",
    prompt:
      "Add proper error handling: try/catch at the right boundaries, meaningful messages, and no silently swallowed errors. Distinguish recoverable failures from fatal ones.",
  },
  {
    id: "fix-xss",
    name: "Fix XSS & Injection",
    description: "Escape all user-controlled data.",
    emoji: "🔒",
    category: "Quality",
    target: "Auto",
    prompt:
      "Audit for injection risks: escape or sanitize all user-controlled data, replace unsafe innerHTML with textContent or safe DOM building, and validate inputs before use.",
  },
  {
    id: "fix-memory-leaks",
    name: "Kill Memory Leaks",
    description: "Clean listeners and timers.",
    emoji: "🧠",
    category: "Quality",
    target: "JavaScript",
    prompt:
      "Find and fix memory leaks: remove event listeners that outlive their elements, cancel timers and animation frames, and clear references to detached DOM nodes and large objects.",
  },
  {
    id: "add-tests",
    name: "Add Tests",
    description: "Cover the core logic.",
    emoji: "🧪",
    category: "Quality",
    target: "Auto",
    prompt:
      "Add unit tests for the core logic: normal cases, edge cases and error paths. Keep the tests runnable with a minimal setup and give them clear names.",
  },
  {
    id: "accessibility-pass",
    name: "Accessibility Pass",
    description: "Keyboard, ARIA, contrast.",
    emoji: "♿",
    category: "Quality",
    target: "Auto",
    prompt:
      "Make this app accessible: semantic HTML, labels on every input, full keyboard navigation with visible focus, sensible ARIA where semantics are missing, and WCAG AA color contrast.",
  },
  {
    id: "performance-pass",
    name: "Performance Pass",
    description: "Faster load, less jank.",
    emoji: "⚡",
    category: "Quality",
    target: "Auto",
    prompt:
      "Optimize performance: cut unnecessary DOM updates and re-renders, cache repeated work, batch layout reads and writes, and defer non-critical work. Measure before and after where possible.",
  },

  // ----------------------------------------------------------------- Design
  {
    id: "dark-mode",
    name: "Add Dark Mode",
    description: "Theme toggle done right.",
    emoji: "🌙",
    category: "Design",
    target: "Auto",
    prompt:
      "Add a dark mode: CSS custom properties for colors, a toggle that persists the user's choice, and prefers-color-scheme respected on first visit. Both themes must look intentional.",
  },
  {
    id: "modern-refresh",
    name: "Modern UI Refresh",
    description: "A current, premium look.",
    emoji: "💎",
    category: "Design",
    target: "Auto",
    prompt:
      "Refresh the visual design: better typography scale, spacing rhythm, border radii, subtle shadows and tasteful gradients. Keep the layout structure and all functionality identical.",
  },
  {
    id: "responsive-pass",
    name: "Responsive Everywhere",
    description: "Great at any screen size.",
    emoji: "📱",
    category: "Design",
    target: "Auto",
    prompt:
      "Make the app fully responsive: mobile-first layout, sensible breakpoints, fluid type, tap-friendly targets, and no horizontal scrolling at any width down to 320px.",
  },
  {
    id: "css-to-tailwind",
    name: "CSS → Tailwind",
    description: "Utility classes in markup.",
    emoji: "🌬️",
    category: "Design",
    target: "Auto",
    prompt:
      "Convert the stylesheets to Tailwind utility classes in the markup. Map existing colors and spacing into the Tailwind scale, remove the now-unused CSS, and keep the design pixel-identical.",
  },
  {
    id: "loading-states",
    name: "Loading & Empty States",
    description: "Never a blank screen.",
    emoji: "📭",
    category: "Design",
    target: "Auto",
    prompt:
      "Add proper loading, empty and error states to every async view: skeletons or spinners while loading, helpful empty states, and friendly error messages with a retry action.",
  },
  {
    id: "micro-animations",
    name: "Micro-animations",
    description: "Polish that feels alive.",
    emoji: "🎞️",
    category: "Design",
    target: "Auto",
    prompt:
      "Add tasteful micro-animations: hover and press feedback, smooth enter and exit transitions, and subtle page transitions. Keep them fast and disable them under prefers-reduced-motion.",
  },

  // ------------------------------------------------------------------ Games
  {
    id: "canvas-physics",
    name: "Add 2D Physics",
    description: "Gravity, collisions, bounce.",
    emoji: "🪐",
    category: "Games",
    target: "JavaScript",
    prompt:
      "Add simple 2D physics to this canvas game: gravity, velocity integration, platform collisions and bounce or rest handling. Keep the code readable and the loop stable.",
  },
  {
    id: "sprite-animation",
    name: "Sprite Animation",
    description: "Frame-based and smooth.",
    emoji: "🧟",
    category: "Games",
    target: "JavaScript",
    prompt:
      "Add a sprite animation system: frame strips or sheets, per-entity play and pause, idle and walk states, and correct frame timing inside the game loop.",
  },
  {
    id: "game-state-machine",
    name: "Menus & Game States",
    description: "Start, pause, game over.",
    emoji: "🚦",
    category: "Games",
    target: "JavaScript",
    prompt:
      "Add a game state machine with menu, playing, paused and game-over screens, including smooth transitions, a restart flow and keyboard plus mouse support.",
  },
  {
    id: "highscores",
    name: "High Scores & Persistence",
    description: "A leaderboard that lasts.",
    emoji: "🏆",
    category: "Games",
    target: "JavaScript",
    prompt:
      "Add a scoring system with a local high-score leaderboard persisted to localStorage: top-10 entries, name entry on a new record, and a clean display screen.",
  },
  {
    id: "touch-controls",
    name: "Touch Controls",
    description: "Playable on phones too.",
    emoji: "👆",
    category: "Games",
    target: "JavaScript",
    prompt:
      "Add mobile touch controls to the game: on-screen buttons, swipe gestures or a virtual joystick as fits the game, with multi-touch support and no input lag.",
  },

  // ---------------------------------------------------------------- Analyze
  {
    id: "analyze-first",
    name: "Analyze Before Converting",
    description: "A plan before any code.",
    emoji: "🔍",
    category: "Analyze",
    target: "Auto",
    prompt:
      "Analyze this project without changing anything: file structure, dependencies, external APIs, tricky logic and risks. Then propose a conversion strategy with a file-by-file mapping and list open questions.",
  },
  {
    id: "explain-codebase",
    name: "Explain the Codebase",
    description: "A plain-language walkthrough.",
    emoji: "📖",
    category: "Analyze",
    target: "Auto",
    prompt:
      "Explain this codebase in plain language: its architecture, the main flows, where state lives and any gotchas a new developer should know. Use short sections and concrete examples.",
  },
  {
    id: "conversion-report",
    name: "Conversion Report",
    description: "Know what changed and why.",
    emoji: "📋",
    category: "Analyze",
    target: "Auto",
    prompt:
      "After converting the project, produce a report: what changed file by file, which behavior is identical, which deviates, and any manual follow-up steps required.",
  },
];
