# DESIGN_CONTEXT.MD — Prismalink (proto-style-frame)

Source of truth: `https://proto-style-frame.lovable.app/` (a Lovable-generated single-page app).
This document captures the design language, component inventory, tokens, routes, and
auth facts recovered from the served frontend assets (HTML + JS chunks + extracted CSS).

---

## 1. Product

**Prismalink** — a multi-merchant payment-acceptance platform (Indonesian payments).
Tagline rendered on the auth screen: *"Accept payments. Grow your revenue."*

Payment methods present in the bundle: **QRIS**, **Virtual Account (VA)**, **E-Wallet**,
**Credit/Debit Card**, **Bank Transfer**, and a hosted **Checkout** / **Payment Link** flow.

Key domain concepts observed: merchants, stores (multi-store), sandbox vs live
"environment" selector (`environment-store`, `dev-store`), payment links, payment
channels, transactions, settlements, user management with roles/permissions.

---

## 2. Tech stack (inferred from bundles)

| Concern | Evidence |
|---|---|
| UI framework | React (react-dom, jsx-runtime) |
| Router | TanStack Router (`@tanstack/react-router` — `__root__`, `fullPath`, `useRouter`) |
| Server/data | TanStack Query (`useQuery`, `useMutation`), `use-dashboard-data`, cursor pagination |
| State | TanStack Store (`useStore`, `with-selector`, deep-equal merge) |
| Styling | **Tailwind CSS v4** (CSS-first config, `@theme`, `--color-*`, `--text-*` tokens) |
| Validation | `zod` |
| Class helper | `clsx` |
| Icons | Lucide-style icon chunks (`ArrowLeftIcon`, `CreditCardIcon`, `SparkleIcon`, …) |
| Fonts | System stack (no webfont), plus `ui-monospace` for code/anumbers |

App is **server-side rendered** (TanStack Start-style stream barrier + hydration).

---

## 3. Design tokens (CSS `:root`)

### 3.1 Brand / semantic color
```css
--background:            oklch(100% 0 0)                    /* white */
--foreground:            oklch(12.9% .042 264.695)          /* near-black, cool */
--primary:               oklch(20.8% .042 265.755)          /* dark slate/indigo */
--primary-foreground:    oklch(98.4% .003 247.858)
--accent:                oklch(96.8% .007 247.896)          /* very light blue-gray */
--accent-foreground:     oklch(20.8% .042 265.755)

/* Prismalink brand blue (the star color) */
--surface-primary:       oklch(58.2% .216 258)              /* vivid indigo-blue */
--ring-active:           oklch(58.2% .216 258 / .15)
--border-active:         var(--surface-primary)
```

> Note: this app is an **anti-pattern of shadcn's dark-primary**: here `--primary` is
> dark and `--surface-primary` is the saturated brand blue. Buttons/active states lean
> on the blue (`surface-primary`); the dark `--primary` is used for primary text/actions
> on light surfaces.

### 3.2 shadcn/ui-compatible token set
```css
--card / --card-foreground            oklch(100% 0 0) / foreground
--popover / --popover-foreground      white / foreground
--muted / --muted-foreground          oklch(96.8% .007 247.896) / oklch(55.4% .046 257.417)
--secondary / --secondary-foreground  oklch(96.8% .007 247.896) / primary
--input                               oklch(92.9% .013 255.508)
--destructive / -foreground           oklch(57.7% .245 27.325) / white
--border / --sidebar-*                standard light tokens
```

### 3.3 Prismalink semantic token layer (content / surface / border / ring)
```css
--surface-secondary: var(--background)
--surface-disabled:  var(--color-slate-100)
--surface-success:   var(--color-emerald-50)
--surface-error:     var(--color-rose-50)
--content-secondary: var(--color-slate-500)
--content-disabled:  var(--color-slate-400)
--content-placeholder: var(--color-slate-300)
--content-inverse:   var(--background)
--content-success:   var(--color-emerald-600)
--content-error:     var(--color-rose-600)
--border-base:       var(--color-slate-200)
--border-success:    var(--color-emerald-300)
--border-error:      var(--color-rose-300)
--ring-success:      var(--color-emerald-100)
--ring-error:        var(--color-rose-100)
```
Tailwind v4 palettes exposed: `slate`, `rose`, `emerald`, `amber`, `orange`, `blue`,
`indigo`, `violet`, `fuchsia`, `purple`, `sky` (each `50–950`).

### 3.4 Chart palette
```css
--chart-1: oklch(64.6% .222 41.116)   /* red/orange */
--chart-2: oklch(60%  .118 184.704)   /* teal */
--chart-3: oklch(39.8% .07  227.392)  /* blue */
--chart-4: oklch(82.8% .189 84.429)   /* yellow */
--chart-5: oklch(76.9% .188 70.08)    /* orange */
```

### 3.5 Shape / spacing / type
```css
--radius:   .625rem   /* 10px — base corner radius */
--spacing:  .25rem    /* 4px — Tailwind v4 spacing unit */
--font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", ...
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
--text-3xl: 1.875rem (lh 2.25rem)   /* dashboard/hero titles */
--text-2xl: 1.5rem                  /* page titles */
```
Typography scale uses `--text-{xs..7xl}` with `--leading-tight/snug/relaxed` and
`--tracking-tight/tighter/wider/widest`. Shadows: `--shadow-spatial-card`.

---

## 4. Routes / page map

Lazy-route chunks reveal the full route tree. Root route (`/`) redirects via
`session` query: `session → /dashboard`, else `/login`.

### Auth (public) — wrapped in `AuthLayout`
```
/login            — email + password (see §7 creds), "Forgot password?" link, register link
/register         — merchant sign-up
/forgot-password
/reset-password
/accept-invite    — team invite acceptance
/complete-register — post-invite account completion
```
Auth screen: split layout, `logo.png`, left brand copy "Accept payments. Grow your
revenue.", background `auth-scene.jpg`, animated subspace/aurora backdrop.

### Authenticated (main shell)
```
/dashboard            — default home
/dashboard-classic    — legacy/alternate dashboard
/stores               — merchant stores (list + detail `/stores/$storeId`)
/payment-links        — payment link list + create `new`, preview, PaymentLinkPreview
/payment-channels     — configured payment methods/channels
/transactions         — transaction list (and `/transactions/$id` detail)
/settlement           — payouts/settlement + reports (endOfDay / endOfMonth)
/settings             — account/merchant settings
/user-management      — team members, roles & permissions
/development          — API keys / webhook / developer settings
/payment-simulator    — test payment simulator
```
Sub-route states observed: `new`, `pending`, `failed`, `success`, `form`, `template`,
`_id`, `_linkId`.

---

## 5. UI component inventory (chunk filenames)

### Primitives (shadcn-style)
`Button`, `Card`, `Badge`, `Input`, `Textarea`, `Select`, `Checkbox`, `Table`,
`Tabs`, `Modal`, `Drawer`, `Toast`, `Tooltip`, `Spinner`, `Menu-item`, `SecretField`
(password), `CopyLinkButton`, `CopyIcon`, `CodeBadge`, `Float` (floating label).

### Composite / domain
`PageContainer`, `Panel`, `DetailList`, `FilterTags`, `StickyActionBar`,
`DateRangeCalendar`, `UploadZone`, `ThemedPageBackground`, `AuthLayout`,
`PaymentLinkPreview`, `PaymentInstructions`, `ScaledPreview`, `DigitalAgreementViewer`,
`StorefrontIcon`, `PaymentMethodLogos`, `SetupGuideChecklist`, `SubmissionStep`,
`StoreCreationStepDefs`, `Achievements`, `BusinessDetailsCards`,
`CardFieldInput` (payment card entry), `aurora-shadow`.

### Icon set (Lucide-derived)
ArrowLeft/ArrowRight/ArrowSquareOut, Alert, Warning, WarningCircle, XCircle, Info,
CheckCircle, Clock, ClockCountdown, ChevronDown, Copy, CreditCard, Buildings,
Columns, DeviceMobile, DownloadSimple, Envelope, Eye/EyeSlash, FileText, HandCoins,
IdentificationCard, LockKey, Pencil, Plus, Prohibit, Search, ShieldWarning, Sparkle,
Storefront, Trash, Tray.

---

## 6. Interaction / UX conventions

- **Theming**: light theme by default; surfaces stack white → `slate-50/100`.
  `ThemedPageBackground` + `aurora-shadow` imply a layered gradient/aurora hero.
- **Feedback**: `Toast` notifications, `Spinner` for async, `PageLoader` route fallback.
- **Loading**: route-level `PageLoader`, query-level skeleton states via TanStack Query.
- **Forms**: floating labels (`Float`), `SecretField` with show/hide (Eye icons),
  `CardFieldInput` for card data, `Select` with custom option surface.
- **Tables/pagination**: `Table` + cursor-based pagination (`use-cursor-pagination`).
- **Filters**: `FilterTags` + `filters` store; sticky `StickyActionBar` for bulk actions.
- **Date ranges**: `DateRangeCalendar` for settlement/transaction reporting.

---

## 7. Auth / demo credentials

Default demo login observed in the deployment:

```
Email:    admin@test.com
Password: password123
```

Session is persisted and queried via the `session` TanStack Query; the root route
bounces unauthenticated users to `/login` and authenticated users to `/dashboard`.

---

## 8. Multi-tenant & role model

- **Stores**: merchant entities with detail pages, creation wizard (step defs), and a
  "current store" context (`current-store`, `stores`, `storefront`).
- **Environments**: sandbox vs live (`environment-store`, `dev-store`) — a channel picker.
- **Roles/permissions**: `permissions`, `useEffectiveRole`, `memberships`,
  `pending-invite`, `accept-invite` — team invitations with role-based access.
- **Agreements**: `sign-agreement`, `DigitalAgreementViewer` — merchant onboarding KYC.
