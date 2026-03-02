"use client"

import { EncryptedText } from "@litedag/ui/components/encrypted-text"

export function HeroSubtitle() {
  return (
    <EncryptedText
      text="The LiteDAG Protocol."
      className="text-primary"
      startDelayMs={800}
      revealDelayMs={40}
      flipDelayMs={30}
      encryptedClassName="opacity-30"
    />
  )
}
