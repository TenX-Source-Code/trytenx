You are building the TenX landing page as a single production-grade HTML file.
Do not split into multiple files. All CSS, JS, and HTML in one file.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN BIBLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aesthetic Direction: Dark industrial / precision instrument.
Think Bloomberg Terminal meets Vercel — serious data tool with one
neon accent that makes the score pop. NOT a generic AI startup page.
No purple gradients. No soft glows. No rounded hero blobs.

Color Tokens:
  --bg-base:       #0D0F14   /* near-black canvas */
  --bg-surface:    #13161D   /* card / section surfaces */
  --bg-elevated:   #1C2030   /* hover states, active rows */
  --accent-cyan:   #00E5FF   /* primary accent — scores, CTAs, highlights */
  --accent-green:  #22C55E   /* strong signal / pass */
  --accent-amber:  #EAB308   /* watch flag */
  --accent-red:    #EF4444   /* red flag */
  --text-primary:  #F0F4FF
  --text-secondary:#8B92A8
  --text-muted:    #444C63
  --border:        #1F2535
  --border-bright: #2D3550

Typography:
  Display font:  "Syne" (Google Fonts) — geometric, editorial weight 700/800
  Body font:     "IBM Plex Mono" (Google Fonts) — monospaced, data-native
  UI labels:     "Syne" 500 for nav/buttons
  All caps tracking used for section labels and stat callouts

Spatial Rules:
  - Generous vertical rhythm — sections breathe, never cramped
  - Left-aligned content blocks with right-side data/visual counterpart
  - Subtle horizontal rules between sections (1px, --border color)
  - Max content width: 1200px, centered
  - Section padding: 120px vertical on desktop, 64px mobile

Micro-aesthetic details:
  - Background: #0D0F14 with a very subtle noise texture overlay (SVG filter or CSS)
  - Accent lines: 1px cyan left-border on highlighted stat blocks
  - Score bars: thin rectangle fills, not rounded pill progress bars
  - Monospaced numbers everywhere — tabular-nums font-variant
  - No box shadows — use border instead for elevation signals
  - Selection color: background --accent-cyan at 30% alpha, text --bg-base
    (::selection { background: rgba(0,229,255,.3); color: #0D0F14; })
  - Caret color: --accent-cyan (on any input / textarea)
  - Custom scrollbar: 8px wide, track --bg-base, thumb --border-bright,
    thumb hover --accent-cyan. Firefox: scrollbar-color matches.
  - Focus ring: 1px --accent-cyan outline + 2px offset (no glow, no shadow)
  - Dark-only: declare <meta name="color-scheme" content="dark">. No light
    mode fallback — this is a deliberate stance, not an oversight.

──────────────────────────────────────
BACKGROUND AMBIENCE LAYER
──────────────────────────────────────
Treat the background as a first-class, named layer (think: a dedicated
<div class="ambience"> behind all content, pointer-events: none, z-index: 0).
It is a STACK of three contributions, applied in order:

  Layer A — Noise (always on):
    SVG feTurbulence filter or a tiny base64 noise PNG, opacity 0.03–0.05,
    mix-blend-mode: overlay. This is what stops the black from looking flat.

  Layer B — Precision grid (hero + CTA footer only):
    Faint 80px × 80px grid, lines 1px at rgba(45,53,80,0.25) (matches
    --border-bright at ~25% alpha). CSS: background-image with two
    linear-gradients. The grid gives hero/footer a "data surface" feel
    without cost. Do NOT apply to text-heavy middle sections — it
    fights the copy.

  Layer C — Cyan scan line (hero only, once on load):
    A single 1px horizontal cyan line sweeps top → bottom over ~1.4s
    after page load, then disappears. Pure decoration, signals
    "instrument booting up." Skip entirely under prefers-reduced-motion.

Rule: Ambience is atmosphere, never content. If a user has to look at it,
it's too loud. Turn it down until you almost can't see it, then stop.

──────────────────────────────────────
MICRO-DEMO PATTERNS (product-as-hero-art)
──────────────────────────────────────
Anywhere the product is shown (hero card, pillars, sample report), prefer
a living mockup over a static screenshot. Three patterns, pick one per
surface — do not mix within a single card:

  1. STATIC mockup — pure HTML/CSS, no motion. Used in: sample report
     deep dive (Section 6). Dense artifacts animate as noise.
  2. PLAY-ON-LOAD mockup — animates once when it enters the viewport,
     then rests. Used in: hero score card (count-up + bar fills),
     funnel (Section 7).
  3. INTERACTIVE mockup — responds to hover/pointer input, gives the
     visitor a taste of agency. Used in: hero pillar rows (hover a
     pillar, the big score number recomposes to show that pillar's
     contribution), pillar cards (hover reveals a 2s scan animation
     on the score bar).

Discipline: interactive demos must degrade gracefully to play-on-load
for touch devices (@media (hover: none)). Never require a hover to
understand the page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTIONS — COMPONENTS, WHY UI, ANIMATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

──────────────────────────────────────
SECTION 1: NAV
──────────────────────────────────────
Component:
  Fixed top bar. Left: "TENX" in Syne 800 + cyan dot after the X.
  Right: ghost links (How It Works / For Recruiters / Pricing) + solid
  cyan CTA button "Request Access" with no border-radius (sharp corners).
  Thin 1px border-bottom on scroll.

Why this UI:
  Fixed nav signals professionalism. Sharp CTA against ghost links
  creates instant hierarchy without noise.

Animation:
  On scroll past 80px: nav background transitions from transparent to
  --bg-surface with border-bottom fade in. 200ms ease.

──────────────────────────────────────
SECTION 2: HERO
──────────────────────────────────────
Component:
  Full viewport height. Two-column layout (55/45 split).
  LEFT:
    - Eyebrow label: "AI-NATIVE HIRING ASSESSMENT" in --text-muted,
      all caps, letter-spacing: 0.15em, IBM Plex Mono, 11px
    - H1: "Hire engineers who know how to work with AI." 
      Syne 800, ~72px, --text-primary. Line break after "who".
    - Subhead: "TenX measures AI leverage — how engineers prompt,
      iterate, and reason alongside AI tools. Not just what they ship."
      IBM Plex Mono, 16px, --text-secondary, max-width 480px.
    - Two buttons: "Request Early Access" (filled cyan, sharp) +
      "See a Sample Report" (ghost, --border-bright, sharp)
    - Below buttons: three inline stats in monospaced —
      "5 PILLARS  ·  25-PT SCALE  ·  ~60 MIN SESSION"

  RIGHT:
    - Live score card mockup — the TenX candidate report card component.
      Dark surface card (--bg-surface), 1px --border-bright border.
      Show: candidate handle, challenge name, AI Leverage Score big 
      number in cyan (e.g. "21/25"), five pillar rows with thin bar 
      fills (use --accent-cyan at varying widths), two signal badges 
      (✅ Strongest: Prompting Efficiency / ⚠️ Watch: Problem Understanding).
      This is an INTERACTIVE mockup (see MICRO-DEMO PATTERNS):
        · On hover of a pillar row, that row's bar brightens to full
          cyan, the big score number animates to show that single
          pillar's value (e.g. "05/05") with the denominator subtly
          dimmed, and a caption below swaps to that pillar's description.
          Mouse out → returns to total ("21/25") over 200ms ease-out.
        · Touch devices (@media hover: none): skip interaction,
          fall back to PLAY-ON-LOAD behavior only.
      Values recompose via CSS custom property swaps + a single JS
      event delegate — no framework, <40 lines of JS.

Why this UI:
  Score card on the right IS the product demo. Recruiters see exactly
  what they'll get before reading a word. Left column sells the why,
  right column shows the what.

Animation:
  On page load — staggered reveal:
    1. Eyebrow fades up (0ms delay)
    2. H1 fades up by line, word-by-word mask (150ms, 300ms)
    3. Subhead fades up (450ms)
    4. Buttons fade up (600ms)
    5. Stats fade up (750ms)
    6. Score card slides in from right + fades (400ms delay, 500ms duration)
  Score number in card counts up from 0 → 21 on load (JS counter, 800ms, ease-out).
  Pillar bars animate width from 0% to final value on load (staggered, CSS transition).

──────────────────────────────────────
SECTION 3: THE PROBLEM
──────────────────────────────────────
Component:
  Single-column centered. Section label: "THE GAP" in muted monospaced.
  Large pull quote style:
    "LeetCode tests what engineers know.
     TenX tests how they think with AI."
  Syne 700, ~48px. First line --text-secondary, second line --text-primary.
  Below: 2-col comparison table. Left: "Traditional OA" column, 
  Right: "TenX Assessment" column. Rows: what's measured, time, 
  signal type, false negatives. Use --border rows, monospace text.
  Right column values highlighted with cyan left-border treatment.

Why this UI:
  Pull quote creates a scrollable pause moment. Comparison table
  converts skeptics — recruiters using HackerRank need to see the
  delta immediately.

Animation:
  Intersection Observer — when section enters viewport:
  Pull quote words animate in left-to-right with stagger (20ms per word).
  Table rows fade up sequentially (50ms stagger per row).

──────────────────────────────────────
SECTION 4: HOW IT WORKS
──────────────────────────────────────
Component:
  Section label: "THE PROCESS". 
  Horizontal 4-step flow on desktop, vertical on mobile.
  Each step: number (01–04) in large cyan monospace + step title in
  Syne 700 + 1-sentence description in IBM Plex Mono.
  Steps: 01 Candidate invited → 02 Timed session in Codespace →
         03 AI logs captured → 04 Score delivered in <60s.
  Connecting line between steps (thin 1px --border-bright dashed line).

Why this UI:
  Numbered steps reduce "how does this actually work" anxiety for
  both recruiters and candidates. Dashed connector visualizes pipeline.

Animation:
  Steps reveal left-to-right on scroll enter, 100ms stagger.
  Dashed connector line draws in (stroke-dashoffset SVG animation or
  CSS width expansion) after step 1 appears.

──────────────────────────────────────
SECTION 5: THE FIVE PILLARS
──────────────────────────────────────
Component:
  Section label: "AI LEVERAGE SCORE — 5 PILLARS".
  Five cards in a row (desktop) / 2-col grid (mobile).
  Each card: --bg-surface, 1px border, sharp corners.
    - Pillar number (P1–P5) in muted monospace top-left
    - Pillar name in Syne 700
    - One-line description in IBM Plex Mono --text-secondary
    - Score bar (0–5 scale, static at 4 or 5 for demo)
  Below the grid: total score callout — "MAX SCORE: 25" 
  with signal language explanation 
  (Strong Signal / Moderate Signal / Limited Signal) as three
  inline badges.

Why this UI:
  Five-card layout mirrors the radar chart in the dashboard — same
  visual language across landing and product creates continuity.
  Badges make signal language tangible before recruiters ever log in.

Animation:
  Cards animate in on scroll with a stagger + subtle Y translate (24px → 0).
  Score bars fill on card enter (CSS transition, 600ms ease-out).

Interaction (INTERACTIVE mockup pattern):
  On card hover — a 1px cyan line sweeps across the score bar
  left-to-right in 800ms (CSS ::after with transform: translateX
  + overflow: hidden on the bar track). Signals "live measurement"
  without being noisy. Desktop only (@media hover: hover).

──────────────────────────────────────
SECTION 6: SAMPLE REPORT DEEP DIVE
──────────────────────────────────────
Component:
  Split layout. Left: sticky label + description copy.
  Right: scrollable expanded report mockup (full TenX report card from
  the eval agent output — all fields populated with sample data).
  Use the exact report format from the system:
    Candidate / Assessment / Time Taken header block
    AI Leverage Score big + bar
    Five pillar rows
    Key Signals (Strongest + Watch)
    Summary paragraph
    Recommendation badge
    Footer stats (Prompt Count, Iterations, AI Code Accepted, etc.)
  All in --bg-surface card, monospaced throughout, cyan accents on scores.

Why this UI:
  Recruiters buy on the report. Showing the full artifact — not a
  cropped teaser — removes "but what do I actually get" objections.
  Sticky left label keeps context as they scroll the report.

Animation:
  Report card fades in on scroll enter. No per-row animation — the
  card is dense, animate it as a unit to avoid visual noise.

──────────────────────────────────────
SECTION 7: SOCIAL PROOF / POSITIONING
──────────────────────────────────────
Component:
  Centered. Section label: "WHERE TENX SITS".
  Hiring funnel visualization — horizontal pipeline:
    [Resume Screen] → [LeetCode OA] → [TenX Assessment] → [Take-Home] → [Offer]
  TenX step highlighted in cyan. Other steps in --text-muted.
  Below: two placeholder quote cards (recruiter testimonial format —
  leave copy as [PLACEHOLDER] for now, styled with cyan left-border).

Why this UI:
  Funnel graphic answers "does this replace X" immediately.
  TenX's position (post-OA, pre-take-home) is non-obvious — 
  making it visual prevents the category confusion.

Animation:
  Funnel steps reveal left-to-right on enter, 80ms stagger.
  Arrow connectors draw in after each step.

──────────────────────────────────────
SECTION 7.5: LIVE METRICS STRIP
──────────────────────────────────────
Component:
  Full-width thin band between social proof and pricing. No card —
  just a 1px --border top + 1px --border bottom containing a single
  row of four oversized typographic stats, evenly distributed.
  Each stat: big number in Syne 800 (~56px) with tabular-nums, cyan
  accent on the number, label in IBM Plex Mono 11px --text-muted all
  caps below. Example set:
    25         ·   5           ·   <60s          ·   [PLACEHOLDER]
    MAX SCORE      PILLARS         TO REPORT         CANDIDATES SCORED

  The strip is dense with type, empty of chrome. Vertical padding
  only (48px top/bottom). Inspired by tensortonic's stat-callout
  pattern ("30,000+ active learners") — numbers as design.

Why this UI:
  A single typographic breath between the funnel and pricing that
  reinforces the product is real and measured. Recruiters skim —
  big numbers stop the scroll.

Animation:
  On scroll enter, numbers count up from 0 to final value (800ms
  ease-out, staggered 80ms). The "<60s" stat animates as a decreasing
  counter (60s → 1s → snaps to "<60s"). Under reduced-motion, values
  appear instantly.

──────────────────────────────────────
SECTION 8: PRICING SIGNAL
──────────────────────────────────────
Component:
  Simple two-card layout: "Pilot" + "Scale".
  Pilot: $[PLACEHOLDER] / assessment · up to 20 assessments ·
         full report · email support
  Scale: Custom pricing · volume · ATS integration · priority support
  Both cards: --bg-surface, sharp corners. Scale card gets a 
  cyan top-border accent (1px). CTA on each: "Request Access".
  Fine print below in muted monospace: "Pricing finalized with pilot partners."

Why this UI:
  Two tiers signals real product without locking in numbers.
  "Pricing finalized with pilot partners" is honest and creates
  urgency for early conversations.

Animation:
  Cards fade up together on scroll enter (no stagger — same tier level).

──────────────────────────────────────
SECTION 9: CTA FOOTER
──────────────────────────────────────
Component:
  Full-width dark section (--bg-surface). Centered.
  Large H2: "The engineers who work best with AI are a different tier."
  Subhead: "TenX finds them." (cyan, Syne 800, large)
  Single CTA button: "Request Early Access" — filled cyan, sharp, large.
  Email input + button combo as alternative (placeholder: "your@company.com").
  Below: "Built at UCF Upstarts · [PLACEHOLDER contact]"

Why this UI:
  Callback to the core thesis at the close. Dual entry (button + email)
  captures both click-happy and form-filling recruiter types.

Animation:
  H2 fades up. "TenX finds them." animates in 200ms later with a
  brief cyan text glow pulse (box-shadow on text, 1 cycle, then settles).

──────────────────────────────────────
GLOBAL ANIMATION RULES
──────────────────────────────────────
- All scroll-triggered animations use IntersectionObserver (threshold: 0.15)
- Base transition: opacity 0→1 + translateY 20px→0, duration 500ms, ease-out
- Stagger unit: 80–100ms between sequential children
- No animation on reduced-motion (prefers-reduced-motion: reduce → skip all)
- Hero animations fire on DOMContentLoaded, not scroll
- Never animate layout properties (width/height) — use transform + opacity only
  EXCEPTION: score bar fills use max-width transition (contained, no reflow risk)

──────────────────────────────────────
TECHNICAL REQUIREMENTS
──────────────────────────────────────
- Single HTML file. No external JS frameworks. Vanilla JS only.
- Google Fonts: load Syne (700, 800) + IBM Plex Mono (400, 500)
- CSS custom properties for all tokens (defined in :root)
- Mobile-first responsive. Breakpoints: 768px (tablet), 1200px (desktop)
- No placeholder images — use CSS geometry, SVG, or text-based mockups only
- All section IDs present for nav anchor links
- <meta> tags: title "TenX — AI-Native Hiring Assessment", description, og:title
- <meta name="color-scheme" content="dark"> — dark-only, no light fallback
- ::selection, caret-color, and custom scrollbar styles defined globally
- Ambience layer is a single <div class="ambience"> mounted once in <body>,
  pointer-events: none, z-index: 0. All content sits in a z-index: 1 wrapper.
- Interactive mockups degrade via @media (hover: none) → play-on-load only
- Styling: Tailwind Play CDN during development
  (<script src="https://cdn.tailwindcss.com"></script>) with inline
  tailwind.config mapping our tokens to theme.extend.colors. All
  custom CSS (selection, caret, scrollbar, ambience) lives in a single
  inline <style> block. PHASE 4 (optional production hardening):
  run the Tailwind CLI once to produce a static tailwind.css, inline
  it into <style>, and drop the CDN script.
- Page-specific JS budget (excluding Tailwind CDN): target <5KB
  minified total. No bundlers. Inline <script> only. Score-card
  interaction + IntersectionObserver reveals + count-up fit inside this.