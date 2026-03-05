"use client"

import { useCallback, useState } from "react"
import { EncryptedText } from "@litedag/ui/components/encrypted-text"
import { HeroDotMatrix } from "./hero-dot-matrix"
import { HeroGlobe } from "./hero-globe"

export function HeroSection() {
  const [globeReady, setGlobeReady] = useState(false)
  const onGlobeReady = useCallback(() => setGlobeReady(true), [])

  // h1: 18 chars × 25ms = ~450ms
  // description: 65 chars × 8ms = ~520ms, starts at 600ms, done ~1120ms
  // subtitle: 21 chars × 15ms = ~315ms, starts at 1300ms, done ~1615ms
  // globe: mounts at 1700ms (after all text is done)

  return (
    <section className="relative flex h-[calc(100svh-3.5rem)] items-center overflow-hidden">
      <HeroDotMatrix />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4 2xl:max-w-[85%]">
        <div className="flex max-w-lg flex-col gap-4 2xl:max-w-2xl 2xl:gap-6">
          <h1
            className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl 2xl:text-7xl"
            style={{ fontFamily: "var(--font-display), sans-serif", animation: "hero-fade-up 0.5s ease-out both" }}
          >
            The lightest DAG.
          </h1>
          <p
            className="max-w-md text-base leading-[1.65] text-muted-foreground/90 2xl:max-w-xl 2xl:text-xl"
            style={{ animation: "hero-fade-up 0.5s ease-out 0.15s both" }}
          >
            DAG benefits on a linear chain. Hybrid PoW/PoS with merge-mining.
          </p>
          <div style={{ animation: "hero-fade-up 0.5s ease-out 0.4s both" }}>
            <a
              href="/docs"
              className="group flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
            >
              <EncryptedText
                text="The LiteDAG Protocol."
                startDelayMs={400}
                revealDelayMs={15}
                flipDelayMs={10}
                encryptedClassName="opacity-30"
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <HeroGlobe onReady={onGlobeReady} delayMs={600} />
    </section>
  )
}
