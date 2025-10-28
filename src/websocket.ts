
import type { ServerMessage , MoveData } from "./types";

export function createSocket(roomId:string, onMessage:(data:ServerMessage)=>void) {
    const socket = new WebSocket(`ws://localhost:8000/ws/${roomId}`);

    let myColor: "white" | "black" | null = null;
  
    socket.onmessage = (event) => {
      const data:ServerMessage = JSON.parse(event.data);
      console.log("Received Data: ",data);
      if (data.type === "assign_color") {
        myColor = data.color;
      }
      onMessage(data);
    };
  
    function sendMove(from:number, to:number) {
      if (!myColor) return;
      const move: MoveData = { type:"move",from ,to};
      socket.send(JSON.stringify(move));
    }
  
    return { sendMove, myColor: () => myColor };
  }
  