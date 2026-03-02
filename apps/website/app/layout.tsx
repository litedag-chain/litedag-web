import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "@litedag/ui/globals.css"
import { Providers } from "@/components/providers"
import { SiteNav } from "@litedag/ui/components/site-nav"
import { SiteFooter } from "@litedag/ui/components/site-footer"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

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
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="flex min-h-svh flex-col">
            <SiteNav currentSite="website" />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
}
