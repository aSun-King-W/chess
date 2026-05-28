export type Side = 'red' | 'black';
export type GamePhase = 'playing' | 'ended';
export type EndReason = 'checkmate' | 'stalemate' | 'resign' | 'timeout' | 'captured';
export type PieceKind = 'rook' | 'horse' | 'elephant' | 'advisor' | 'king' | 'cannon' | 'pawn';

export type Position = {
  x: number;
  y: number;
};

export type Piece = Position & {
  id: string;
  side: Side;
  kind: PieceKind;
  label: string;
};

export type Move = {
  pieceId: string;
  from: Position;
  to: Position;
  captured?: Piece;
  notation: string;
};

export type GameResult = {
  winner: Side;
  reason: EndReason;
  moves: Move[];
  pieces: Piece[];
  elapsed: number;
  endedAt: string;
};

export type GameState = {
  pieces: Piece[];
  turn: Side;
  selectedPieceId: string | null;
  legalMoves: Position[];
  recentMove: Move | null;
  moveHistory: Move[];
  phase: GamePhase;
  result: GameResult | null;
  redTotal: number;
  blackTotal: number;
  initialTotalSeconds: number;
  stepLeft: number;
  regularStepSeconds: number;
  openingStepSeconds: number;
  openingMoveCount: number;
  paused: boolean;
};

export const BOARD_WIDTH = 9;
export const BOARD_HEIGHT = 10;
export const INITIAL_TOTAL_SECONDS = 15 * 60;
export const INITIAL_STEP_SECONDS = 90;
export const OPENING_STEP_SECONDS = 30;
export const gobangSize = 11;

const files = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

const pieceValues: Record<PieceKind, number> = {
  king: 1000,
  rook: 90,
  cannon: 45,
  horse: 40,
  elephant: 20,
  advisor: 20,
  pawn: 12,
};

export const startingPieces: Piece[] = [
  { id: 'br1', side: 'black', kind: 'rook', label: '車', x: 0, y: 0 },
  { id: 'bn1', side: 'black', kind: 'horse', label: '馬', x: 1, y: 0 },
  { id: 'bb1', side: 'black', kind: 'elephant', label: '象', x: 2, y: 0 },
  { id: 'ba1', side: 'black', kind: 'advisor', label: '士', x: 3, y: 0 },
  { id: 'bk', side: 'black', kind: 'king', label: '將', x: 4, y: 0 },
  { id: 'ba2', side: 'black', kind: 'advisor', label: '士', x: 5, y: 0 },
  { id: 'bb2', side: 'black', kind: 'elephant', label: '象', x: 6, y: 0 },
  { id: 'bn2', side: 'black', kind: 'horse', label: '馬', x: 7, y: 0 },
  { id: 'br2', side: 'black', kind: 'rook', label: '車', x: 8, y: 0 },
  { id: 'bc1', side: 'black', kind: 'cannon', label: '炮', x: 1, y: 2 },
  { id: 'bc2', side: 'black', kind: 'cannon', label: '炮', x: 7, y: 2 },
  { id: 'bp1', side: 'black', kind: 'pawn', label: '卒', x: 0, y: 3 },
  { id: 'bp2', side: 'black', kind: 'pawn', label: '卒', x: 2, y: 3 },
  { id: 'bp3', side: 'black', kind: 'pawn', label: '卒', x: 4, y: 3 },
  { id: 'bp4', side: 'black', kind: 'pawn', label: '卒', x: 6, y: 3 },
  { id: 'bp5', side: 'black', kind: 'pawn', label: '卒', x: 8, y: 3 },
  { id: 'rp1', side: 'red', kind: 'pawn', label: '兵', x: 0, y: 6 },
  { id: 'rp2', side: 'red', kind: 'pawn', label: '兵', x: 2, y: 6 },
  { id: 'rp3', side: 'red', kind: 'pawn', label: '兵', x: 4, y: 6 },
  { id: 'rp4', side: 'red', kind: 'pawn', label: '兵', x: 6, y: 6 },
  { id: 'rp5', side: 'red', kind: 'pawn', label: '兵', x: 8, y: 6 },
  { id: 'rc1', side: 'red', kind: 'cannon', label: '炮', x: 1, y: 7 },
  { id: 'rc2', side: 'red', kind: 'cannon', label: '炮', x: 7, y: 7 },
  { id: 'rr1', side: 'red', kind: 'rook', label: '車', x: 0, y: 9 },
  { id: 'rn1', side: 'red', kind: 'horse', label: '馬', x: 1, y: 9 },
  { id: 'rb1', side: 'red', kind: 'elephant', label: '相', x: 2, y: 9 },
  { id: 'ra1', side: 'red', kind: 'advisor', label: '仕', x: 3, y: 9 },
  { id: 'rk', side: 'red', kind: 'king', label: '帥', x: 4, y: 9 },
  { id: 'ra2', side: 'red', kind: 'advisor', label: '仕', x: 5, y: 9 },
  { id: 'rb2', side: 'red', kind: 'elephant', label: '相', x: 6, y: 9 },
  { id: 'rn2', side: 'red', kind: 'horse', label: '馬', x: 7, y: 9 },
  { id: 'rr2', side: 'red', kind: 'rook', label: '車', x: 8, y: 9 },
];

export const puzzlePieces: Piece[] = [
  { id: 'pk', side: 'black', kind: 'king', label: '將', x: 4, y: 0 },
  { id: 'pa1', side: 'black', kind: 'advisor', label: '士', x: 3, y: 0 },
  { id: 'pa2', side: 'black', kind: 'advisor', label: '士', x: 5, y: 0 },
  { id: 'pr', side: 'red', kind: 'rook', label: '車', x: 4, y: 8 },
  { id: 'pc', side: 'red', kind: 'cannon', label: '炮', x: 1, y: 7 },
  { id: 'prk', side: 'red', kind: 'king', label: '帥', x: 4, y: 9 },
];

export function createInitialGame(
  totalSeconds = INITIAL_TOTAL_SECONDS,
  regularStepSeconds = INITIAL_STEP_SECONDS,
  openingStepSeconds = OPENING_STEP_SECONDS,
  openingMoveCount = 3,
): GameState {
  return {
    pieces: clonePieces(startingPieces),
    turn: 'red',
    selectedPieceId: null,
    legalMoves: [],
    recentMove: null,
    moveHistory: [],
    phase: 'playing',
    result: null,
    redTotal: totalSeconds,
    blackTotal: totalSeconds,
    initialTotalSeconds: totalSeconds,
    stepLeft: stepSecondsForMove(0, regularStepSeconds, openingStepSeconds, openingMoveCount),
    regularStepSeconds,
    openingStepSeconds,
    openingMoveCount,
    paused: false,
  };
}

export function selectPiece(game: GameState, pieceId: string): GameState {
  const piece = findPiece(game.pieces, pieceId);
  if (!piece || game.phase !== 'playing' || piece.side !== game.turn) return game;
  return {
    ...game,
    selectedPieceId: pieceId,
    legalMoves: getLegalMoves(game.pieces, piece),
  };
}

export function applyMove(game: GameState, pieceId: string, to: Position): GameState {
  const piece = findPiece(game.pieces, pieceId);
  if (!piece || game.phase !== 'playing' || piece.side !== game.turn) return game;
  if (!hasPoint(getLegalMoves(game.pieces, piece), to)) return game;

  const captured = getPieceAt(game.pieces, to);
  const move: Move = {
    pieceId,
    from: { x: piece.x, y: piece.y },
    to,
    captured,
    notation: formatMove(piece, to, captured),
  };
  const movedPieces = movePiece(game.pieces, pieceId, to);
  const nextTurn = opposite(game.turn);
  const moveHistory = [...game.moveHistory, move];
  const capturedKing = captured?.kind === 'king';

  const nextGame: GameState = {
    ...game,
    pieces: movedPieces,
    turn: nextTurn,
    selectedPieceId: null,
    legalMoves: [],
    recentMove: move,
    moveHistory,
    stepLeft: stepSecondsForMove(
      moveHistory.length,
      game.regularStepSeconds,
      game.openingStepSeconds,
      game.openingMoveCount,
    ),
  };

  if (capturedKing) return finishGame(nextGame, game.turn, 'captured');
  const defeatReason = getDefeatReason(movedPieces, nextTurn);
  if (defeatReason) return finishGame(nextGame, game.turn, defeatReason);
  return nextGame;
}

export function finishGame(game: GameState, winner: Side, reason: EndReason): GameState {
  if (game.phase === 'ended' && game.result) return game;
  const elapsed = game.initialTotalSeconds * 2 - game.redTotal - game.blackTotal;
  return {
    ...game,
    phase: 'ended',
    selectedPieceId: null,
    legalMoves: [],
    result: {
      winner,
      reason,
      moves: game.moveHistory,
      pieces: clonePieces(game.pieces),
      elapsed: Math.max(1, elapsed),
      endedAt: new Date().toISOString(),
    },
  };
}

export function chooseAiMove(pieces: Piece[], turnIndex: number): Pick<Move, 'pieceId' | 'to'> | null {
  const candidates = pieces
    .filter((piece) => piece.side === 'black')
    .flatMap((piece) =>
      getLegalMoves(pieces, piece).map((to) => ({
        pieceId: piece.id,
        to,
        capture: getPieceAt(pieces, to),
        piece,
        nextPieces: movePiece(pieces, piece.id, to),
      })),
    );

  if (candidates.length === 0) return null;

  return [...candidates].sort((a, b) => scoreAiMove(b, turnIndex) - scoreAiMove(a, turnIndex))[0];
}

function scoreAiMove(
  candidate: { to: Position; capture?: Piece; piece: Piece; nextPieces: Piece[] },
  turnIndex: number,
): number {
  const captureScore = candidate.capture ? pieceValues[candidate.capture.kind] * 12 : 0;
  const mateScore = isCheckmate(candidate.nextPieces, 'red') ? 10000 : 0;
  const checkScore = isInCheck(candidate.nextPieces, 'red') ? 80 : 0;
  const advanceScore = (candidate.to.y - candidate.piece.y) * 2;
  const varietyScore = (candidate.to.x + turnIndex) % 3;
  return mateScore + checkScore + captureScore + advanceScore + varietyScore;
}

export function getLegalMoves(pieces: Piece[], piece: Piece): Position[] {
  return getRawMoves(pieces, piece).filter((to) => {
    const target = getPieceAt(pieces, to);
    if (target?.side === piece.side) return false;
    const nextPieces = movePiece(pieces, piece.id, to);
    return !isInCheck(nextPieces, piece.side);
  });
}

export function getRawMoves(pieces: Piece[], piece: Piece): Position[] {
  if (piece.kind === 'rook') return lineMoves(pieces, piece, false);
  if (piece.kind === 'cannon') return lineMoves(pieces, piece, true);
  if (piece.kind === 'horse') return horseMoves(pieces, piece);
  if (piece.kind === 'elephant') return elephantMoves(pieces, piece);
  if (piece.kind === 'advisor') return advisorMoves(piece);
  if (piece.kind === 'king') return kingMoves(pieces, piece);
  return pawnMoves(piece);
}

function lineMoves(pieces: Piece[], piece: Piece, cannon: boolean): Position[] {
  const moves: Position[] = [];
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  directions.forEach((direction) => {
    let screens = 0;
    let next = { x: piece.x + direction.x, y: piece.y + direction.y };
    while (inBounds(next)) {
      const target = getPieceAt(pieces, next);
      if (!cannon) {
        if (!target) {
          moves.push(next);
        } else {
          if (target.side !== piece.side) moves.push(next);
          break;
        }
      } else if (!target && screens === 0) {
        moves.push(next);
      } else if (target) {
        screens += 1;
        if (screens === 2) {
          if (target.side !== piece.side) moves.push(next);
          break;
        }
      }
      next = { x: next.x + direction.x, y: next.y + direction.y };
    }
  });

  return moves;
}

function horseMoves(pieces: Piece[], piece: Piece): Position[] {
  const jumps = [
    { leg: { x: 0, y: -1 }, to: { x: -1, y: -2 } },
    { leg: { x: 0, y: -1 }, to: { x: 1, y: -2 } },
    { leg: { x: 0, y: 1 }, to: { x: -1, y: 2 } },
    { leg: { x: 0, y: 1 }, to: { x: 1, y: 2 } },
    { leg: { x: -1, y: 0 }, to: { x: -2, y: -1 } },
    { leg: { x: -1, y: 0 }, to: { x: -2, y: 1 } },
    { leg: { x: 1, y: 0 }, to: { x: 2, y: -1 } },
    { leg: { x: 1, y: 0 }, to: { x: 2, y: 1 } },
  ];

  return jumps
    .filter(({ leg }) => !getPieceAt(pieces, { x: piece.x + leg.x, y: piece.y + leg.y }))
    .map(({ to }) => ({ x: piece.x + to.x, y: piece.y + to.y }))
    .filter(inBounds);
}

function elephantMoves(pieces: Piece[], piece: Piece): Position[] {
  return [
    { x: -2, y: -2 },
    { x: 2, y: -2 },
    { x: -2, y: 2 },
    { x: 2, y: 2 },
  ]
    .map((delta) => ({
      to: { x: piece.x + delta.x, y: piece.y + delta.y },
      eye: { x: piece.x + delta.x / 2, y: piece.y + delta.y / 2 },
    }))
    .filter(({ to, eye }) => inBounds(to) && !getPieceAt(pieces, eye))
    .map(({ to }) => to)
    .filter((to) => (piece.side === 'red' ? to.y >= 5 : to.y <= 4));
}

function advisorMoves(piece: Piece): Position[] {
  return [
    { x: piece.x - 1, y: piece.y - 1 },
    { x: piece.x + 1, y: piece.y - 1 },
    { x: piece.x - 1, y: piece.y + 1 },
    { x: piece.x + 1, y: piece.y + 1 },
  ].filter((to) => inPalace(to, piece.side));
}

function kingMoves(pieces: Piece[], piece: Piece): Position[] {
  const moves = [
    { x: piece.x + 1, y: piece.y },
    { x: piece.x - 1, y: piece.y },
    { x: piece.x, y: piece.y + 1 },
    { x: piece.x, y: piece.y - 1 },
  ].filter((to) => inPalace(to, piece.side));

  const rival = pieces.find((item) => item.kind === 'king' && item.side !== piece.side);
  if (rival && rival.x === piece.x) {
    const minY = Math.min(rival.y, piece.y);
    const maxY = Math.max(rival.y, piece.y);
    const blocked = pieces.some((item) => item.x === piece.x && item.y > minY && item.y < maxY);
    if (!blocked) moves.push({ x: rival.x, y: rival.y });
  }

  return moves;
}

function pawnMoves(piece: Piece): Position[] {
  const forward = piece.side === 'red' ? -1 : 1;
  const moves = [{ x: piece.x, y: piece.y + forward }];
  const crossedRiver = piece.side === 'red' ? piece.y <= 4 : piece.y >= 5;
  if (crossedRiver) {
    moves.push({ x: piece.x - 1, y: piece.y }, { x: piece.x + 1, y: piece.y });
  }
  return moves.filter(inBounds);
}

export function isCheckmate(pieces: Piece[], side: Side): boolean {
  return isInCheck(pieces, side) && !hasLegalMove(pieces, side);
}

export function getDefeatReason(pieces: Piece[], side: Side): EndReason | null {
  if (hasLegalMove(pieces, side)) return null;
  return isInCheck(pieces, side) ? 'checkmate' : 'stalemate';
}

export function hasLegalMove(pieces: Piece[], side: Side): boolean {
  return pieces.some((piece) => piece.side === side && getLegalMoves(pieces, piece).length > 0);
}

export function isInCheck(pieces: Piece[], side: Side): boolean {
  const king = pieces.find((piece) => piece.side === side && piece.kind === 'king');
  if (!king) return true;
  return pieces
    .filter((piece) => piece.side !== side)
    .some((piece) => getRawMoves(pieces, piece).some((move) => samePoint(move, king)));
}

export function buildReplayPieces(moves: Move[], step: number): Piece[] {
  let pieces = clonePieces(startingPieces);
  const clampedStep = Math.max(0, Math.min(step, moves.length));
  moves.slice(0, clampedStep).forEach((move) => {
    pieces = movePiece(pieces, move.pieceId, move.to);
  });
  return pieces;
}

export function canUndoRound(game: GameState): boolean {
  return game.phase === 'playing' && game.moveHistory.length >= 2;
}

export function undoLastRound(game: GameState): GameState {
  if (!canUndoRound(game)) return game;
  const moveHistory = game.moveHistory.slice(0, -2);
  return {
    ...game,
    pieces: buildReplayPieces(moveHistory, moveHistory.length),
    turn: 'red',
    selectedPieceId: null,
    legalMoves: [],
    recentMove: moveHistory[moveHistory.length - 1] ?? null,
    moveHistory,
    stepLeft: stepSecondsForMove(
      moveHistory.length,
      game.regularStepSeconds,
      game.openingStepSeconds,
      game.openingMoveCount,
    ),
  };
}

export function movePiece(pieces: Piece[], pieceId: string, to: Position): Piece[] {
  return pieces
    .filter((piece) => piece.id === pieceId || !samePoint(piece, to))
    .map((piece) => (piece.id === pieceId ? { ...piece, ...to } : piece));
}

export function getPieceAt(pieces: Piece[], position: Position): Piece | undefined {
  return pieces.find((piece) => samePoint(piece, position));
}

export function findPiece(pieces: Piece[], pieceId: string): Piece | undefined {
  return pieces.find((piece) => piece.id === pieceId);
}

export function inBounds(position: Position): boolean {
  return position.x >= 0 && position.x < BOARD_WIDTH && position.y >= 0 && position.y < BOARD_HEIGHT;
}

export function inPalace(position: Position, side: Side): boolean {
  const yRange = side === 'red' ? position.y >= 7 && position.y <= 9 : position.y >= 0 && position.y <= 2;
  return position.x >= 3 && position.x <= 5 && yRange;
}

export function samePoint(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

export function hasPoint(points: Position[], point: Position): boolean {
  return points.some((item) => samePoint(item, point));
}

export function opposite(side: Side): Side {
  return side === 'red' ? 'black' : 'red';
}

export function clonePieces(pieces: Piece[]): Piece[] {
  return pieces.map((piece) => ({ ...piece }));
}

export function stepSecondsForMove(
  moveCount: number,
  regularStepSeconds = INITIAL_STEP_SECONDS,
  openingStepSeconds = OPENING_STEP_SECONDS,
  openingMoveCount = 3,
): number {
  return moveCount < openingMoveCount * 2 ? openingStepSeconds : regularStepSeconds;
}

export function createGobangBoard(): number[][] {
  return Array.from({ length: gobangSize }, () => Array.from({ length: gobangSize }, () => 0));
}

export function placeStone(board: number[][], x: number, y: number, stone: number): number[][] {
  return board.map((row, rowIndex) => row.map((cell, columnIndex) => (rowIndex === y && columnIndex === x ? stone : cell)));
}

export function chooseGobangMove(board: number[][], lastX: number, lastY: number): Position | null {
  const nearby: Position[] = [];
  for (let radius = 1; radius <= 2; radius += 1) {
    for (let y = lastY - radius; y <= lastY + radius; y += 1) {
      for (let x = lastX - radius; x <= lastX + radius; x += 1) {
        if (x >= 0 && x < gobangSize && y >= 0 && y < gobangSize && board[y][x] === 0) nearby.push({ x, y });
      }
    }
    if (nearby.length > 0) return nearby[Math.floor(nearby.length / 2)];
  }
  for (let y = 0; y < gobangSize; y += 1) {
    for (let x = 0; x < gobangSize; x += 1) {
      if (board[y][x] === 0) return { x, y };
    }
  }
  return null;
}

export function hasGobangWin(board: number[][], stone: number): boolean {
  const directions = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
  ];
  for (let y = 0; y < gobangSize; y += 1) {
    for (let x = 0; x < gobangSize; x += 1) {
      if (board[y][x] !== stone) continue;
      if (
        directions.some((direction) =>
          Array.from({ length: 5 }).every((_, index) => {
            const nextX = x + direction.x * index;
            const nextY = y + direction.y * index;
            return nextX >= 0 && nextX < gobangSize && nextY >= 0 && nextY < gobangSize && board[nextY][nextX] === stone;
          }),
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

function formatMove(piece: Piece, to: Position, captured?: Piece): string {
  const fromFile = files[piece.side === 'red' ? piece.x : 8 - piece.x];
  const toFile = files[piece.side === 'red' ? to.x : 8 - to.x];
  const vertical = piece.side === 'red' ? piece.y - to.y : to.y - piece.y;
  const action = vertical === 0 ? '平' : vertical > 0 ? '进' : '退';
  const target = action === '平' ? toFile : Math.abs(vertical).toString();
  return `${piece.label}${fromFile}${action}${target}${captured ? ` 吃${captured.label}` : ''}`;
}
