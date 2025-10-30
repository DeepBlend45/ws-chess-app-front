<template>
    <div class="game">
      <h1>チェスゲーム</h1>
      <p v-if="playerCount < 2" class="waiting">対戦相手を待っています...</p>
      <p v-if="playerColor">あなたの色: {{ playerColor }}</p>
  
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
          <img
            v-if="piece"
            :src="getPieceImage(piece)"
            alt=""
            class="piece"
          />
        </div>
      </div>
  
      <div v-if="winner" class="winner">勝者: {{ winner }}</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { useRoute } from "vue-router";
  import { createSocket } from "../websocket";
  import { initBoard, movePiece, checkWinner, canMove, isPlayerPiece } from "../logic/board";
  import { getPieceImage } from "../logic/pieceImage";
  
  const route = useRoute();
  const roomId = route.params.roomId as string;
  
  const board = ref(initBoard());
  const selected = ref<number | null>(null);
  const playerColor = ref<"white" | "black" | null>(null);
  const winner = ref<"white" | "black" | null>(null);
  const socket = ref<ReturnType<typeof createSocket> | null>(null);
  const playerCount = ref(1);
  
  onMounted(() => {
    socket.value = createSocket(roomId, (data) => {
      if (data.type === "assign_color") {
        playerColor.value = data.color;
        return;
      }

      if (data.type === "player_count") {
        playerCount.value = data.count;
        return;
      }

      if (data.type === "move") {
        board.value = movePiece(board.value, data.from, data.to);
        winner.value = checkWinner(board.value);
      }
    });
  });
  
  function handleSquareClick(index: number) {
    if (playerCount.value < 2) return;
    if (!playerColor.value || winner.value) return;
  
    const piece = board.value[index];
  
    if (selected.value === null) {
      if (piece && isPlayerPiece(piece, playerColor.value)) {
        selected.value = index;
      }
    } else {
      const from = selected.value;
      const to = index;
  
      if (from === to) {
        selected.value = null;
        return;
      }
  
      const movingPiece = board.value[from];
      if (!isPlayerPiece(movingPiece, playerColor.value)) {
        selected.value = null;
        return;
      }
  
      if (canMove(from, to, board.value)) {
        board.value = movePiece(board.value, from, to);
        winner.value = checkWinner(board.value);
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
  
  .piece {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none; 
  }

  .waiting {
  text-align: center;
  margin-top: 20px;
  color: gray;
}
  
  </style>