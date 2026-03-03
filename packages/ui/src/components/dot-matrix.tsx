"use client"

import { cn } from "@litedag/ui/lib/utils"
import { useEffect, useRef } from "react"

function hash(a: number, b: number): number {
  let h = (a * 374761393 + b * 668265263) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) & 0x7fffffff) / 0x7fffffff
}

export const DotMatrix = ({
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize = 3,
  showGradient = true,
}: {
  opacities?: number[]
  colors?: number[][]
  containerClassName?: string
  dotSize?: number
  showGradient?: boolean
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const totalSize = 4
    const frequency = 5.0
    const r = colors[0]![0]!, g = colors[0]![1]!, b = colors[0]![2]!

    const pixels = opacities.map(o => {
      const a = (o * 255) | 0
      return (a << 24) | (((b * a / 255) | 0) << 16) | (((g * a / 255) | 0) << 8) | ((r * a / 255) | 0)
    })

    let rafId = 0
    let offsets: Float32Array | null = null
    let cachedImageData: ImageData | null = null
    let cols = 0, rows = 0, prevW = 0, prevH = 0

    function draw(time: number) {
      const dpr = window.devicePixelRatio || 1
      const w = Math.floor(canvas!.clientWidth * dpr)
      const h = Math.floor(canvas!.clientHeight * dpr)
      if (w === 0 || h === 0) return

      if (w !== prevW || h !== prevH) {
        canvas!.width = w
        canvas!.height = h
        prevW = w
        prevH = h
        offsets = null
        cachedImageData = ctx!.createImageData(w, h)
      }

      cols = Math.floor(w / totalSize)
      rows = Math.floor(h / totalSize)
      const count = cols * rows

      if (!offsets || offsets.length !== count) {
        offsets = new Float32Array(count)
        for (let i = 0; i < count; i++) {
          offsets[i] = hash(i % cols, (i / cols) | 0)
        }
      }

      // Check if any dot changed by sampling a few offsets
      const tBase = time / frequency
      let anyChanged = !cachedImageData
      if (!anyChanged) {
        for (let i = 0; i < count; i += 997) {
          const prev = Math.floor(tBase - 0.2 + offsets[i]! + frequency) | 0
          const curr = Math.floor(tBase + offsets[i]! + frequency) | 0
          if (prev !== curr) { anyChanged = true; break }
        }
      }
      if (!anyChanged) return

      const imageData = cachedImageData!
      const buf = new Uint32Array(imageData.data.buffer)
      buf.fill(0)

      const ox = ((w % totalSize) / 2) | 0
      const oy = ((h % totalSize) / 2) | 0

      for (let gy = 0; gy < rows; gy++) {
        const py = oy + gy * totalSize
        const rowOff = gy * cols
        for (let gx = 0; gx < cols; gx++) {
          const off = offsets[rowOff + gx]!
          const tf = Math.floor(tBase + off + frequency)
          const rand = hash(gx * tf + 1, gy * tf + 1)
          const pixel = pixels[(rand * 10) | 0]!

          const px = ox + gx * totalSize
          for (let dy = 0; dy < dotSize; dy++) {
            const base = (py + dy) * w + px
            for (let dx = 0; dx < dotSize; dx++) {
              buf[base + dx] = pixel
            }
          }
        }
      }

      ctx!.putImageData(imageData, 0, 0)
    }

    const startMs = performance.now()

    function tick(now: number) {
      draw((now - startMs) / 1000)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => { offsets = null })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [opacities, colors, dotSize])

  return (
    <div className={cn("h-full relative w-full", containerClassName)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-[84%]" />
      )}
    </div>
  )
}
