

export type Coord = { r: number; c: number };

export function normalizedBounds(a: Coord, b: Coord) {
  const r1 = Math.min(a.r, b.r);
  const r2 = Math.max(a.r, b.r);
  const c1 = Math.min(a.c, b.c);
  const c2 = Math.max(a.c, b.c);
  return { r1, r2, c1, c2 };
}

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function createEmptyGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
}

export function createRowLabels(rows: number, prefix = "Label ") {
  return Array.from({ length: rows }, (_, i) => `${prefix}${i + 1}`);
}

export function createColHeaders(cols: number, prefix = "Head ") {
  return Array.from({ length: cols }, (_, i) => `${prefix}${i + 1}`);
}
