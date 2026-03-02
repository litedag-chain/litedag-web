import { Geist, Geist_Mono, Inter_Tight, Space_Grotesk } from "next/font/google"

export const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const fontBrand = Inter_Tight({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-brand",
})

export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
})

export const fontVariables = `${fontSans.variable} ${fontMono.variable} ${fontBrand.variable} ${fontDisplay.variable}`
