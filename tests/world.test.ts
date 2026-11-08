import { describe, expect, test } from 'bun:test';
import { canStand, heightAt, movePlayer, WALK_LIMIT, SITES, START } from '../src/mars/world';
import { locales, matchLocale } from '../src/shared/locale';
import { messages } from '../src/mars/messages';

describe('walking', () => {
  test('stays inside the 80 meter field in every direction', () => {
    for (const x of [-100, 100]) for (const z of [-100, 100]) {
      const point = movePlayer({ x: 0, z: 0 }, { x, z }, []);
      expect(Math.abs(point.x)).toBe(WALK_LIMIT);
      expect(Math.abs(point.z)).toBe(WALK_LIMIT);
    }
  });
  test('cannot tunnel through a boulder even on a large movement step', () => {
    const obstacles = [{ x: 0, z: 0, radius: 2 }];
    const point = movePlayer({ x: -6, z: 0 }, { x: 15, z: 0 }, obstacles);
    expect(point.x).toBeLessThan(-2.37);
    expect(canStand(point, obstacles)).toBe(true);
  });
  test('slides along an obstacle rather than freezing both directions', () => {
    const point = movePlayer({ x: -2.5, z: 0 }, { x: 2, z: 2 }, [{ x: 0, z: 0, radius: 2 }]);
    expect(point.z).toBeGreaterThan(1.9);
    expect(Math.hypot(point.x, point.z)).toBeGreaterThanOrEqual(2.38);
  });
  test('standing still does not drift', () => {
    expect(movePlayer(START, { x: 0, z: 0 }, [])).toEqual({ x: START.x, z: START.z });
  });
  test('every landmark has a safe in-bounds approach and continuous ground', () => {
    const outcrop = Array.from({ length: 5 }, (_, column) => ({ x: -18 + column * 1.8, z: -9 + Math.sin(column) * 1.1, radius: 2 }));
    for (const site of SITES) {
      expect(canStand(site.visit, outcrop)).toBe(true);
      expect(Math.hypot(site.x - site.visit.x, site.z - site.visit.z)).toBeLessThan(site.radius);
    }
    for (let x = -40; x <= 40; x += 2) for (let z = -40; z <= 40; z += 2) {
      const h = heightAt(x, z);
      expect(Number.isFinite(h)).toBe(true);
      expect(Math.abs(heightAt(x + .1, z) - h)).toBeLessThan(.1);
    }
  });
});

describe('languages', () => {
  test('matches region variants and falls back predictably', () => {
    expect(matchLocale(['zh-TW'])).toBe('zh-Hant');
    expect(matchLocale(['zh-Hant-HK'])).toBe('zh-Hant');
    expect(matchLocale(['zh-CN'])).toBe('zh-Hans');
    expect(matchLocale(['xx', 'fr-CA'])).toBe('fr');
    expect(matchLocale(['ar-EG'])).toBe('ar');
    expect(matchLocale(['xx'])).toBe('en');
  });
  test('every supported language contains all UI copy and three observations', () => {
    const keys = Object.keys(messages.en).sort();
    for (const locale of locales) {
      expect(Object.keys(messages[locale]).sort()).toEqual(keys);
      expect(messages[locale].sites).toHaveLength(3);
      for (const value of Object.values(messages[locale])) if (typeof value === 'string') expect(value.trim().length).toBeGreaterThan(0);
      for (const site of messages[locale].sites) for (const value of Object.values(site)) expect(value.trim().length).toBeGreaterThan(0);
    }
  });
});
