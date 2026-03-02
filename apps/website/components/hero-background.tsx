"use client"

import { DottedGlowBackground } from "@litedag/ui/components/dotted-glow-background"

export function HeroBackground() {
  return (
    <DottedGlowBackground
      className="pointer-events-none mask-radial-to-90% mask-radial-at-center"
      opacity={0.7}
      gap={14}
      radius={1.4}
      colorLightVar="--color-muted-foreground"
      glowColorLightVar="--color-primary"
      colorDarkVar="--color-muted-foreground"
      glowColorDarkVar="--color-primary"
      backgroundOpacity={0}
      speedMin={0.2}
      speedMax={0.8}
      speedScale={0.6}
    />
  )
}
