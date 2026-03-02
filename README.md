# litedag-web

Turborepo monorepo for LiteDAG web properties.

## Apps

| App | Port | Domain |
|-----|------|--------|
| `apps/website` | 3000 | `litedag.com` |
| `apps/explorer` | 3001 | `explorer.litedag.com` |
| `apps/wallet` | 3002 | `wallet.litedag.com` |

## Packages

| Package | Description |
|---------|-------------|
| `packages/ui` | Shared shadcn components + theme |
| `packages/eslint-config` | Shared ESLint config |
| `packages/typescript-config` | Shared tsconfig |

## Development

```bash
pnpm dev           # all apps
pnpm build         # all apps
pnpm lint          # all apps
```

## Adding shadcn components

```bash
pnpm dlx shadcn@latest add button -c apps/website
```

Components go to `packages/ui/src/components/`, imported as:

```tsx
import { Button } from "@workspace/ui/components/button"
```
