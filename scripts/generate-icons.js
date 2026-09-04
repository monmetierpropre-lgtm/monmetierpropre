import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

mkdirSync(publicDir, { recursive: true });

const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2A4A7A"/>
      <stop offset="50%" stop-color="#1E345D"/>
      <stop offset="100%" stop-color="#0F1F3D"/>
    </linearGradient>
    <linearGradient id="bevelLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3D5F8F" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#1E345D" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bevelDark" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#0A1525" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#1E345D" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="copperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E8C49A"/>
      <stop offset="40%" stop-color="#D4A574"/>
      <stop offset="100%" stop-color="#B08850"/>
    </linearGradient>
    <linearGradient id="embossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3D5F8F" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#0A1525" stop-opacity="0.25"/>
    </linearGradient>
    <filter id="innerShadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="2" result="offsetblur"/>
      <feFlood flood-color="#0A1525" flood-opacity="0.5"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feComposite in2="SourceGraphic" operator="over"/>
    </filter>
    <filter id="textShadow">
      <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background with rounded corners -->
  <rect x="16" y="16" width="480" height="480" rx="32" ry="32" fill="url(#bgGrad)"/>

  <!-- 3D bevel highlights -->
  <rect x="16" y="16" width="480" height="480" rx="32" ry="32" fill="url(#bevelLight)" opacity="0.5"/>
  <rect x="16" y="16" width="480" height="480" rx="32" ry="32" fill="url(#bevelDark)" opacity="0.5"/>

  <!-- Inner border for bevel depth -->
  <rect x="24" y="24" width="464" height="464" rx="28" ry="28" fill="none" stroke="#3D5F8F" stroke-width="1.5" opacity="0.3"/>
  <rect x="20" y="20" width="472" height="472" rx="30" ry="30" fill="none" stroke="#0A1525" stroke-width="1.5" opacity="0.4"/>

  <!-- Embossed crossed hammer and wrench in background -->
  <g opacity="0.12" transform="translate(256 270)">
    <!-- Wrench (diagonal) -->
    <g transform="rotate(-45)">
      <rect x="-10" y="-110" width="20" height="160" rx="6" fill="url(#embossGrad)"/>
      <path d="M-22,-130 L-22,-118 L-10,-108 L-10,-95 L10,-95 L10,-108 L22,-118 L22,-130 L14,-140 L-14,-140 Z" fill="url(#embossGrad)"/>
      <circle cx="0" cy="50" r="14" fill="url(#embossGrad)"/>
    </g>
    <!-- Hammer (diagonal opposite) -->
    <g transform="rotate(45)">
      <rect x="-7" y="-80" width="14" height="140" rx="4" fill="url(#embossGrad)"/>
      <rect x="-32" y="-100" width="64" height="28" rx="6" fill="url(#embossGrad)"/>
      <rect x="-36" y="-104" width="12" height="36" rx="4" fill="url(#embossGrad)"/>
      <rect x="24" y="-104" width="12" height="36" rx="4" fill="url(#embossGrad)"/>
    </g>
  </g>

  <!-- Text MON -->
  <text x="256" y="210" text-anchor="middle" font-family="Arial Black, Helvetica, sans-serif" font-size="120" font-weight="900" fill="#FFFFFF" filter="url(#textShadow)" letter-spacing="4">MON</text>

  <!-- Text MÉTIER -->
  <text x="256" y="350" text-anchor="middle" font-family="Arial Black, Helvetica, sans-serif" font-size="88" font-weight="900" fill="url(#copperGrad)" filter="url(#textShadow)" letter-spacing="2">MÉTIER</text>

  <!-- Copper horizontal line at bottom -->
  <rect x="196" y="380" width="120" height="5" rx="2.5" fill="url(#copperGrad)"/>
</svg>
`;

// Save the SVG
writeFileSync(join(publicDir, 'logo.svg'), logoSvg);

const sizes = [
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-144.png', size: 144 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'pwa-192x192.png', size: 192 },
];

for (const { name, size } of sizes) {
  await sharp(Buffer.from(logoSvg))
    .resize(size, size)
    .png()
    .toFile(join(publicDir, name));
  console.log(`Generated ${name} (${size}x${size})`);
}

// Generate favicon.ico (32x32 PNG saved as .ico)
await sharp(Buffer.from(logoSvg))
  .resize(32, 32)
  .png()
  .toFile(join(publicDir, 'favicon.ico'));
console.log('Generated favicon.ico');

// Also generate a 16x16 favicon
await sharp(Buffer.from(logoSvg))
  .resize(16, 16)
  .png()
  .toFile(join(publicDir, 'favicon-16x16.png'));
console.log('Generated favicon-16x16.png');

console.log('All icons generated successfully!');
