export interface SignaturePoint {
  x: number;
  y: number;
  t: number;
  p?: number;
}

export interface SignatureStroke {
  points: SignaturePoint[];
  color: string;
  width: number;
}

export interface SignatureCanvasSize {
  width: number;
  height: number;
}

export interface SignatureData {
  strokes: SignatureStroke[];
  canvas: SignatureCanvasSize;
}
