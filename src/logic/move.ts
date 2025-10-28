// src/logic/move.ts
import type { Piece } from "./types";

/**
 * 指定座標の駒が白かどうかを判定
 */
export function isWhitePiece(piece: Piece): boolean {
  return piece === piece.toUpperCase();
}

/**
 * 駒の種類に応じた合法手判定
 * （単純化版：ポーン・ナイト・キング以外は水平垂直斜め移動のみ）
 */
export function isValidMove(piece: Piece, from: number, to: number, board: Piece[]): boolean {
  if (!piece) return false;

  const rowFrom = Math.floor(from / 8);
  const colFrom = from % 8;
  const rowTo = Math.floor(to / 8);
  const colTo = to % 8;

  const dr = rowTo - rowFrom;
  const dc = colTo - colFrom;

  const lower = piece.toLowerCase();

  switch (lower) {
    case "p": {
      const dir = isWhitePiece(piece) ? -1 : 1;
      const startRow = isWhitePiece(piece) ? 6 : 1;

      // 前進
      if (dc === 0 && board[to] === "") {
        if (dr === dir) return true;
        if (rowFrom === startRow && dr === 2 * dir && board[from + dir * 8] === "") return true;
      }
      // 斜め攻撃
      if (Math.abs(dc) === 1 && dr === dir && board[to] && isWhitePiece(board[to]) !== isWhitePiece(piece)) {
        return true;
      }
      return false;
    }

    case "r":
      return dr === 0 || dc === 0;

    case "b":
      return Math.abs(dr) === Math.abs(dc);

    case "q":
      return dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);

    case "n":
      return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);

    case "k":
      return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;

    default:
      return false;
  }
}

/**
 * 経路に駒がないか確認（ポーン・ナイト以外用）
 */
export function isPathClear(from: number, to: number, board: Piece[]): boolean {
  const rowFrom = Math.floor(from / 8);
  const colFrom = from % 8;
  const rowTo = Math.floor(to / 8);
  const colTo = to % 8;

  const dr = Math.sign(rowTo - rowFrom);
  const dc = Math.sign(colTo - colFrom);

  let r = rowFrom + dr;
  let c = colFrom + dc;

  while (r !== rowTo || c !== colTo) {
    if (board[r * 8 + c] !== "") return false;
    r += dr;
    c += dc;
  }
  return true;
}
