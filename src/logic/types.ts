// src/logic/types.ts
export type Color = "white" | "black";
export type Piece = string;

export interface MoveData {
  from: number;
  to: number;
}
