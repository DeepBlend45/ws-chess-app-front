export function getPieceImage(piece: string): string | undefined {
    const map: Record<string, string> = {
      p: "/pieces/bP.svg",
      r: "/pieces/bR.svg",
      n: "/pieces/bN.svg",
      b: "/pieces/bB.svg",
      q: "/pieces/bQ.svg",
      k: "/pieces/bK.svg",
      P: "/pieces/wP.svg",
      R: "/pieces/wR.svg",
      N: "/pieces/wN.svg",
      B: "/pieces/wB.svg",
      Q: "/pieces/wQ.svg",
      K: "/pieces/wK.svg",
    };
    return map[piece] || undefined;
  }