# Drop4Life — System Architecture & Design System

> **Platform Name:** Drop4Life  
> **Tagline:** Every Drop Can Save a Life.  

---

## 1. High-Level Technology Architecture

- **Frontend & App Framework:** Next.js 14/15 with App Router (`app/` directory).
- **Language & Type Safety:** TypeScript with strict checking (`strict: true`).
- **Styling Architecture:** Tailwind CSS with standardized CSS variables (`--primary`, `--primary-hover`, `--accent`, `--background`, `--card`, `--border`, `--muted`, `--destructive`, `--warning`, `--success`).
- **Icons:** Lucide React icons.
- **Form Handling:** React Hook Form with Zod schemas.
- **Data Visualization:** Recharts for analytics and inventory tracking.
- **Maps:** Leaflet & OpenStreetMap for geolocation visualizers.
- **Persistence & Backend:** Supabase Auth & PostgreSQL with Row Level Security (RLS).
- **Testing:** Vitest (Unit & Component tests) + Playwright (E2E workflows).

---

## 2. Directory Structure & Conventions

```
Drop4Life/
├── app/
│   ├── (auth)/             # Login & Multi-role Registration
│   ├── (public)/           # Landing, About, Find Blood, Compatibility, etc.
│   ├── (preview)/          # Design system & component preview (Dev only)
│   ├── donor/              # Donor Portal
│   ├── hospital/           # Hospital Portal
│   ├── ngo/                # NGO Portal
│   ├── api/                # Backend API Routes
│   ├── layout.tsx          # Root Layout with Font & Theme
│   ├── globals.css         # CSS Variables & Tailwind Directives
│   └── not-found.tsx       # Accessible 404 Page
├── components/
│   ├── ui/                 # Atomic UI (Button, Card, Input, Badge, Alert, Modal, etc.)
│   ├── layout/             # Header, Footer, DashboardShell, Sidebar, UserNav
│   ├── branding/           # Drop4Life Logo & Brand Mark
│   ├── feedback/           # Toasts, Empty States, Skeletons, Error Boundary
│   └── preview/            # Component Showcases for Design System
├── lib/
│   ├── types/              # Domain entities (User, Request, Inventory, Campaign)
│   ├── utils.ts            # Class merging (cn) & common formatters
│   ├── constants.ts        # Brand constants, navigation links, blood groups
│   └── compatibility.ts    # ABO/Rh compatibility business logic engine
├── docs/                   # Specifications, architecture, plans
└── tests/                  # Vitest unit and integration test suites
```

---

## 3. Design Tokens & Visual Hierarchy

### 3.1 Color System (HSL & HEX Reference)
- **Primary:** Deep Blood Red `hsl(0, 85%, 32%)` (`#990000`)
- **Primary Hover:** Dark Red `hsl(0, 85%, 25%)` (`#7A0000`)
- **Soft Accent / Blush:** Soft Coral Crimson `hsl(350, 95%, 95%)` (`#FFF0F2`)
- **Background:** Crisp White `hsl(0, 0%, 100%)` / Soft Neutral `hsl(210, 40%, 98%)`
- **Surface / Card:** Pure White `hsl(0, 0%, 100%)` with subtle border `hsl(214, 32%, 91%)`
- **Foreground Text:** Charcoal Slate `hsl(222, 47%, 11%)` (`#0F172A`)
- **Muted Text:** Medium Slate `hsl(215, 16%, 47%)` (`#64748B`)
- **Destructive / Urgent:** Crimson Red `hsl(0, 84%, 60%)` (`#DC2626`)
- **Warning:** Amber `hsl(38, 92%, 50%)` (`#F59E0B`)
- **Success:** Emerald Green `hsl(142, 71%, 45%)` (`#16A34A`)

### 3.2 Spacing & Radii
- **Border Radius:** Default card `0.625rem` (`10px`), Buttons `0.5rem` (`8px`), Badges `9999px` (Pill).
- **Shadows:** Subtle elevation `0 1px 3px 0 rgba(0,0,0,0.05)`, focus rings with offset.
