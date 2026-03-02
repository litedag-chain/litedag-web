"use client"

import { DotMatrix } from "@litedag/ui/components/dot-matrix"

export function HeroDotMatrix() {
  return (
    <div
      className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
      style={{
        maskImage: "linear-gradient(to left, black 20%, transparent 70%)",
        WebkitMaskImage: "linear-gradient(to left, black 20%, transparent 70%)",
      }}
    >
      <DotMatrix
        colors={[[94, 106, 210]]}
        opacities={[0.1, 0.1, 0.2, 0.4, 0.4, 0.6, 0.8, 0.8, 1, 1]}
        containerClassName="bg-transparent"
        dotSize={2}
        showGradient={false}
      />
    </div>
  )
}
