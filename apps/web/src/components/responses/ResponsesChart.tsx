"use client";

import type { ResponseStats } from "@kaemform/shared";

const WIDTH = 600;
const HEIGHT = 160;
const PADDING_X = 8;
const PADDING_Y = 16;

export function ResponsesChart({ data }: { data: ResponseStats["perDay"] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = data.length > 1 ? (WIDTH - PADDING_X * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = PADDING_X + i * stepX;
    const y = HEIGHT - PADDING_Y - (d.count / max) * (HEIGHT - PADDING_Y * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${HEIGHT - PADDING_Y} L ${points[0]?.x ?? 0} ${HEIGHT - PADDING_Y} Z`;

  const first = data[0];
  const last = data[data.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-40 w-full">
        <defs>
          <linearGradient id="responseArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4DA3FF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#D6EBFF" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1={PADDING_X} y1={HEIGHT - PADDING_Y} x2={WIDTH - PADDING_X} y2={HEIGHT - PADDING_Y} stroke="#e2e8f0" />
        <path d={areaPath} fill="url(#responseArea)" stroke="none" />
        <path d={linePath} fill="none" stroke="#2E86DE" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      {first && last && (
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>{first.date}</span>
          <span>{last.date}</span>
        </div>
      )}
    </div>
  );
}
