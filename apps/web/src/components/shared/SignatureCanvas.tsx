"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { SignatureData, SignaturePoint, SignatureStroke } from "@kaemform/shared";

const STROKE_COLOR = "#111827";
const STROKE_WIDTH = 2.25;
const CANVAS_HEIGHT = 150;

function midpoint(a: SignaturePoint, b: SignaturePoint): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: SignatureStroke) {
  const { points } = stroke;
  const first = points[0];
  if (!first) return;

  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(first.x, first.y, stroke.width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    if (!current || !next) continue;
    const mid = midpoint(current, next);
    ctx.quadraticCurveTo(current.x, current.y, mid.x, mid.y);
  }
  const last = points[points.length - 1];
  if (last) ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

function drawBaseline(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, height - 28);
  ctx.lineTo(width - 16, height - 28);
  ctx.stroke();
}

export interface SignatureCanvasProps {
  value: SignatureData | null;
  onChange: (value: SignatureData | null) => void;
  error?: string;
  className?: string;
}

export function SignatureCanvas({ value, onChange, error, className }: SignatureCanvasProps) {
  const t = useTranslations("signature");
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ width: 0, height: CANVAS_HEIGHT });
  const drawingRef = useRef<SignaturePoint[] | null>(null);
  const [strokes, setStrokes] = useState<SignatureStroke[]>(value?.strokes ?? []);

  const renderAll = useCallback((inProgress?: SignaturePoint[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { width, height } = sizeRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBaseline(ctx, width, height);
    for (const stroke of strokes) drawStroke(ctx, stroke);
    if (inProgress && inProgress.length > 1) {
      drawStroke(ctx, { points: inProgress, color: STROKE_COLOR, width: STROKE_WIDTH });
    }
  }, [strokes]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const width = Math.round(rect.width);
      const height = CANVAS_HEIGHT;
      sizeRef.current = { width, height };
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
      renderAll();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [renderAll]);

  useEffect(() => {
    renderAll();
  }, [renderAll]);

  const emitChange = useCallback(
    (nextStrokes: SignatureStroke[]) => {
      setStrokes(nextStrokes);
      onChange(nextStrokes.length === 0 ? null : { strokes: nextStrokes, canvas: { ...sizeRef.current } });
    },
    [onChange]
  );

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): SignaturePoint => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
      t: Date.now(),
      p: e.pressure > 0 ? e.pressure : undefined,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawingRef.current = [getPoint(e)];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current.push(getPoint(e));
    renderAll(drawingRef.current);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const points = drawingRef.current;
    if (!points) return;
    canvasRef.current?.releasePointerCapture(e.pointerId);
    drawingRef.current = null;
    if (points.length === 0) return;
    emitChange([...strokes, { points, color: STROKE_COLOR, width: STROKE_WIDTH }]);
  };

  const handleClear = () => emitChange([]);
  return (
    <div className={className}>
      <div
        ref={containerRef}
        className={cn(
          "w-full overflow-hidden rounded-input border bg-white",
          error ? "border-error" : "border-border"
        )}
      >
        <canvas
          ref={canvasRef}
          className="block w-full cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
      <div className="mt-2 flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={handleClear} disabled={strokes.length === 0}>
          {t("clear")}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
