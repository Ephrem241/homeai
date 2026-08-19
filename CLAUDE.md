# HomiAI — AI Real Estate Super App (Claude Code Build Doc)

> Working name: **HomiAI**. Rename if repo already has an approved name.
> Vision: *Find it. Understand it. Imagine it. Make it home.*
> Platform: **native mobile app** (iOS + Android), not a website.
> Market: **global from day one** — architecture, schema, and UI must not assume any single country. Addis Ababa, Ethiopia is simply the **first seed market** used to populate demo/launch data (neighborhoods, currency default, phone format). No product logic should be Ethiopia-specific; it should be config/data-driven so any city/country can be added the same way.

This doc replaces the original 53-section spec with something Claude Code can execute: fixed tech decisions, a data model, condensed design tokens, and an **8-phase incremental build plan**. Build one phase at a time. Do not attempt all phases in one pass — stop at the end of each phase, verify the "Definition of Done," then continue.

---

## 1. Tech Stack (decided — do not re-litigate per phase)

- **Framework:** React Native + Expo (managed workflow), TypeScript. Single codebase targeting iOS and Android.
- **Navigation:** React Navigation (bottom tabs + native stacks + modals/bottom sheets)
- **Styling:** NativeWind (Tailwind syntax for RN) or a themed StyleSheet system built from the design tokens below — pick one and apply consistently
- **Backend:** Separate API service (Node/TypeScript, e.g. NestJS or Express) — the mobile app is a pure client; do not couple UI code to server code
- **Database:** PostgreSQL via Prisma ORM (on the backend service)
- **Auth:** Phone OTP as primary (works globally, not Ethiopia-specific) + email/social login. Use a phone number library (e.g. libphonenumber) for international format validation, not a hardcoded Ethiopian pattern.
- **Maps:** Mapbox SDK for React Native (custom price markers, works globally)
- **i18n:** Localization framework wired in from Phase 0 (e.g. i18next / react-i18next), even though only English ships at launch — Amharic and others get added as translation files later, not as an architecture change
- **Currency:** Multi-currency support in the data model from the start (property stores price + currency code); display currency is a user/locale preference, not hardcoded ETB
- **AI:** Anthropic API (Claude) via the backend service (never called directly from the client) for: NL search parsing, property assistant chat, listing copy generation, investment/insight summaries. Image generation for AI Home Designer is a separate provider behind a swappable interface.
- **File storage:** S3-compatible bucket for property photos / design images
- **State/data fetching:** React Query
- **Push notifications:** Expo Notifications

If any of these conflict with an existing repo, keep the existing repo's choices and only apply the design/product spec below.

A companion marketing **website** (landing page, §7 of the original spec) can exist separately later, but it is out of scope for this build doc — this doc is the app.

---

## 2. Design Tokens (reference — put directly into `tailwind.config.ts`)

| Token | Hex | Usage |
|---|---|---|
| `navy` (primary) | `#0B1F33` | Nav, primary CTA, headings, selected states |
| `slate` (secondary) | `#263746` | Secondary text, dark surfaces |
| `gold` (accent) | `#C89B5D` | Verified badges, premium/investment highlights — sparing use only |
| `ivory` (bg) | `#F7F5F0` | App background |
| `white` (surface) | `#FFFFFF` | Cards, inputs, modals |
| `mist` (soft gray) | `#EEF1F3` | Secondary bg, skeletons, dividers |
| `charcoal` (text) | `#17212B` | Primary text |
| `slate-gray` (text-secondary) | `#68737D` | Secondary text |
| `success` | `#237A57` | Verified, available, positive signals |
| `warning` | `#D89B35` | Warnings |
| `error` | `#C94C4C` | Errors |

Color ratio target: ~60% ivory/white, 25% navy/slate, 10% gray, 5% gold.

**Radii:** sm 10px · md 16px · lg 22px · hero imagery 18–24px. Pills only for status/filter/tag chips — not general buttons.

**Type:** Inter (fallback Manrope). Confident large headings, generous spacing, restrained bold usage.

**Avoid:** gradients, neon, glassmorphism, generic "AI purple," dense forms, cheap stock-template UI.

---

## 3. Core Data Model (Prisma-style, condensed)

```
User        { id, name, phone, email, role[buyer|renter|agent|admin], savedProperties[], savedSearches[] }
Agent       { id, userId, businessName, verified, listings[], leads[] }
Property    { id, ownerId(Agent|User), type[apartment|house|land|commercial], purpose[buy|rent],
              title, description, price, currency[ETB|USD], bedrooms, bathrooms, areaSqm,
              furnished, parking, city, neighborhood, lat, lng, amenities[], photos[],
              status[draft|pending|verified|reported|unavailable], createdAt, updatedAt }
SavedSearch { id, userId, criteriaJson, alertsEnabled }
Lead        { id, agentId, propertyId, userId, status, createdAt }
Message     { id, threadId, senderId, propertyId?, body, attachments[] }
AIDesign    { id, userId, propertyId?, originalImage, generatedImage, roomType, style, createdAt }
AIInsight   { id, propertyId, score, breakdown{location,price,space,amenities,condition,investment}, confidence, generatedAt }
```

Extend, don't replace — but keep `city`/`neighborhood`/`country` as a foreign key to a `Location` table (country → city → neighborhood hierarchy), never enums, so new cities/countries plug in without a schema change. `currency` is always a currency-code field on the property (default at seed time is ETB for the Addis dataset), never a global constant.

---

## 4. Guardrails (apply to every phase, non-negotiable)

- AI never invents property facts. Listing Assistant only rewrites/organizes what the agent entered.
- All AI scores/estimates (property score, investment score, match %) are **labeled as AI-generated estimates**, shown with a confidence indicator, never phrased as guaranteed fact or legal verification.
- "Verified" (property) and "Agent Verified" (identity) are visually distinct badges — never implied to be interchangeable, never implied to be a legal/title verification.
- No fake scarcity, no manipulative countdown timers.
- No technical error messages surfaced to end users — always a plain-language fallback (see §8 patterns).
- Global-first, not retrofitted: no enum, form field, or validation pattern should assume one country. Phone validation, address structure, and currency must work for any locale — Addis Ababa/Ethiopia is only ever *seed data*, never a code path.

---

## 5. Build Phases

Work through these in order. Each phase should end in something runnable/demoable.

### Phase 0 — Scaffold
Expo + React Native + TypeScript init. Set up navigation shell (bottom tabs + stacks). Apply design tokens to the theme/styling system. Set up backend service + Prisma + Postgres, with a `Location` table seeded globally-structured but launch-populated with Addis Ababa neighborhoods (Bole, Kazanchis, CMC, Gerji, Yeka, etc.) plus ~20 realistic properties, a few agents, a few users. Wire up i18n scaffolding (English only for now).
**Done when:** app runs on iOS/Android simulators, backend + DB connected, design tokens visibly applied to a placeholder screen.

### Phase 1 — Design system & shell
Build reusable native components: buttons (primary/secondary/premium), inputs, search bar, property card, location card, verification badge, price badge, filter chip, bottom sheet, modal, segmented tabs, bottom nav (Home/Explore/Saved/AI/Profile). No desktop nav — this is a phone-first native app; larger-screen (tablet/iPad) layout adaptation happens in Phase 8, not a separate desktop nav.
**Done when:** a component demo screen shows every component in normal, empty, and loading-skeleton states on device.

### Phase 2 — Marketplace core (no AI yet)
Home screen (hero search bar as static input for now, quick actions Buy/Rent/Land/Commercial, Recommended, Popular Locations). Search results (list + map view, Mapbox price markers, native bottom-sheet for selected property). Property detail screen (gallery, specs, description, amenities, static map). Favorites. Basic filters (price, beds, type, location, currency) as a fallback alongside AI search. Location picker must support any country/city, not just Ethiopia.
**Done when:** a user can browse, filter, view detail, and favorite a property end to end with zero AI involvement, on device.

### Phase 3 — AI natural-language search
NL input → Claude API call → structured JSON criteria (location, type, purpose, bedrooms, budget, furnishing, parking) → editable chips UI → mapped to the Phase 2 filter/query logic.
**Done when:** typing the example query ("2 bedroom apartment in Bole under 60,000 ETB") produces correct editable chips and correct filtered results.

### Phase 4 — AI Property Assistant + Insights
Per-property chat assistant (Claude, property data as context, suggested questions). AI Property Score card with labeled breakdown + confidence disclaimer. Property comparison (2–4 properties, mobile-friendly, not a giant table). Investment Analysis as an optional premium panel (Strong/Moderate/Needs Review categories, explicit "not guaranteed advice" language).
**Done when:** assistant answers grounded in the property's actual data (no hallucinated facts), insight card renders with disclaimers.

### Phase 5 — Agent tools
Multi-step listing creation flow (10 steps per spec, save-as-draft at each step). AI Listing Assistant (title/description/tags generated from agent-entered facts only, fully editable before publish). Agent dashboard (overview metrics, listings by status, leads table, basic analytics).
**Done when:** an agent can create, get an AI-assisted description, publish, and see it appear (as "pending verification") in their dashboard.

### Phase 6 — AI Home Designer
Upload room image → select room type + style → generate redesign (behind a swappable image-gen interface — stub with a placeholder provider if none configured) → before/after compare → save/share. Save under "My Designs."
**Done when:** the full upload→generate→compare→save loop works with a stub or real image-gen backend.

### Phase 7 — Trust, admin, subscriptions
Verification states (Verified / Agent Verified / Pending / Reported) wired to real status transitions. Admin dashboard (users, agents, properties, verification queue, reports, basic analytics). Subscription tiers (Free/Plus/Pro/Agent Pro) as a pricing page + gating on 2–3 premium features (e.g., investment analysis, AI designer generations/month). Messaging (agent↔user, text + property attachment).
**Done when:** an admin can verify a pending listing and it flips status visibly on the frontend; a free user hits a clear (non-aggressive) upgrade prompt on a gated feature.

### Phase 8 — Polish
Empty states, error states, loading skeletons (replace spinners where feasible), micro-animations (card entrance, filter expansion, gallery transitions, AI generation progress), accessibility pass (contrast, touch targets, screen-reader labels, dynamic type support), tablet/iPad layout adaptation (not just a stretched phone layout), platform-specific polish (iOS vs Android nav/gesture conventions).
**Done when:** no raw technical error states remain, no unstyled loading spinners on primary flows, VoiceOver/TalkBack can navigate all core flows.

---

## 6. UX Copy Patterns to reuse

- Empty saved: *"Your next home starts here."*
- No results: *"We couldn't find an exact match."* → "Expand search" / "Let AI find similar properties"
- Generic error: *"Something went wrong. Please try again."*
- AI generation failure: *"We couldn't generate your design this time. Your image is safe — try again."*

---

## 7. Explicit Non-Goals for MVP

- The marketing/landing website (separate project, not this app)
- Shipping translations beyond English (i18n *architecture* is in from Phase 0, but only English strings ship)
- Real payment processing (stub payment provider integration behind an interface so region-specific providers can be swapped in later)
- Legal/title verification automation (verification badges are platform-level only, never a legal guarantee)
