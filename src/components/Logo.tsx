export default function Logo({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(180deg, #2A4A7A 0%, #1E345D 50%, #0F1F3D 100%)',
        boxShadow: 'inset 1px 1px 2px rgba(94, 124, 170, 0.4), inset -1px -1px 2px rgba(10, 21, 37, 0.6), 0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoCopper" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8C49A" />
            <stop offset="40%" stopColor="#D4A574" />
            <stop offset="100%" stopColor="#B08850" />
          </linearGradient>
        </defs>

        {/* Embossed crossed hammer and wrench */}
        <g opacity="0.12" transform="translate(256 270)">
          <g transform="rotate(-45)">
            <rect x="-10" y="-110" width="20" height="160" rx="6" fill="#3D5F8F" />
            <path d="M-22,-130 L-22,-118 L-10,-108 L-10,-95 L10,-95 L10,-108 L22,-118 L22,-130 L14,-140 L-14,-140 Z" fill="#3D5F8F" />
            <circle cx="0" cy="50" r="14" fill="#3D5F8F" />
          </g>
          <g transform="rotate(45)">
            <rect x="-7" y="-80" width="14" height="140" rx="4" fill="#3D5F8F" />
            <rect x="-32" y="-100" width="64" height="28" rx="6" fill="#3D5F8F" />
            <rect x="-36" y="-104" width="12" height="36" rx="4" fill="#3D5F8F" />
            <rect x="24" y="-104" width="12" height="36" rx="4" fill="#3D5F8F" />
          </g>
        </g>

        {/* Text MON */}
        <text
          x="256"
          y="210"
          textAnchor="middle"
          fontFamily="Arial Black, Helvetica, sans-serif"
          fontSize="120"
          fontWeight="900"
          fill="#FFFFFF"
          letterSpacing="4"
        >MON</text>

        {/* Text MÉTIER */}
        <text
          x="256"
          y="350"
          textAnchor="middle"
          fontFamily="Arial Black, Helvetica, sans-serif"
          fontSize="88"
          fontWeight="900"
          fill="url(#logoCopper)"
          letterSpacing="2"
        >MÉTIER</text>

        {/* Copper line */}
        <rect x="196" y="380" width="120" height="5" rx="2.5" fill="url(#logoCopper)" />
      </svg>
    </div>
  );
}
