export function OdinIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 220" className={className} role="img" aria-label="Ilustrasi Odin">
      <defs>
        <radialGradient id="odin-glow" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#3a3418" />
          <stop offset="100%" stopColor="#0b0c10" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="odin-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2d67e" />
          <stop offset="100%" stopColor="#8a712c" />
        </linearGradient>
      </defs>

      <rect width="320" height="220" fill="url(#odin-glow)" />

      {/* aurora arcs */}
      <path d="M20 60 Q160 -10 300 60" stroke="#5f8fc4" strokeOpacity="0.35" strokeWidth="2" fill="none" />
      <path d="M10 85 Q160 25 310 85" stroke="#9fc4ea" strokeOpacity="0.2" strokeWidth="2" fill="none" />

      {/* left raven (Huginn) */}
      <g transform="translate(66 108)" fill="none" stroke="url(#odin-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 40 C-6 20 4 2 24 -6 C18 -2 14 4 14 10 C24 4 34 6 40 16 C30 14 24 18 22 26 C30 26 36 32 36 40" />
        <circle cx="20" cy="6" r="2" fill="url(#odin-gold)" stroke="none" />
      </g>

      {/* right raven (Muninn), mirrored */}
      <g transform="translate(254 108) scale(-1 1)" fill="none" stroke="url(#odin-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 40 C-6 20 4 2 24 -6 C18 -2 14 4 14 10 C24 4 34 6 40 16 C30 14 24 18 22 26 C30 26 36 32 36 40" />
        <circle cx="20" cy="6" r="2" fill="url(#odin-gold)" stroke="none" />
      </g>

      {/* valknut — Odin's knot of three interlocking triangles */}
      <g transform="translate(160 118)" stroke="url(#odin-gold)" strokeWidth="2.2" fill="none">
        <polygon points="0,-34 29,17 -29,17" />
        <polygon points="0,34 29,-17 -29,-17" transform="translate(0,0)" opacity="0.85" />
        <polygon points="-29,17 29,17 0,-34" opacity="0.55" transform="rotate(20)" />
      </g>

      {/* ground rune-line */}
      <line x1="30" y1="182" x2="290" y2="182" stroke="#d4af3755" strokeWidth="1.5" />
      <g stroke="#d4af3799" strokeWidth="1.6" strokeLinecap="round">
        <path d="M50 182 L50 168 L58 182 L58 168" />
        <path d="M150 182 L150 165 L142 172 L158 172 L150 165" />
        <path d="M262 182 L262 165 M262 173 L272 165 M262 173 L272 182" />
      </g>
    </svg>
  );
}
