export function TactaIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 220" className={className} role="img" aria-label="Ilustrasi Tacta">
      <defs>
        <radialGradient id="tacta-glow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#123934" />
          <stop offset="100%" stopColor="#0b0c10" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="320" height="220" fill="url(#tacta-glow)" />

      {/* scattered grid dots, evoking the board */}
      <g fill="#2fb8a633">
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 12 }).map((_, col) => (
            <circle key={`${row}-${col}`} cx={20 + col * 26} cy={20 + row * 26} r="1.4" />
          ))
        )}
      </g>

      {/* covering shapes cluster, center-left */}
      <g transform="translate(110 95)">
        <rect x="-46" y="-46" width="70" height="70" fill="#9fc4ea" opacity="0.85" transform="rotate(-8)" />
        <circle cx="18" cy="6" r="34" fill="#2fb8a6" opacity="0.92" />
        <polygon points="0,-36 32,28 -32,28" fill="#f2d67e" opacity="0.9" transform="translate(46 4) rotate(6)" />
      </g>

      {/* isolated single shapes, right side, evoking defensive plays */}
      <g transform="translate(238 60)">
        <rect x="-16" y="-16" width="32" height="32" fill="#c97a7a" opacity="0.85" />
      </g>
      <g transform="translate(260 130)">
        <circle cx="0" cy="0" r="17" fill="#a9d18f" opacity="0.85" />
      </g>
      <g transform="translate(200 165)">
        <polygon points="0,-17 15,13 -15,13" fill="#a79bd1" opacity="0.85" />
      </g>

      {/* connecting lines to suggest board adjacency */}
      <g stroke="#2fb8a655" strokeWidth="1.5" strokeDasharray="3 4">
        <line x1="150" y1="95" x2="222" y2="60" />
        <line x1="150" y1="95" x2="200" y2="150" />
      </g>
    </svg>
  );
}
