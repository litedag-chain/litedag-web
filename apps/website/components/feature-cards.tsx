"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { DotMatrix } from "@litedag/ui/components/dot-matrix"

export function FeatureCards({
  features,
}: {
  features: { title: string; description: string }[]
}) {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <FeatureCard key={f.title} title={f.title} description={f.description} />
      ))}
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
      className="group relative flex h-44 flex-col justify-between overflow-hidden bg-background p-5"
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
      <div className="relative z-10">
        <h3 className="text-base font-medium tracking-tight">{title}</h3>
      </div>
      <p className="relative z-10 text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors">
        {description}
      </p>
    </div>
  )
}
