import { describe, expect, test } from 'bun:test';
import { locales } from '../src/shared/locale';
import { PHOTO_META, PLANETS } from '../src/shared/planets.js';

// The overview's language files register themselves on window.I18N.
(globalThis as { window?: unknown }).window = globalThis;
for (const locale of locales) await import(`../lang/${locale}.js`);
const I18N = (globalThis as unknown as { I18N: Record<string, Record<string, any>> }).I18N;

/** Every key path and array length, so a missing card, list item or photo caption shows up as a difference. */
function shape(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) return [`${path}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  if (value && typeof value === 'object') return Object.keys(value).sort().flatMap(k => shape((value as Record<string, unknown>)[k], `${path}.${k}`));
  return [path];
}
const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();

describe('overview languages', () => {
  test('every locale has the same structure as English', () => {
    const { meta: _, ...en } = I18N.en;
    for (const locale of locales) {
      const { meta, ...rest } = I18N[locale];
      expect(meta.name.length).toBeGreaterThan(0);
      expect(shape(rest)).toEqual(shape(en));
    }
  });

  test('every world has text, a fun fact and one caption per photo in every locale', () => {
    for (const locale of locales) for (const p of PLANETS) {
      const t = I18N[locale];
      expect(t.planets[p.id]?.name?.length).toBeGreaterThan(0);
      expect(t.fun[p.id]?.length).toBeGreaterThan(0);
      expect(t.photos[p.id]).toHaveLength(PHOTO_META[p.id as keyof typeof PHOTO_META].length);
    }
  });

  test('interface strings keep their {placeholders}', () => {
    for (const locale of locales) for (const [key, value] of Object.entries(I18N.en.ui))
      if (typeof value === 'string') expect(`${key}: ${placeholders(I18N[locale].ui[key])}`).toBe(`${key}: ${placeholders(value)}`);
  });
});
