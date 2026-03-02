"use client"

import { EncryptedText } from "@litedag/ui/components/encrypted-text"

export function HeroSubtitle() {
  return (
    <EncryptedText
      text="Meet the LiteDAG Protocol."
      className="text-primary"
      revealDelayMs={40}
      flipDelayMs={30}
      encryptedClassName="opacity-30"
    />
  )
}
