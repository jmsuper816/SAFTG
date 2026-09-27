import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, readThemeTokens } from '../helpers/theme';

const required = [
  'page-fallback',
  'surface',
  'surface-elevated',
  'ink',
  'ink-muted',
  'accent',
  'movement-up',
  'movement-down',
  'border',
  'focus-inner',
  'focus-outer',
] as const;

describe('football theme palette', () => {
  const tokens = readThemeTokens();

  it('defines every semantic color role and removes legacy theme roles', () => {
    expect(Object.keys(tokens)).toEqual(expect.arrayContaining([...required]));
    const css = fs.readFileSync('src/styles/global.css', 'utf8');
    expect(css).not.toMatch(/--(?:gold|mint|danger)\s*:/);
    expect(css).not.toMatch(/#(?:ffcb47|6ee7b7|fb7185)\b/i);
  });

  it.each([
    ['ink', 'surface'],
    ['ink', 'surface-elevated'],
    ['ink-muted', 'surface'],
    ['ink-muted', 'surface-elevated'],
    ['accent', 'surface'],
    ['accent', 'surface-elevated'],
    ['movement-up', 'surface'],
    ['movement-down', 'surface'],
  ] as const)('%s on %s meets normal-text contrast', (foreground, background) => {
    expect(contrastRatio(tokens[foreground]!, tokens[background]!)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['border', 'surface'],
    ['border', 'surface-elevated'],
    ['focus-inner', 'surface'],
    ['focus-outer', 'surface'],
  ] as const)('%s against %s meets non-text contrast', (foreground, background) => {
    expect(contrastRatio(tokens[foreground]!, tokens[background]!)).toBeGreaterThanOrEqual(3);
  });
});
