// src/router.ts
import { createRouter, createWebHistory } from "vue-router";
import Lobby from "./views/Lobby.vue";
import Game from "./views/Game.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "Lobby", component: Lobby },
    { path: "/game/:roomId", name: "Game", component: Game, props: true },
  ],
});