export function Logo({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top L */}
      <line x1="17" y1="3" x2="8" y2="18" stroke="currentColor" strokeWidth="1.5" opacity="0.75" />
      <line x1="8" y1="18" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" opacity="0.75" />
      <circle cx="17" cy="3" r="1.8" fill="currentColor" />
      <circle cx="8" cy="18" r="1.8" fill="currentColor" />
      <circle cx="18" cy="18" r="1.8" fill="currentColor" />
      {/* Bottom Γ */}
      <line x1="14" y1="14" x2="24" y2="14" stroke="currentColor" strokeWidth="1.5" opacity="0.75" />
      <line x1="24" y1="14" x2="15" y2="29" stroke="currentColor" strokeWidth="1.5" opacity="0.75" />
      <circle cx="14" cy="14" r="1.8" fill="currentColor" />
      <circle cx="24" cy="14" r="1.8" fill="currentColor" />
      <circle cx="15" cy="29" r="1.8" fill="currentColor" />
    </svg>
  )
}
