// ==============================
// websocket.ts
// ==============================

export type PlayerColor = "white" | "black";

export interface MoveData {
  type: "move";
  from: number;
  to: number;
}

export interface AssignColor {
  type: "assign_color";
  color: PlayerColor;
}

export type ServerMessage = MoveData | AssignColor;

export function createSocket(
  roomId: string,
  onMessage: (data: ServerMessage) => void
) {
  const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}`);
  let assignedColor: PlayerColor | null = null;

  // サーバーからの受信
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as ServerMessage;

      // 色の割り当てイベント
      if (data.type === "assign_color") {
        assignedColor = data.color;
      }

      onMessage(data);
    } catch (e) {
      console.error("WebSocket parse error:", e);
    }
  };

  // 接続時
  ws.onopen = () => {
    console.log("✅ WebSocket connected:", roomId);
  };

  // 接続エラー
  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  // 接続終了
  ws.onclose = () => {
    console.log("❌ WebSocket closed:", roomId);
  };

  return {
    sendMove(from: number, to: number) {
      if (ws.readyState === WebSocket.OPEN) {
        const move: MoveData = { type: "move", from, to };
        ws.send(JSON.stringify(move));
      } else {
        console.warn("WebSocket not connected, cannot send move");
      }
    },

    myColor(): PlayerColor | null {
      return assignedColor;
    },

    close() {
      ws.close();
    },
  };
}
