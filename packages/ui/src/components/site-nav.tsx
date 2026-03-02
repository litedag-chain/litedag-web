"use client"

import { useState } from "react"
import { cn } from "@litedag/ui/lib/utils"
import { ThemeToggle } from "@litedag/ui/components/theme-toggle"

export type SiteId = "website" | "explorer" | "wallet"

const SITES = [
  { id: "website" as const, label: "Website", path: "/" },
  { id: "explorer" as const, label: "Explorer", path: "/" },
  { id: "wallet" as const, label: "Wallet", path: "/" },
] as const

function getSiteUrl(site: (typeof SITES)[number], currentSite: SiteId): string {
  if (site.id === currentSite) return site.path

  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    const ports: Record<SiteId, number> = { website: 3000, explorer: 3001, wallet: 3002 }
    return `http://localhost:${ports[site.id]}`
  }

  const domains: Record<SiteId, string> = {
    website: "https://litedag.com",
    explorer: "https://explorer.litedag.com",
    wallet: "https://wallet.litedag.com",
  }
  return domains[site.id]
}

export function SiteNav({ currentSite }: { currentSite: SiteId }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <a
          href={getSiteUrl(SITES[0]!, currentSite)}
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="text-primary">&#9671;</span>
          <span>LiteDAG</span>
        </a>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex">
          {SITES.map((site) => {
            const active = site.id === currentSite
            return (
              <a
                key={site.id}
                href={getSiteUrl(site, currentSite)}
                className={cn(
                  "relative px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {site.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[calc(0.5rem+1px)] h-px bg-primary" />
                )}
              </a>
            )
          })}
          <a
            href={
              currentSite === "website"
                ? "/docs"
                : getSiteUrl(SITES[0]!, currentSite) + "/docs"
            }
            className="px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="flex flex-col border-t border-border/50 px-4 py-3 md:hidden">
          {SITES.map((site) => {
            const active = site.id === currentSite
            return (
              <a
                key={site.id}
                href={getSiteUrl(site, currentSite)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                onClick={() => setMenuOpen(false)}
              >
                {site.label}
              </a>
            )
          })}
          <a
            href={
              currentSite === "website"
                ? "/docs"
                : getSiteUrl(SITES[0]!, currentSite) + "/docs"
            }
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            Docs
          </a>
        </nav>
      )}
    </header>
  )
}
