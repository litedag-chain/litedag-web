# LiteDAG Design System

## Fonts

| Role | Family | Weight | CSS Variable |
|------|--------|--------|-------------|
| Body | Geist | 400 | `--font-sans` |
| Code | Geist Mono | 400 | `--font-mono` |
| Brand wordmark | Inter Tight | 600 | `--font-brand` |
| Display headlines | Space Grotesk | 400–700 | `--font-display` |

## Dark Palette

Blue-hued darks inspired by Linear. Every surface carries `chroma 0.01` at `hue 270` (blue) instead of pure neutral black.

| Token | OKLCH | Hex | Usage |
|-------|-------|-----|-------|
| `--background` | `oklch(0.07 0.01 270)` | `#0a0a14` | Page background |
| `--card` | `oklch(0.10 0.01 270)` | `#101018` | Cards, popovers |
| `--secondary` | `oklch(0.14 0.01 270)` | `#18181f` | Secondary surfaces, sidebar accent |
| `--muted` | `oklch(0.14 0.01 270)` | `#18181f` | Muted backgrounds |
| `--border` | `oklch(0.18 0.01 270)` | `#24242e` | Borders, inputs |
| `--muted-foreground` | `oklch(0.58 0.01 270)` | `#8a8a96` | Secondary text, nav links |
| `--foreground` | `oklch(0.93 0 0)` | `#ededed` | Primary text |
| `--primary` | `oklch(0.661 0.101 278.1)` | — | Indigo accent |
| `--accent` | `oklch(0.661 0.101 278.1)` | — | Same as primary |

## Design Principles

1. **Blue-hued darks** — no pure neutral black. Every dark surface has a subtle cool/blue undertone.
2. **High contrast text** — foreground stays bright (`0.93`), muted text is readable (`0.58`).
3. **Minimal color** — indigo accent only. No gradients, no multi-color schemes.
4. **Typography hierarchy** — Space Grotesk for display, Geist for body, uppercase tracking-widest for section labels.

## Component Patterns

### Navigation
- `h-14` sticky header, `bg-background/80 backdrop-blur-md`
- Active link: `text-foreground` + underline bar in `bg-primary`
- Inactive: `text-muted-foreground hover:text-foreground transition-colors`

### Footer
- Section headings: `text-xs font-semibold uppercase tracking-widest text-foreground`
- Links: `text-sm text-muted-foreground transition-colors hover:text-foreground`

### Sidebar (Docs)
- Section headings match footer: `text-xs font-semibold uppercase tracking-widest text-foreground`
- Links: `text-sm text-muted-foreground hover:text-foreground transition-colors`
- Sticky below nav: `top-[4.5rem]`

### Cards
- Base: `bg-card border border-border/50 rounded-xl`
- Hover: `hover:border-border transition-colors`
- Title: Space Grotesk via `font-display`
- Links inside: `text-muted-foreground hover:text-foreground transition-colors`

### Prose (MDX docs)
- `prose dark:prose-invert` with custom link color matching `--primary`
