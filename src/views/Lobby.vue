<template>
    <div class="lobby">
      <h1>チェスルーム</h1>
      <input v-model="roomId" placeholder="ルームIDを入力" />
      <button @click="joinRoom">参加</button>
    </div>
</template>
  
<script setup lang="ts">
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  
  const router = useRouter();
  const roomId = ref("");
  
  function joinRoom() {
    if (!roomId.value) return;
    router.push(`/game/${roomId.value}`);
  }
</script>
  
<style scoped>
  .lobby {
    text-align: center;
    margin-top: 100px;
  }
</style>