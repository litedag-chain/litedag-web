import { cn } from "@litedag/ui/lib/utils"

const columns = [
  {
    title: "Protocol",
    links: [
      { label: "Website", href: "https://litedag.com" },
      { label: "Explorer", href: "https://explorer.litedag.com" },
      { label: "Wallet", href: "https://wallet.litedag.com" },
      { label: "Docs", href: "https://litedag.com/docs" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: "https://discord.gg/Kx5qtH6Jm2" },
      { label: "Twitter", href: "https://x.com/LiteDAGProtocol" },
      { label: "Telegram", href: "https://t.me/litedag_en" },
      { label: "Matrix", href: "https://matrix.to/#/#litedag:converser.eu" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "GitHub", href: "https://github.com/litedag-chain" },
      { label: "Node RPC", href: "https://node.litedag.com:6311" },
      { label: "Stratum", href: "stratum+tcp://node.litedag.com:6312" },
    ],
  },
]

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-border/50", className)}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2 font-semibold tracking-tight">
          <span className="text-primary">&#9671;</span>
          <span>LiteDAG</span>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex items-center justify-between border-t border-border/50 pt-6 text-xs text-muted-foreground">
          <span>&copy; 2026 LiteDAG</span>
          <span className="font-mono">LDG</span>
        </div>
      </div>
    </footer>
  )
}
