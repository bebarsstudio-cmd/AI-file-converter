/* eslint-disable @next/next/no-img-element -- the gallery serves remote stock photos */
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileCode2,
  FolderUp,
  Heart,
  Languages,
  Layers,
  Lightbulb,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wand2,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About — 1devv",
  description:
    "Why 1devv exists, how it works, and why it will always be free and open source.",
};

/** The public repository shown in the open-source section. */
const GITHUB_URL = "https://github.com/bebarsstudio-cmd/AI-file-converter";

const HERO_PHOTO = {
  src: "https://picsum.photos/seed/afc-hero/1600/720",
  alt: "A wide photograph representing the project",
};

const GALLERY = [
  {
    src: "https://picsum.photos/seed/afc-one/900/600",
    alt: "Late-night build session",
    caption: "Late-night build sessions — where most of this started.",
  },
  {
    src: "https://picsum.photos/seed/afc-two/900/600",
    alt: "Sketching conversion flows",
    caption: "Sketching conversion flows long before writing any of them.",
  },
  {
    src: "https://picsum.photos/seed/afc-three/900/600",
    alt: "The endless checklist of languages",
    caption: "An endless checklist of languages, and one tool to move between them.",
  },
  {
    src: "https://picsum.photos/seed/afc-four/900/600",
    alt: "Coffee, code and calm",
    caption: "Coffee, code, and the calm of a finished port.",
  },
];

const STEPS = [
  {
    icon: FolderUp,
    title: "1 · Bring your project",
    text: "Drop in HTML, CSS, JavaScript or TypeScript files — or a whole folder. ZIP archives and build-run verification are on the roadmap.",
  },
  {
    icon: MessageSquare,
    title: "2 · Describe the change",
    text: "Write it in plain language: “convert this game to C++ and keep the controls”, or pick one of 50 preset recipes. No config files, no flags.",
  },
  {
    icon: Wand2,
    title: "3 · The AI does the port",
    text: "Your project is analyzed, then rewritten into C++, Java, JavaScript or TypeScript — preserving structure, names and behavior as closely as it can.",
  },
  {
    icon: Rocket,
    title: "4 · Review and ship",
    text: "Download the converted code, diff it, tweak it. The verification pipeline (build, test, auto-repair) is coming in a later step.",
  },
];

const FEATURES = [
  {
    icon: FolderUp,
    title: "Files, folders & archives",
    text: "Upload individual files or whole folders. ZIP support is next on the list.",
  },
  {
    icon: Languages,
    title: "Four target languages",
    text: "C++, Java, JavaScript and TypeScript today; the preset system makes adding more straightforward.",
  },
  {
    icon: Layers,
    title: "50 preset recipes",
    text: "From “jQuery → Vanilla JS” to “Canvas Game → SDL2” — one click fills the prompt.",
  },
  {
    icon: Sparkles,
    title: "Create apps from scratch",
    text: "Describe an app and the AI writes a complete, previewable single-file web app — then transform it.",
  },
  {
    icon: ShieldCheck,
    title: "Your keys, your data",
    text: "The AI provider is configurable and server-side. Nothing is hard-wired to one vendor.",
  },
  {
    icon: Zap,
    title: "Built for free tiers",
    text: "Defaults to Groq's free tier, with OpenRouter, Mistral and any OpenAI-compatible host one env var away.",
  },
];

const FAQ = [
  {
    question: "Is this really free?",
    answer:
      "Yes — the whole app is designed around free AI tiers. It ships with a free Groq setup by default, and you can point it at OpenRouter, Mistral or your own OpenAI-compatible endpoint whenever you like. There is no paid plan, because there is no plan.",
  },
  {
    question: "What can I convert?",
    answer:
      "Anything that is made of text: web pages, scripts, stylesheets, small games, utilities. Right now conversions are a quick single pass over your code; the multi-file pipeline with build and test verification is the next big milestone.",
  },
  {
    question: "Will my project survive the trip?",
    answer:
      "The prompts are written to preserve behavior, naming and structure, and the roadmap includes a builder/repair loop that compiles the result and fixes what breaks. Until that lands, treat every conversion as a very strong first draft — then review it like you would a teammate's pull request.",
  },
  {
    question: "How can I contribute?",
    answer:
      "The repository is open on GitHub. Issues, ideas, preset recipes and pull requests are all welcome — the preset list is pure data, so adding your favorite conversion recipe is genuinely a one-file change.",
  },
];

function GithubMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      {/* Hero */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
          <Heart size={12} />
          Free &amp; open source
        </span>
        <h1 className="text-gradient mt-5 text-4xl font-bold md:text-5xl">
          About 1devv
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
          A free, AI-powered workshop that turns projects from one language into
          another — and keeps what made them yours.
        </p>
      </div>

      {/* Hero photo */}
      <figure className="mt-10">
        <img
          src={HERO_PHOTO.src}
          alt={HERO_PHOTO.alt}
          loading="lazy"
          className="h-64 w-full rounded-2xl border border-white/10 object-cover shadow-2xl shadow-purple-900/10 md:h-80"
        />
        <figcaption className="mt-2 text-center text-xs text-gray-500">
          Every port starts somewhere.
        </figcaption>
      </figure>

      {/* The long story */}
      <section className="mt-14 space-y-5 text-[15px] leading-relaxed text-gray-400">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Lightbulb size={22} className="text-purple-400" />
          Why this exists
        </h2>
        <p>
          Every developer has a drawer full of projects that deserve a second
          life: the canvas game that would be perfect in C++, the little web app
          that should run on the desktop, the pile of ES5 that predates every
          modern convenience. Rewriting them by hand is slow, boring, and
          exactly the kind of mechanical work machines should be doing — while
          the interesting decisions stay with you.
        </p>
        <p>
          1devv was built around one bet: a model that understands
          your project as a whole can port it faithfully — preserving behavior,
          naming and structure — as long as it is given the right context, the
          right instructions, and the freedom to work recipe by recipe instead
          of re-inventing your project from a vague description.
        </p>
        <p>
          So instead of a black box, you get a workshop. Upload your files.
          Describe the transformation the way you would describe it to a
          colleague. Pick a preset if you want a proven recipe. Watch the
          conversion happen, download the result, and keep building. No account
          maze, no credits, no paywall between you and your own code.
        </p>
        <p>
          The long-term goal is a full pipeline: an analyzer that maps your
          project, a converter that rewrites it, a builder that compiles it, and
          a repairer that fixes what the compiler complains about — looping
          until the code actually runs. That ladder is being climbed in the
          open, one rung per release, and everything you see here has been
          built in public from the very first commit.
        </p>
      </section>

      {/* How it works */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold text-white">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {STEPS.map((step) => (
            <div key={step.title} className="glass rounded-2xl p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
                <step.icon size={18} className="text-white" />
              </div>
              <h3 className="mt-3 font-semibold text-white">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold text-white">The project, in pictures</h2>
        <p className="mt-2 text-sm text-gray-500">
          A few photographs that capture the spirit of building this — you can
          replace these with anything you like.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {GALLERY.map((photo) => (
            <figure key={photo.src}>
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="h-48 w-full rounded-xl border border-white/10 object-cover transition-transform duration-300 hover:-translate-y-1"
              />
              <figcaption className="mt-2 text-xs text-gray-500">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-14">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <BadgeCheck size={22} className="text-purple-400" />
          What is inside
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2.5">
                <feature.icon size={17} className="text-purple-400" />
                <h3 className="font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Open source */}
      <section className="glass mt-14 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-2">
          <Star size={20} className="text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">
            Open source, and staying that way
          </h2>
        </div>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-gray-400">
          <p>
            Every line of this project lives on GitHub. That means you can read
            exactly how your code is handled, run the whole thing on your own
            machine, point it at your own AI provider, and change anything that
            annoys you. It also means the preset recipes, the prompts, and the
            roadmap are all out in the open — no hidden magic.
          </p>
          <p>
            If the project saves you an afternoon of porting, the best way to
            say thanks is a star on the repository. If something breaks, open an
            issue. If you have a conversion recipe you swear by, send a pull
            request — the whole preset catalog is one plain data file, so your
            recipe can ship the same day you write it.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-purple-900/20 transition-all hover:from-purple-500 hover:to-blue-500"
          >
            <GithubMark size={18} />
            Star on GitHub
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 font-medium text-gray-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <FileCode2 size={16} />
            Read the source
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-14">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <MessageSquare size={22} className="text-purple-400" />
          Questions people ask
        </h2>
        <div className="mt-6 space-y-4">
          {FAQ.map((item) => (
            <div key={item.question} className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-white">{item.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mt-14 text-center">
        <div className="glass rounded-2xl p-8">
          <Users size={24} className="mx-auto text-purple-400" />
          <h2 className="mt-3 text-2xl font-bold text-white">
            Come build something with it
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-400">
            The best way to understand a converter is to convert something.
            Bring a project, or let the AI create one for you to play with.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/create"
              className="btn-gradient flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-purple-900/20 transition-all hover:from-purple-500 hover:to-blue-500"
            >
              <Wand2 size={16} />
              Create an app
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 font-medium text-gray-300 transition-colors hover:border-white/20 hover:text-white"
            >
              Convert a project
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
