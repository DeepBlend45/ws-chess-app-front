export interface MoveData {
    type: "move";
    from: number;
    to: number;
  }

  
export type ServerMessage = 
    | MoveData
    | { type: "assign_color"; color: "white" | "black" }
    | { type: "players_update"; players: ("white" | "black")[] };