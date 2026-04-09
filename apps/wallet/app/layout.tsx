import type { Metadata } from "next"

import "@litedag/ui/globals.css"
import { fontVariables } from "@litedag/ui/fonts"
import { Providers } from "@/components/providers"
import { SiteNav } from "@litedag/ui/components/site-nav"
import { SiteFooter } from "@litedag/ui/components/site-footer"

export const metadata: Metadata = {
  title: {
    default: "LiteDAG Wallet",
    template: "%s | LiteDAG Wallet",
  },
  description: "Web wallet for the LiteDAG blockchain.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontVariables} font-sans antialiased`}
      >
        <Providers>
          <div className="flex min-h-svh flex-col">
            <SiteNav currentSite="wallet" />
            <div className="border-b border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-center text-sm text-yellow-200">
              This web wallet is experimental. For a more battle-tested experience use the{" "}
              <a href="https://github.com/litedag-chain/litedag-blockchain/releases" className="underline hover:text-yellow-100">CLI wallet</a>.
              {" "}Use at your own risk.
            </div>
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
}
