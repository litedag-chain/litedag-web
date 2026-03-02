"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { DotMatrix } from "@litedag/ui/components/dot-matrix"

const GRID = 40
const CARD_W = GRID * 6   // 240px
const CARD_H = GRID * 3   // 120px
const COLS = 3
const ROWS = 2
const EXTEND_X = GRID * 20
const EXTEND_Y = GRID * 10

export function FeatureCards({
  features,
}: {
  features: { title: string; description: string }[]
}) {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute opacity-[0.12] dark:opacity-[0.18]"
        style={{
          inset: `-${EXTEND_Y}px -${EXTEND_X}px`,
          backgroundSize: `${GRID}px ${GRID}px`,
          backgroundImage: `linear-gradient(to right, var(--color-muted-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--color-muted-foreground) 1px, transparent 1px)`,
        }}
      />
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${CARD_W}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CARD_H}px)`,
        }}
      >
        {features.map((f) => (
          <FeatureCard key={f.title} title={f.title} description={f.description} />
        ))}
      </div>
    </div>
  )
}

function FeatureCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center justify-center overflow-hidden"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <DotMatrix
              colors={[[94, 106, 210]]}
              containerClassName="bg-transparent"
              dotSize={2}
              showGradient={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <span className={`relative z-10 text-sm font-medium transition-all duration-200 ${hovered ? "scale-95 opacity-0" : ""}`}>
        {title}
      </span>
      <span className={`absolute inset-0 z-10 flex items-center justify-center px-3 text-center text-xs leading-snug text-foreground/80 transition-all duration-200 ${hovered ? "opacity-100" : "opacity-0 scale-105"}`}>
        {description}
      </span>
    </div>
  )
}
