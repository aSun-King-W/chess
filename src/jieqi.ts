import {
  clonePieces,
  getLegalMoves,
  hasPoint,
  samePoint,
  startingPieces,
} from './game.js';
import type { Move, Piece, Position } from './game.js';

export type JieqiPiece = Piece & {
  hidden: boolean;
  revealed: boolean;
};

export type JieqiMoveResult = {
  pieces: JieqiPiece[];
  move: Move;
  movedPiece: JieqiPiece;
  captured?: JieqiPiece;
  revealed: boolean;
};

export function createInitialJieqiPieces(source: Piece[] = startingPieces): JieqiPiece[] {
  return clonePieces(source).map((piece) => {
    const revealed = piece.kind === 'king';
    return {
      ...piece,
      hidden: !revealed,
      revealed,
    };
  });
}

export function toDisplayJieqiPieces(pieces: JieqiPiece[], hiddenLabel = '暗'): Piece[] {
  return pieces.map((piece) => ({
    ...piece,
    label: isHiddenJieqiPiece(piece) ? hiddenLabel : piece.label,
  }));
}

export function isHiddenJieqiPiece(piece: JieqiPiece): boolean {
  return piece.hidden && !piece.revealed;
}

export function getJieqiLegalMoves(pieces: JieqiPiece[], pieceId: string): Position[] {
  const piece = findJieqiPiece(pieces, pieceId);
  return piece ? getLegalMoves(pieces, piece) : [];
}

export function applyJieqiMove(pieces: JieqiPiece[], pieceId: string, to: Position): JieqiMoveResult | null {
  const piece = findJieqiPiece(pieces, pieceId);
  if (!piece || !hasPoint(getLegalMoves(pieces, piece), to)) return null;

  const captured = getJieqiPieceAt(pieces, to);
  const revealed = isHiddenJieqiPiece(piece);
  const movedPieces = revealMovedPiece(moveJieqiPiece(pieces, pieceId, to), pieceId);
  const movedPiece = findJieqiPiece(movedPieces, pieceId);
  if (!movedPiece) return null;

  return {
    pieces: movedPieces,
    move: {
      pieceId,
      from: { x: piece.x, y: piece.y },
      to,
      captured,
      notation: formatJieqiMove(piece, to, captured, revealed),
    },
    movedPiece,
    captured,
    revealed,
  };
}

export function revealMovedPiece(pieces: JieqiPiece[], pieceId: string): JieqiPiece[] {
  return pieces.map((piece) => (piece.id === pieceId ? { ...piece, hidden: false, revealed: true } : piece));
}

export function findJieqiPiece(pieces: JieqiPiece[], pieceId: string): JieqiPiece | undefined {
  return pieces.find((piece) => piece.id === pieceId);
}

export function getJieqiPieceAt(pieces: JieqiPiece[], position: Position): JieqiPiece | undefined {
  return pieces.find((piece) => samePoint(piece, position));
}

function moveJieqiPiece(pieces: JieqiPiece[], pieceId: string, to: Position): JieqiPiece[] {
  return pieces
    .filter((piece) => piece.id === pieceId || !samePoint(piece, to))
    .map((piece) => (piece.id === pieceId ? { ...piece, ...to } : piece));
}

function formatJieqiMove(piece: JieqiPiece, to: Position, captured: JieqiPiece | undefined, revealed: boolean): string {
  const revealText = revealed ? `揭${piece.label}` : piece.label;
  return `${revealText} ${piece.x},${piece.y}->${to.x},${to.y}${captured ? ` 吃${captured.label}` : ''}`;
}
