export function BookshelfIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 220" className={className} role="img" aria-label="Ilustrasi Bookshelf">
      <defs>
        <radialGradient id="shelf-glow" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#3a2416" />
          <stop offset="100%" stopColor="#0b0c10" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="320" height="220" fill="url(#shelf-glow)" />

      {/* leaning stack of shelf cards / books */}
      <g transform="translate(110 170)">
        <rect x="-70" y="-14" width="140" height="14" rx="2" fill="#c9542c" opacity="0.9" />
        <rect x="-58" y="-30" width="116" height="16" rx="2" fill="#5f8fc4" opacity="0.9" />
        <rect x="-46" y="-48" width="92" height="18" rx="2" fill="#a9d18f" opacity="0.9" />
        <rect x="-34" y="-68" width="68" height="20" rx="2" fill="#e6b45c" opacity="0.92" />
        <rect x="-20" y="-90" width="40" height="22" rx="2" fill="#c97a7a" opacity="0.9" />
      </g>

      {/* cat perched on top */}
      <g transform="translate(110 100)" fill="#241b12">
        <ellipse cx="0" cy="0" rx="20" ry="13" />
        <circle cx="15" cy="-14" r="9" />
        <polygon points="9,-21 13,-30 17,-21" />
        <polygon points="17,-21 21,-29 24,-20" />
        <circle cx="18" cy="-15" r="1.4" fill="#e6b45c" />
        <path d="M-18 2 C-30 6 -34 -4 -26 -8" stroke="#241b12" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>

      {/* scattered single books, right side */}
      <g transform="translate(232 70)">
        <rect x="-9" y="-24" width="18" height="48" rx="2" fill="#9fc4ea" opacity="0.85" />
      </g>
      <g transform="translate(258 120)">
        <rect x="-9" y="-20" width="18" height="40" rx="2" fill="#f0a15c" opacity="0.85" transform="rotate(8)" />
      </g>
      <g transform="translate(60 60)">
        <rect x="-9" y="-18" width="18" height="36" rx="2" fill="#a79bd1" opacity="0.85" transform="rotate(-6)" />
      </g>

      {/* balance line motif */}
      <line x1="30" y1="188" x2="290" y2="188" stroke="#e6b45c55" strokeWidth="1.5" />
    </svg>
  );
}
