export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" stroke="var(--kl-jade)" strokeWidth="2" fill="var(--kl-jade-soft)" />
        <path
          d="M16 8 L12 16 L16 24 L20 16 Z"
          fill="var(--kl-jade)"
        />
      </svg>
      <span
        style={{ fontFamily: 'var(--font-manrope)' }}
        className="text-xl font-bold tracking-tight"
      >
        Klova
      </span>
    </div>
  );
}
