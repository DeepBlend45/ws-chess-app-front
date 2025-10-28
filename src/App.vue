<template>
  <h2 v-if="!winner">現在は {{ turn }} のターンです</h2>
  <h2 v-else>{{ winner }} の勝利！</h2>
  <h4 v-if="!winner">選択中：{{ selected }}</h4>
  <div class="board">
    <div
      v-for="(square, index) in board"
      :key="index"
      class="cell"
      @click="select(index)"
    >
      {{ square }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { createSocket } from "./websocket";
import type { ServerMessage } from "./types";

const board = ref<string[]>(initBoard());
const selected = ref<number | null>(null);
const turn = ref<"white" | "black">("white"); 
const winner = ref<"white" | "black" | null>(null);

const socket = createSocket("test-room", (data:ServerMessage) => {
  if (data.type === "move") {
    movePiece(data.from, data.to);
    turn.value = turn.value === "white" ? "black" : "white"
    console.log("Turn Value: ",turn.value);
  }
});

function initBoard() {
  return [
    "♖","♘","♗","♕","♔","♗","♘","♖",
    "♙","♙","♙","♙","♙","♙","♙","♙",
    "","","","","","","","",
    "","","","","","","","",
    "","","","","","","","",
    "","","","","","","","",
    "♟","♟","♟","♟","♟","♟","♟","♟",
    "♜","♞","♝","♛","♚","♝","♞","♜",
    
  ];
}

function select(index:number) {
  if (winner.value) return;

  const piece = board.value[index];
  const myColor = socket.myColor();
  console.log(myColor);
  if(!myColor) return;

  if (selected.value === null) {
    if (( pieceIsWhite(piece) && myColor === "white") ||
        (  pieceIsBlack(piece) && myColor === "black")) {
      selected.value = index;
    }
  } else {
    if (isValidMove(board.value[selected.value],selected.value,index,board.value)){
      socket.sendMove(selected.value, index);
      movePiece(selected.value, index);
      turn.value = turn.value === "white" ? "black" : "white";
      selected.value = null;
      const result = checkWinner(board.value);
      if (result) {
        winner.value = result;
      }
    } else {
      selected.value = null;
    }
    
  }
}

function movePiece(from:number, to:number) {
  const piece: string = board.value[from];
  board.value[to] = piece;
  board.value[from] = "";
}

// ブラウザ表示に合わせて白黒を逆に定義
function pieceIsWhite(piece: string) {
  // ブラウザ上で白っぽく見える駒を「白」として扱う
  return ["♟","♜","♞","♝","♛","♚"].includes(piece);
}

function pieceIsBlack(piece: string) {
  // ブラウザ上で黒っぽく見える駒を「黒」として扱う
  return ["♙","♖","♘","♗","♕","♔"].includes(piece);
}

// ポーンの移動判定も逆向きにする
function isValidMove(piece: string, from: number, to: number, board: string[]): boolean {
  const fromRow = Math.floor(from / 8);
  const fromCol = from % 8;
  const toRow = Math.floor(to / 8);
  const toCol = to % 8;
  const target = board[to];

  // 同じ色の駒を取れない
  if (pieceIsWhite(piece) && pieceIsWhite(target)) return false;
  if (pieceIsBlack(piece) && pieceIsBlack(target)) return false;

  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  switch (piece) {
    case "♟": // ブラウザ上白ポーン（上向き）
      if (colDiff === 0 && rowDiff === -1 && target === "") return true;
      if (colDiff === 0 && rowDiff === -2 && fromRow === 6 && board[from - 8] === "" && target === "") return true;
      if (Math.abs(colDiff) === 1 && rowDiff === -1 && pieceIsBlack(target)) return true;
      return false;

    case "♙": // ブラウザ上黒ポーン（下向き）
      if (colDiff === 0 && rowDiff === 1 && target === "") return true;
      if (colDiff === 0 && rowDiff === 2 && fromRow === 1 && board[from + 8] === "" && target === "") return true;
      if (Math.abs(colDiff) === 1 && rowDiff === 1 && pieceIsWhite(target)) return true;
      return false;

    // ルーク・ナイト・ビショップ・クイーン・キングは従来通り
    case "♖": case "♜":
      if (rowDiff === 0 || colDiff === 0) return isPathClear(fromRow, fromCol, toRow, toCol, board);
      return false;

    case "♘": case "♞":
      return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);

    case "♗": case "♝":
      if (Math.abs(rowDiff) === Math.abs(colDiff)) return isPathClear(fromRow, fromCol, toRow, toCol, board);
      return false;

    case "♕": case "♛":
      if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) return isPathClear(fromRow, fromCol, toRow, toCol, board);
      return false;

    case "♔": case "♚":
      return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;

    default:
      return false;
  }
}


// ルーク・ビショップ・クイーンの経路が空か確認
function isPathClear(fromRow: number, fromCol: number, toRow: number, toCol: number, board: string[]): boolean {
  const rowStep = toRow === fromRow ? 0 : toRow > fromRow ? 1 : -1;
  const colStep = toCol === fromCol ? 0 : toCol > fromCol ? 1 : -1;

  let r = fromRow + rowStep;
  let c = fromCol + colStep;

  while (r !== toRow || c !== toCol) {
    if (board[r * 8 + c] !== "") return false;
    r += rowStep;
    c += colStep;
  }

  return true;
}

function checkWinner(board: string[]): "white" | "black" | null {
  const hasWhiteKing = board.includes("♔");
  const hasBlackKing = board.includes("♚");

  if (!hasWhiteKing) return "black";
  if (!hasBlackKing) return "white";
  return null;
}

</script>

<style>
.board {
  display: grid;
  grid-template-columns: repeat(8, 50px);
  width: 400px;
}
.cell {
  border: 1px solid #000;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
