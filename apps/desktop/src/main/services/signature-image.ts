import { deflateSync } from "node:zlib";

interface SignaturePoint {
  x: number;
  y: number;
}

interface SignatureStroke {
  points: SignaturePoint[];
  color: string;
  width: number;
}

interface SignatureData {
  canvas: {
    width: number;
    height: number;
  };
  strokes: SignatureStroke[];
}

export interface SignaturePng {
  buffer: Buffer;
  width: number;
  height: number;
}

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function parseSignature(value: unknown): SignatureData | null {
  let candidate = value;
  if (typeof candidate === "string") {
    const trimmed = candidate.trim();
    if (!trimmed.startsWith("{")) return null;
    try {
      candidate = JSON.parse(trimmed) as unknown;
    } catch {
      return null;
    }
  }

  if (!candidate || typeof candidate !== "object") return null;
  const data = candidate as Partial<SignatureData>;
  const width = Number(data.canvas?.width);
  const height = Number(data.canvas?.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }
  if (!Array.isArray(data.strokes) || data.strokes.length === 0) return null;

  const strokes = data.strokes.flatMap((stroke) => {
    if (!stroke || !Array.isArray(stroke.points) || stroke.points.length === 0) return [];
    const points = stroke.points.flatMap((point) => {
      const x = Number(point?.x);
      const y = Number(point?.y);
      return Number.isFinite(x) && Number.isFinite(y) ? [{ x, y }] : [];
    });
    if (!points.length) return [];
    return [
      {
        points,
        color: typeof stroke.color === "string" ? stroke.color : "#111827",
        width: Number.isFinite(Number(stroke.width)) ? Number(stroke.width) : 2.25,
      },
    ];
  });

  return strokes.length
    ? {
        canvas: { width, height },
        strokes,
      }
    : null;
}

function parseColor(value: string): [number, number, number] {
  const hex = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return hex.split("").map((part) => Number.parseInt(part + part, 16)) as [
      number,
      number,
      number,
    ];
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
    ];
  }
  return [17, 24, 39];
}

function blendPixel(
  pixels: Buffer,
  width: number,
  height: number,
  x: number,
  y: number,
  color: [number, number, number],
  coverage: number
): void {
  if (x < 0 || y < 0 || x >= width || y >= height || coverage <= 0) return;
  const offset = (y * width + x) * 4;
  const sourceAlpha = Math.min(1, coverage);
  const targetAlpha = pixels[offset + 3] / 255;
  const outputAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);
  if (outputAlpha <= 0) return;

  for (let channel = 0; channel < 3; channel += 1) {
    pixels[offset + channel] = Math.round(
      (color[channel] * sourceAlpha +
        pixels[offset + channel] * targetAlpha * (1 - sourceAlpha)) /
        outputAlpha
    );
  }
  pixels[offset + 3] = Math.round(outputAlpha * 255);
}

function drawDisc(
  pixels: Buffer,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  radius: number,
  color: [number, number, number]
): void {
  const minX = Math.floor(centerX - radius - 1);
  const maxX = Math.ceil(centerX + radius + 1);
  const minY = Math.floor(centerY - radius - 1);
  const maxY = Math.ceil(centerY + radius + 1);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const distance = Math.hypot(x + 0.5 - centerX, y + 0.5 - centerY);
      blendPixel(pixels, width, height, x, y, color, radius + 0.6 - distance);
    }
  }
}

function drawSegment(
  pixels: Buffer,
  width: number,
  height: number,
  start: SignaturePoint,
  end: SignaturePoint,
  strokeWidth: number,
  color: [number, number, number]
): void {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const steps = Math.max(1, Math.ceil(distance * 1.5));
  const radius = Math.max(0.75, strokeWidth / 2);
  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    drawDisc(
      pixels,
      width,
      height,
      start.x + (end.x - start.x) * progress,
      start.y + (end.y - start.y) * progress,
      radius,
      color
    );
  }
}

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function encodePng(width: number, height: number, pixels: Buffer): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let row = 0; row < height; row += 1) {
    const targetOffset = row * (width * 4 + 1);
    scanlines[targetOffset] = 0;
    pixels.copy(scanlines, targetOffset + 1, row * width * 4, (row + 1) * width * 4);
  }

  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(scanlines, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

export function signatureToPng(value: unknown): SignaturePng | null {
  const data = parseSignature(value);
  if (!data) return null;

  const scale = Math.min(360 / data.canvas.width, 110 / data.canvas.height);
  const width = Math.max(1, Math.round(data.canvas.width * scale));
  const height = Math.max(1, Math.round(data.canvas.height * scale));
  const pixels = Buffer.alloc(width * height * 4);

  for (const stroke of data.strokes) {
    const color = parseColor(stroke.color);
    const points = stroke.points.map((point) => ({
      x: point.x * scale,
      y: point.y * scale,
    }));
    if (points.length === 1) {
      drawDisc(
        pixels,
        width,
        height,
        points[0].x,
        points[0].y,
        Math.max(0.75, (stroke.width * scale) / 2),
        color
      );
      continue;
    }
    for (let index = 1; index < points.length; index += 1) {
      drawSegment(
        pixels,
        width,
        height,
        points[index - 1],
        points[index],
        stroke.width * scale,
        color
      );
    }
  }

  return {
    buffer: encodePng(width, height, pixels),
    width,
    height,
  };
}
