"use client"

import { EncryptedText } from "@litedag/ui/components/encrypted-text"

export function HeroSubtitle({ startDelayMs = 1100 }: { startDelayMs?: number }) {
  return (
    <a
      href="/docs"
      className="group flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
    >
      <EncryptedText
        text="The LiteDAG Protocol."
        startDelayMs={startDelayMs}
        revealDelayMs={40}
        flipDelayMs={30}
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
  )
}
