---
name: Obsidian Kinetic
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#bbcac0'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#85948b'
  outline-variant: '#3c4a42'
  surface-tint: '#47dfa4'
  primary: '#5bf0b3'
  on-primary: '#003825'
  primary-container: '#36d399'
  on-primary-container: '#00563a'
  inverse-primary: '#006c4a'
  secondary: '#ffb3b0'
  on-secondary: '#670211'
  secondary-container: '#881d24'
  on-secondary-container: '#ff9996'
  tertiary: '#a9deff'
  on-tertiary: '#00354a'
  tertiary-container: '#54c7ff'
  on-tertiary-container: '#00516f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#69fcbe'
  primary-fixed-dim: '#47dfa4'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b0'
  on-secondary-fixed: '#410006'
  on-secondary-fixed-variant: '#881d24'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#111317'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 3.5rem
    fontWeight: '600'
    lineHeight: 4rem
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '500'
    lineHeight: 2rem
    letterSpacing: -0.025em
  headline-sm:
    fontFamily: Geist
    fontSize: 1.25rem
    fontWeight: '500'
    lineHeight: 1.75rem
    letterSpacing: -0.02em
  title-md:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: '500'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.6rem
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.45rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  numeric-metric:
    fontFamily: Geist
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  label-md:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.04em
  label-caps:
    fontFamily: Geist
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is engineered for modern high-performance finance platforms, demanding absolute clarity, micro-tactility, and technical prestige. Borrowing from high-end developer platforms and minimalist fintech applications, it projects poise, precision, and sovereign control over capital. 

The aesthetic marries deep obsidian dark-mode backgrounds with razor-sharp micro-borders, translucent frosted glass overlays, and restrained neon bioluminescence. Rather than decorative bloat, depth and hierarchy are articulated through meticulous tonal layer stepping and delicate, atmospheric gradients. Interactions feel weighted, instant, and frictionless, instilling the immediate confidence of an institutional-grade financial terminal built for personal wealth tracking.

## Colors

The palette establishes an ultra-refined dark spectrum balanced by targeted, luminous accents designed for financial scannability.

- **Foundational Surfaces:** 
  - Base canvas: `#0B0D10`
  - Secondary grouping canvas: `#101318`
  - Elevated card & container surface: `#151920`
  - Active hover / interactive surface: `#1B2028`
  - Hairline structural border: `#282E38` (or `rgba(255, 255, 255, 0.08)`)

- **Financial Accents:**
  - **Primary (Positive Inflow / Net Worth / Health):** `#36D399` (Vibrant Emerald). Radiates controlled vitality against the dark substrate. Used for savings goals, investment returns, primary calls to action, and positive balance delta.
  - **Secondary (Outflow / Expense Alerts):** `#F87171` (Muted Coral Red). Softened to prevent visual fatigue while instantly communicating debit volumes and over-budget triggers.
  - **Tertiary (System Intelligence / Analytics):** `#38BDF8` (Electric Sky Blue). Denotes automated categorizations, sync states, and tooltips.

- **Ambient Luminescence:**
  - Ambient emerald backlights should utilize a radial gradient using `rgba(54, 211, 153, 0.08)` to `transparent`, never exceeding 15% opacity to maintain dark room contrast and readability.

## Typography

The type system is powered entirely by Geist, leveraging its precise horizontal metrics and modern technical cadence.

- **Financial Numerals:** All currency amounts (`₹`, `$`, `€`) and transaction ledger numbers must enable tabular figures via OpenType features (`font-variant-numeric: tabular-nums; font-feature-settings: "tnum" on, "zero" on`). This ensures ledger columns, decimals, and changing balances stay vertically aligned without jitter during live updates.
- **Micro Tight Tracking:** Headlines feature deliberate negative tracking (`-0.02em` to `-0.04em`) to establish the compact, high-density poise seen in modern developer suites.
- **System Labels:** Categorical badges and data table headers use `label-caps` styled with `text-transform: uppercase` to provide crisp delineations between labels and variable user data.

## Layout & Spacing

The layout is built upon an adaptive 12-column fluid grid system, bound to a maximum container width of 1440px on extra-wide monitors to maintain optical focus.

- **Mobile Viewports (< 768px):** Single-column stacked stream with `1rem` outer canvas padding. Ledger tables collapse into streamlined list cards with horizontal swipe affordances.
- **Tablet (768px - 1024px):** 8-column layout with fixed 240px collapsable navigation rail, 20px gutters, and 32px page margins.
- **Desktop (1024px+):** Full 12-column asymmetric grid. Standard arrangement reserves 3 columns for side navigation and quick-stats rails, 6 columns for financial feeds and charts, and 3 columns for categorical insights and card management.
- **Vertical Rhythm:** Spacing between atomic elements follows strict multiples of 4px and 8px (`0.5rem`, `1rem`, `1.5rem`). Layout modules are separated by consistent `2.5rem` (`space-xl`) intervals.

## Elevation & Depth

Visual hierarchy operates through surface pigmentation tiers and optical layering rather than heavy drop shadows:

- **Surface Progression:**
  - `Level 0 (Canvas)`: `#0B0D10`
  - `Level 1 (Sections/Sidebars)`: `#101318` with subtle border `#282E38`
  - `Level 2 (Cards/Containers)`: `#151920` with 1px top highlight (`rgba(255, 255, 255, 0.05)`)
  - `Level 3 (Hover/Overlays/Modals)`: `#1B2028` with subtle outer stroke `rgba(255, 255, 255, 0.12)`
- **Glassmorphic Floating Bars:** Navigation bars, status pills, and contextual tooltips use semi-transparent frosted surfaces: `background: rgba(21, 25, 32, 0.75)`, combined with `backdrop-filter: blur(16px)` and an ultra-thin 1px border `rgba(255, 255, 255, 0.08)`.
- **Radial Lighting:** Key data callouts (e.g., net total or budget surplus) utilize ambient back-glows: `box-shadow: 0 0 60px -15px rgba(54, 211, 153, 0.12)`.

## Shapes

The shape system blends structured container geometry with tactile pill accents:

- **Cards & Data Modules:** Medium roundedness (`0.5rem` / `8px` up to `0.75rem` / `12px`), delivering a crisp, high-density presentation that maximizes screen real estate for financial charts.
- **Pill Navigation & Floating Tags:** Interactive pill structures utilize a full `9999px` radius (`rounded-full`) for status tags, filter chips, secondary badge indicators, and floating header navigation.
- **Inner Sub-elements:** Nested items (e.g., transaction icons, input field inserts) mirror outer radii with an offset of 4px (`rounded-md` / `6px`) to ensure nested curvature harmony.

## Components

### Buttons
- **Primary Financial Action:** Emerald background (`#36D399`), dark contrast text (`#081A12`), bold weight. Subtle top inner highlight. Hover scales brightness: `filter: brightness(1.08)`.
- **Secondary / Ghost:** Transparent or `#151920`, 1px border `#282E38`, high-contrast white text (`#EDEDED`). On hover, transitions to `#1B2028` and border to `rgba(255, 255, 255, 0.18)`.
- **Destructive:** Coral-tinted background (`rgba(248, 113, 113, 0.1)`), coral border (`rgba(248, 113, 113, 0.25)`), text `#F87171`.

### Navigation Pill Bar
- Centered or floating top navigation encapsulated in a pill container (`border-radius: 9999px`).
- Backdrop blur (`blur(16px)`), background `rgba(16, 19, 24, 0.8)`.
- Active route highlighted by an internal pill container (`#1B2028` with subtle border `rgba(255, 255, 255, 0.08)`).

### Cards & Ledger Modules
- Base: `#151920`, border: `1px solid #282E38`.
- Card Header: `title-md` font with an optional pill badge on the top right.
- Transaction items inside cards feature alternating micro-hover transitions (`#1B2028`), separated by hair-thin dividers (`rgba(255, 255, 255, 0.04)`).

### Input Fields
- Dark input fills (`#101318`), border `1px solid #282E38`.
- Focus ring: 2px ring with `rgba(54, 211, 153, 0.35)` and border color `#36D399`.
- Amount Inputs: Dedicated left-affix container for currency symbols (`₹`, `$`) styled in muted gray `#6B7280` that shifts to emerald `#36D399` on focus.

### Chips & Filter Pills
- Compact height (28px - 32px), pill shape (`rounded-full`).
- Inactive: `#101318` background, `#282E38` border, text `#9CA3AF`.
- Active: `#1B2028` background, `rgba(54, 211, 153, 0.4)` border, text `#36D399`.