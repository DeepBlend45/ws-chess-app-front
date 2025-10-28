<template>
  <div class="app">
    <h1>チェスアプリ</h1>

    <div class="connection">
      <input v-model="roomId" placeholder="ルームIDを入力" />
      <button @click="connect" :disabled="isConnected">接続</button>
      <p v-if="playerColor">あなたの色: {{ playerColor }}</p>
    </div>

    <div class="board" :class="{ locked: !!winner }">
      <div
        v-for="(piece, index) in board"
        :key="index"
        class="square"
        :class="{ 
          selected: index === selected,
          whiteSquare: (Math.floor(index / 8) + index) % 2 === 0,
          blackSquare: (Math.floor(index / 8) + index) % 2 !== 0
        }"
        @click="handleSquareClick(index)"
      >
        {{ piece }}
      </div>
    </div>

    <div v-if="winner" class="winner">勝者: {{ winner }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { createSocket } from "./websocket";
import { initBoard, movePiece, checkWinner, canMove, isPlayerPiece } from "./logic/board";
import type { MoveData } from "./logic/types";

const board = ref(initBoard());
const selected = ref<number | null>(null);
const playerColor = ref<"white" | "black" | null>(null);
const winner = ref<"white" | "black" | null>(null);
const socket = ref<ReturnType<typeof createSocket> | null>(null);
const roomId = ref("");
const isConnected = ref(false);

function connect() {
  if (!roomId.value) return;

  socket.value = createSocket(roomId.value, (data) => {
    // サーバーからのメッセージ種別を判定
    if (data.type === "assign_color") {
      playerColor.value = data.color;
      isConnected.value = true;
      return;
    }

    if (data.type === "move") {
      board.value = movePiece(board.value, data.from, data.to);
      winner.value = checkWinner(board.value);
    }
  });
}

function handleSquareClick(index: number) {
  if (!playerColor.value || winner.value) return;

  const piece = board.value[index];

  if (selected.value === null) {
    // 駒を選択
    if (piece && isPlayerPiece(piece, playerColor.value)) {
      selected.value = index;
    }
  } else {
    const from = selected.value;
    const to = index;

    // 同じマスを再度クリック → キャンセル
    if (from === to) {
      selected.value = null;
      return;
    }

    const piece = board.value[from];

    // 自分の駒しか動かせない
    if (!isPlayerPiece(piece, playerColor.value)) {
      selected.value = null;
      return;
    }

    // 合法手か判定
    if (canMove(from, to, board.value)) {
      // ローカル更新
      board.value = movePiece(board.value, from, to);
      winner.value = checkWinner(board.value);

      // WebSocket送信
      socket.value?.sendMove(from, to);
    }

    selected.value = null;
  }
}
</script>

<style scoped>
.app {
  text-align: center;
  font-family: sans-serif;
}

.connection {
  margin-bottom: 20px;
}

.board {
  display: grid;
  grid-template-columns: repeat(8, 60px);
  grid-template-rows: repeat(8, 60px);
  justify-content: center;
  margin: 20px auto;
  border: 2px solid #333;
}

.square {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 26px;
  cursor: pointer;
  user-select: none;
}

.whiteSquare {
  background-color: #222;
  color: #fff;
}

.blackSquare {
  background-color: #ddd;
  color: #000;
}

.selected {
  outline: 3px solid red;
}

.locked .square {
  pointer-events: none;
}

.winner {
  font-size: 24px;
  color: green;
  margin-top: 20px;
}
</style>
