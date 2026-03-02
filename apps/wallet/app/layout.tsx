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
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
}
