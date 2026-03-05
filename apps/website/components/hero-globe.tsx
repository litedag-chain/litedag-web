"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import countries from "@/data/globe.json"

const World = dynamic(
  () => import("@litedag/ui/components/globe").then((m) => m.World),
  { ssr: false },
)

const ACCENT = "#6366f1"

const GLOBE_CONFIG = {
  pointSize: 4,
  globeColor: "#303040",
  showAtmosphere: true,
  atmosphereColor: "#4a4e9a",
  atmosphereAltitude: 0.2,
  emissive: "#0a0a1a",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(160,165,255,0.7)",
  ambientLight: "#334155",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: ACCENT,
  arcTime: 1200,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  autoRotate: true,
  autoRotateSpeed: 0.8,
}

const ARCS = [
  { order: 1, startLat: 50.1, startLng: 8.68, endLat: 38.95, endLng: -77.34, arcAlt: 0.3, color: ACCENT },
  { order: 2, startLat: 37.77, startLng: -122.42, endLat: 1.35, endLng: 103.82, arcAlt: 0.5, color: ACCENT },
  { order: 3, startLat: 52.52, startLng: 13.4, endLat: 37.57, endLng: 126.98, arcAlt: 0.4, color: ACCENT },
  { order: 4, startLat: 38.95, startLng: -77.34, endLat: -23.55, endLng: -46.63, arcAlt: 0.25, color: ACCENT },
  { order: 5, startLat: 1.35, startLng: 103.82, endLat: 35.68, endLng: 139.69, arcAlt: 0.15, color: ACCENT },
  { order: 6, startLat: 50.1, startLng: 8.68, endLat: 19.08, endLng: 72.88, arcAlt: 0.25, color: ACCENT },
  { order: 7, startLat: 37.77, startLng: -122.42, endLat: 35.68, endLng: 139.69, arcAlt: 0.45, color: ACCENT },
  { order: 8, startLat: 51.51, startLng: -0.13, endLat: 40.71, endLng: -74.01, arcAlt: 0.2, color: ACCENT },
  { order: 9, startLat: -33.87, startLng: 151.21, endLat: 1.35, endLng: 103.82, arcAlt: 0.2, color: ACCENT },
  { order: 10, startLat: 37.57, startLng: 126.98, endLat: 37.77, endLng: -122.42, arcAlt: 0.5, color: ACCENT },
]

export function HeroGlobe({ onReady, delayMs = 0 }: { onReady?: () => void; delayMs?: number }) {
  const [mounted, setMounted] = useState(delayMs === 0)

  useEffect(() => {
    if (delayMs === 0) return
    const id = setTimeout(() => setMounted(true), delayMs)
    return () => clearTimeout(id)
  }, [delayMs])

  return (
    <div className="pointer-events-none absolute -right-[15%] top-1/2 hidden aspect-square w-[min(800px,65vw)] -translate-y-1/2 lg:block 2xl:-right-[10%] 2xl:w-[min(1200px,70vw)]">
      {mounted && (
        <World
          globeConfig={GLOBE_CONFIG}
          data={ARCS}
          countries={countries as any}
          onReady={onReady}
        />
      )}
    </div>
  )
}
