type RosetteOpts = {
  size?: number;
  outerR: number;
  innerR: number;
  biteR: number;
  depth: number;
  count: number;
  bg?: string;
  ringColor?: string;
  text?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
};

export function generateRosetteSVG({
  size = 200,
  outerR,
  innerR,
  biteR,
  depth,
  count,
  bg = '#1f3550',
  ringColor = '#b974e4',
  text,
  textColor = '#1f3550',
  fontSize = 48,
  fontFamily = 'Inter, ui-sans-serif, system-ui',
}: RosetteOpts): string {
  const cx = size / 2;
  const cy = size / 2;

  const biteCenterR = outerR + biteR - depth;
  const step = 360 / count;

  const biteDef = `
    <g id="bite" transform="translate(${cx} ${cy})">
      <circle r="${biteR}" cx="${biteCenterR}" cy="0" />
    </g>
  `;

  const bites = Array.from({ length: count }, (_, i) => {
    const ang = step * i;
    return `<use href="#bite" transform="rotate(${ang} ${cx} ${cy})" />`;
  }).join('\n        ');

  const maybeBg =
    bg === 'none' ? '' : `<rect width="100%" height="100%" fill="${bg}"/>`;

  const maybeText = text
    ? `<text x="${cx}" y="${cy + fontSize * 0.35}" text-anchor="middle"
              font-size="${fontSize}" font-family="${fontFamily}"
              fill="${textColor}">${text}</text>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  ${maybeBg}
  <defs>
    <mask id="scalloped-ring">
      <rect width="100%" height="100%" fill="black"/>
      <!-- visible annulus -->
      <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="white"/>
      <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="black"/>
      <!-- bite circles (subtract from ring) -->
      <g fill="black">
        ${biteDef}
        ${bites}
      </g>
    </mask>
  </defs>

  <!-- draw scalloped ring -->
  <rect width="100%" height="100%" fill="${ringColor}" mask="url(#scalloped-ring)"/>

  ${maybeText}
</svg>`;
}
