import fs from 'node:fs';

export function readThemeTokens(path = 'src/styles/global.css'): Record<string, string> {
  const css = fs.readFileSync(path, 'utf8');
  const root = css.match(/:root\s*{(?<body>[\s\S]*?)}/)?.groups?.body ?? '';
  return Object.fromEntries(
    [...root.matchAll(/--(?<name>[\w-]+):\s*(?<value>#[\da-fA-F]{6})\s*;/g)].map((match) => [
      match.groups!.name,
      match.groups!.value,
    ]),
  );
}

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const channels = hex.match(/[\da-fA-F]{2}/g);
  if (!channels || channels.length !== 3) throw new Error(`Invalid six-digit hex color: ${hex}`);
  const [red, green, blue] = channels.map((value) => channel(Number.parseInt(value, 16))) as [
    number,
    number,
    number,
  ];
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first: string, second: string): number {
  const light = Math.max(luminance(first), luminance(second));
  const dark = Math.min(luminance(first), luminance(second));
  return (light + 0.05) / (dark + 0.05);
}
