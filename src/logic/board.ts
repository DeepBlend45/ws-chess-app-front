// src/logic/board.ts
import type { Piece } from "./types";
import { isPathClear, isValidMove, isWhitePiece } from "./move";

/**
 * 初期盤面を生成
 */
export function initBoard(): Piece[] {
  return [
    "r","n","b","q","k","b","n","r",
    "p","p","p","p","p","p","p","p",
    "","","","","","","","",
    "","","","","","","","",
    "","","","","","","","",
    "","","","","","","","",
    "P","P","P","P","P","P","P","P",
    "R","N","B","Q","K","B","N","R"
  ];
}

/**
 * 駒の移動を実行
 */
export function movePiece(board: Piece[], from: number, to: number): Piece[] {
  const newBoard = [...board];
  newBoard[to] = newBoard[from]!;
  newBoard[from] = "";
  return newBoard;
}

/**
 * 駒の移動が合法かどうかを包括的にチェック
 */
export function canMove(from: number, to: number, board: Piece[]): boolean {
  const piece = board[from];
  if (!piece) return false;
  if (!isValidMove(piece, from, to, board)) return false;
  if (["n", "p", "k"].includes(piece.toLowerCase())) return true;
  return isPathClear(from, to, board);
}

/**
 * 勝利条件：キングが取られたら勝ち
 */
export function checkWinner(board: Piece[]): "white" | "black" | null {
  const whiteKing = board.includes("K");
  const blackKing = board.includes("k");
  if (!whiteKing) return "black";
  if (!blackKing) return "white";
  return null;
}

/**
 * 駒がプレイヤーの色と一致するか確認
 */
export function isPlayerPiece(piece: Piece, color: "white" | "black"): boolean {
  return piece !== "" && isWhitePiece(piece) === (color === "white");
}
