import { cn } from "@litedag/ui/lib/utils"

export function GridBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0",
        "[background-size:40px_40px]",
        "[background-image:linear-gradient(to_right,var(--color-muted-foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-muted-foreground)_1px,transparent_1px)]",
        "[mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]",
        "opacity-15 dark:opacity-20",
        className,
      )}
    />
  )
}
