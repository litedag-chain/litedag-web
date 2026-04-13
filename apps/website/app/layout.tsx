import type { Metadata } from "next"

import "@litedag/ui/globals.css"
import { fontVariables } from "@litedag/ui/fonts"
import { Providers } from "@/components/providers"
import { SiteNav } from "@litedag/ui/components/site-nav"
import { SiteFooter } from "@litedag/ui/components/site-footer"
import { WebsiteBanners } from "@/components/website-banners"

export const metadata: Metadata = {
  title: {
    default: "LiteDAG",
    template: "%s | LiteDAG",
  },
  description:
    "The world's first MiniDAG — a novel system that simulates a DAG on a linear blockchain.",
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
            <SiteNav currentSite="website" />
            <WebsiteBanners />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
}
