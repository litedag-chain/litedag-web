"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@litedag/ui/lib/utils"

const tabs = [
  { label: "Blocks", href: "/" },
  { label: "Delegates", href: "/delegates" },
  { label: "Staking", href: "/staking" },
  { label: "Stats", href: "/stats" },
]

export function ExplorerNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-border/50">
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
        {tabs.map((tab) => {
          const active = tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-sm transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-3 bottom-0 h-px bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
