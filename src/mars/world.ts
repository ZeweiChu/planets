export type Point = { x: number; z: number };
export type Obstacle = Point & { radius: number };
export const WALK_LIMIT = 40;
export const EYE_HEIGHT = 1.65;
export const START = { x: 6, z: 24, yaw: 0.12, pitch: -0.035 };
export const SITES = [
  { id: 'layers', x: -14, z: -8, visit: { x: -8, z: -1 }, radius: 10 },
  { id: 'sand', x: 18, z: -10, visit: { x: 14, z: -3 }, radius: 9 },
  { id: 'horizon', x: 3, z: -30, visit: { x: 3, z: -26 }, radius: 6 },
] as const;
export type SiteId = typeof SITES[number]['id'];

export function random(seed: number) {
  let n = seed >>> 0;
  return () => {
    n = (1664525 * n + 1013904223) >>> 0;
    return n / 4294967296;
  };
}
const smooth = (v: number) => v * v * (3 - 2 * v);
const hash = (x: number, z: number) => {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return n - Math.floor(n);
};
export function noise(x: number, z: number): number {
  const ix = Math.floor(x), iz = Math.floor(z);
  const a = smooth(x - ix), b = smooth(z - iz);
  const lo = hash(ix, iz) * (1 - a) + hash(ix + 1, iz) * a;
  const hi = hash(ix, iz + 1) * (1 - a) + hash(ix + 1, iz + 1) * a;
  return lo * (1 - b) + hi * b;
}
export function heightAt(x: number, z: number): number {
  const broad = (noise(x * .035, z * .035) - .5) * 3.3;
  const detail = (noise(x * .15, z * .15) - .5) * .45;
  const dune = Math.exp(-((x - 18) ** 2 + (z + 10) ** 2) / 190);
  const ripples = Math.sin(x * 2.6 + z * .7 + Math.sin(z * .4)) * .065 * dune;
  const lookout = Math.exp(-((x - 3) ** 2 + (z + 31) ** 2) / 230) * 2.4;
  return broad + detail + ripples + lookout;
}

export function canStand(point: Point, obstacles: readonly Obstacle[]) {
  return Math.abs(point.x) <= WALK_LIMIT && Math.abs(point.z) <= WALK_LIMIT &&
    obstacles.every(o => Math.hypot(point.x - o.x, point.z - o.z) >= o.radius + .38);
}

/** Small substeps prevent crossing a rock during a slow frame; axis sliding follows its edge. */
export function movePlayer(start: Point, delta: Point, obstacles: readonly Obstacle[]): Point {
  let { x, z } = start;
  const steps = Math.max(1, Math.ceil(Math.hypot(delta.x, delta.z) / .15));
  for (let i = 0; i < steps; i++) {
    const nx = Math.max(-WALK_LIMIT, Math.min(WALK_LIMIT, x + delta.x / steps));
    const nz = Math.max(-WALK_LIMIT, Math.min(WALK_LIMIT, z + delta.z / steps));
    if (canStand({ x: nx, z: nz }, obstacles)) { x = nx; z = nz; }
    else {
      if (canStand({ x: nx, z }, obstacles)) x = nx;
      if (canStand({ x, z: nz }, obstacles)) z = nz;
    }
  }
  return { x, z };
}
