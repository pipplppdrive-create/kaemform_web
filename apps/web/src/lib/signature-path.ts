import type { SignatureStroke } from "@kaemform/shared";

/** Converts signature stroke points into an SVG path `d` attribute using quadratic-bezier smoothing. */
export function strokeToPath(stroke: SignatureStroke): string {
  const { points } = stroke;
  const first = points[0];
  if (!first) return "";

  if (points.length === 1) {
    return `M ${first.x} ${first.y} L ${first.x + 0.01} ${first.y + 0.01}`;
  }

  let d = `M ${first.x} ${first.y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    if (!current || !next) continue;
    const mx = (current.x + next.x) / 2;
    const my = (current.y + next.y) / 2;
    d += ` Q ${current.x} ${current.y} ${mx} ${my}`;
  }
  const last = points[points.length - 1];
  if (last) d += ` L ${last.x} ${last.y}`;
  return d;
}
