import {
  hasPoint,
  inBounds,
  samePoint,
  startingPieces,
} from './game.js';
import type { Move, Piece, PieceKind, Position, Side } from './game.js';
import { chooseComputerMove } from './xiangqiEngine.js';
import type { EngineBestMoveProvider } from './xiangqiEngine.js';

export type JieqiPiece = Piece & {
  hidden: boolean;
  revealed: boolean;
  coveredKind: PieceKind;
  coveredLabel: string;
};

export type JieqiMoveResult = {
  pieces: JieqiPiece[];
  move: Move;
  movedPiece: JieqiPiece;
  captured?: JieqiPiece;
  revealed: boolean;
};

const pieceValues: Record<PieceKind, number> = {
  king: 10000,
  rook: 900,
  cannon: 450,
  horse: 400,
  elephant: 200,
  advisor: 200,
  pawn: 120,
};

const JIEQI_MATE_SCORE = 1_000_000;
const JIEQI_SEARCH_DEPTH = 3;
const JIEQI_SEARCH_LIMIT = 26;

export function createInitialJieqiPieces(source: Piece[] = startingPieces, random = Math.random): JieqiPiece[] {
  const pieces = source.map((piece) => ({ ...piece }));
  const hiddenIdentities: Record<Side, Piece[]> = {
    red: shuffleJieqiIdentities(pieces.filter((piece) => piece.side === 'red' && piece.kind !== 'king'), random),
    black: shuffleJieqiIdentities(pieces.filter((piece) => piece.side === 'black' && piece.kind !== 'king'), random),
  };
  const nextIdentityIndex: Record<Side, number> = { red: 0, black: 0 };

  return pieces.map((piece) => {
    const revealed = piece.kind === 'king';
    const realPiece = revealed ? piece : hiddenIdentities[piece.side][nextIdentityIndex[piece.side]++] ?? piece;
    return {
      ...piece,
      kind: realPiece.kind,
      label: realPiece.label,
      hidden: !revealed,
      revealed,
      coveredKind: piece.kind,
      coveredLabel: piece.label,
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
  return piece ? getJieqiLegalMovesForPiece(pieces, piece) : [];
}

export function applyJieqiMove(pieces: JieqiPiece[], pieceId: string, to: Position): JieqiMoveResult | null {
  const piece = findJieqiPiece(pieces, pieceId);
  if (!piece || !hasPoint(getJieqiLegalMovesForPiece(pieces, piece), to)) return null;

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

export function chooseJieqiMove(
  pieces: JieqiPiece[],
  side: Side,
  turnIndex = 0,
): Pick<Move, 'pieceId' | 'to'> | null {
  return chooseSearchJieqiMove(pieces, side, turnIndex);
}

export async function chooseJieqiComputerMove(
  pieces: JieqiPiece[],
  side: Side,
  options: {
    turnIndex?: number;
    movetimeMs?: number;
    timeoutMs?: number;
    engine?: EngineBestMoveProvider;
  } = {},
): Promise<Pick<Move, 'pieceId' | 'to'> | null> {
  const turnIndex = options.turnIndex ?? 0;
  const localMove = chooseSearchJieqiMove(pieces, side, turnIndex);
  if (!localMove) return null;

  const activePieces = toActiveJieqiEnginePieces(pieces);
  const engineMove = await chooseComputerMove(activePieces, side, {
    turnIndex,
    movetimeMs: options.movetimeMs ?? 1000,
    timeoutMs: options.timeoutMs ?? 2600,
    engine: options.engine,
  });

  if (engineMove && isAcceptableJieqiEngineMove(pieces, side, engineMove, localMove, turnIndex)) {
    return engineMove;
  }

  return localMove;
}

export function toActiveJieqiEnginePieces(pieces: JieqiPiece[]): Piece[] {
  return pieces.map((piece) => {
    if (!isHiddenJieqiPiece(piece)) return { ...piece };
    return {
      ...piece,
      kind: piece.coveredKind,
      label: piece.coveredLabel,
    };
  });
}

function getJieqiLegalMovesForPiece(pieces: JieqiPiece[], piece: JieqiPiece): Position[] {
  return getJieqiRawMoves(pieces, piece).filter((to) => {
    const target = getJieqiPieceAt(pieces, to);
    if (target?.side === piece.side) return false;
    const nextPieces = revealMovedPiece(moveJieqiPiece(pieces, piece.id, to), piece.id);
    return !isJieqiInCheck(nextPieces, piece.side);
  });
}

function isJieqiInCheck(pieces: JieqiPiece[], side: Side): boolean {
  const king = pieces.find((piece) => piece.side === side && piece.kind === 'king');
  if (!king) return true;
  return pieces
    .filter((piece) => piece.side !== side)
    .some((piece) => getJieqiRawMoves(pieces, piece).some((move) => samePoint(move, king)));
}

function getJieqiRawMoves(pieces: JieqiPiece[], piece: JieqiPiece): Position[] {
  const kind = getActiveJieqiKind(piece);
  if (kind === 'rook') return lineMoves(pieces, piece, false);
  if (kind === 'cannon') return lineMoves(pieces, piece, true);
  if (kind === 'horse') return horseMoves(pieces, piece);
  if (kind === 'elephant') return elephantMoves(pieces, piece, !isHiddenJieqiPiece(piece));
  if (kind === 'advisor') return advisorMoves(piece, !isHiddenJieqiPiece(piece));
  if (kind === 'king') return kingMoves(pieces, piece);
  return pawnMoves(piece);
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

function getActiveJieqiKind(piece: JieqiPiece): PieceKind {
  return isHiddenJieqiPiece(piece) ? piece.coveredKind : piece.kind;
}

function shuffleJieqiIdentities(pieces: Piece[], random: () => number): Piece[] {
  const shuffled = pieces.map((piece) => ({ ...piece }));
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  if (shuffled.length > 1 && shuffled.every((piece, index) => piece.id === pieces[index].id)) {
    shuffled.push(shuffled.shift() as Piece);
  }
  return shuffled;
}

function lineMoves(pieces: JieqiPiece[], piece: JieqiPiece, cannon: boolean): Position[] {
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
      const target = getJieqiPieceAt(pieces, next);
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

function horseMoves(pieces: JieqiPiece[], piece: JieqiPiece): Position[] {
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
    .filter(({ leg }) => !getJieqiPieceAt(pieces, { x: piece.x + leg.x, y: piece.y + leg.y }))
    .map(({ to }) => ({ x: piece.x + to.x, y: piece.y + to.y }))
    .filter(inBounds);
}

function elephantMoves(pieces: JieqiPiece[], piece: JieqiPiece, canCrossRiver: boolean): Position[] {
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
    .filter(({ to, eye }) => inBounds(to) && !getJieqiPieceAt(pieces, eye))
    .map(({ to }) => to)
    .filter((to) => canCrossRiver || (piece.side === 'red' ? to.y >= 5 : to.y <= 4));
}

function advisorMoves(piece: JieqiPiece, canLeavePalace: boolean): Position[] {
  return [
    { x: piece.x - 1, y: piece.y - 1 },
    { x: piece.x + 1, y: piece.y - 1 },
    { x: piece.x - 1, y: piece.y + 1 },
    { x: piece.x + 1, y: piece.y + 1 },
  ].filter((to) => inBounds(to) && (canLeavePalace || inJieqiPalace(to, piece.side)));
}

function kingMoves(pieces: JieqiPiece[], piece: JieqiPiece): Position[] {
  const moves = [
    { x: piece.x + 1, y: piece.y },
    { x: piece.x - 1, y: piece.y },
    { x: piece.x, y: piece.y + 1 },
    { x: piece.x, y: piece.y - 1 },
  ].filter((to) => inJieqiPalace(to, piece.side));

  const rival = pieces.find((item) => item.kind === 'king' && item.side !== piece.side);
  if (rival && rival.x === piece.x) {
    const minY = Math.min(rival.y, piece.y);
    const maxY = Math.max(rival.y, piece.y);
    const blocked = pieces.some((item) => item.x === piece.x && item.y > minY && item.y < maxY);
    if (!blocked) moves.push({ x: rival.x, y: rival.y });
  }

  return moves;
}

function pawnMoves(piece: JieqiPiece): Position[] {
  const forward = piece.side === 'red' ? -1 : 1;
  const moves = [{ x: piece.x, y: piece.y + forward }];
  const crossedRiver = piece.side === 'red' ? piece.y <= 4 : piece.y >= 5;
  if (crossedRiver) {
    moves.push({ x: piece.x - 1, y: piece.y }, { x: piece.x + 1, y: piece.y });
  }
  return moves.filter(inBounds);
}

function inJieqiPalace(position: Position, side: Side): boolean {
  const yRange = side === 'red' ? position.y >= 7 && position.y <= 9 : position.y >= 0 && position.y <= 2;
  return position.x >= 3 && position.x <= 5 && yRange;
}

function chooseSearchJieqiMove(
  pieces: JieqiPiece[],
  side: Side,
  turnIndex: number,
): Pick<Move, 'pieceId' | 'to'> | null {
  const candidates = generateJieqiCandidates(pieces, side, turnIndex);
  if (candidates.length === 0) return null;
  const safeCandidates = candidates.filter((candidate) => !isObviousJieqiBlunder(candidate.piece, candidate.captured, candidate.nextPieces));
  const searchCandidates = safeCandidates.length > 0 ? safeCandidates : candidates;

  let best = searchCandidates[0];
  let bestScore = -Infinity;
  let alpha = -Infinity;
  for (const candidate of searchCandidates) {
    const score = jieqiAlphaBeta(
      candidate.nextPieces,
      oppositeSide(side),
      JIEQI_SEARCH_DEPTH - 1,
      alpha,
      Infinity,
      side,
      turnIndex + 1,
    );
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
    alpha = Math.max(alpha, bestScore);
  }

  return { pieceId: best.pieceId, to: best.to };
}

function isAcceptableJieqiEngineMove(
  pieces: JieqiPiece[],
  side: Side,
  move: Pick<Move, 'pieceId' | 'to'>,
  baselineMove: Pick<Move, 'pieceId' | 'to'>,
  turnIndex: number,
): boolean {
  const piece = findJieqiPiece(pieces, move.pieceId);
  if (!piece || piece.side !== side || !hasPoint(getJieqiLegalMoves(pieces, move.pieceId), move.to)) return false;

  const captured = getJieqiPieceAt(pieces, move.to);
  const nextPieces = revealMovedPiece(moveJieqiPiece(pieces, move.pieceId, move.to), move.pieceId);
  if (captured?.kind === 'king' || isJieqiCheckmate(nextPieces, oppositeSide(side))) return true;

  const engineScore = jieqiAlphaBeta(nextPieces, oppositeSide(side), JIEQI_SEARCH_DEPTH - 1, -Infinity, Infinity, side, turnIndex + 1);
  const searchNextPieces = revealMovedPiece(moveJieqiPiece(pieces, baselineMove.pieceId, baselineMove.to), baselineMove.pieceId);
  const searchScore = jieqiAlphaBeta(searchNextPieces, oppositeSide(side), JIEQI_SEARCH_DEPTH - 1, -Infinity, Infinity, side, turnIndex + 1);

  return engineScore >= searchScore + 80 && !isObviousJieqiBlunder(piece, captured, nextPieces);
}

function jieqiAlphaBeta(
  pieces: JieqiPiece[],
  sideToMove: Side,
  depth: number,
  alpha: number,
  beta: number,
  perspective: Side,
  turnIndex: number,
): number {
  if (depth <= 0 || isJieqiCheckmate(pieces, sideToMove)) return evaluateJieqiPosition(pieces, perspective);

  const moves = generateJieqiCandidates(pieces, sideToMove, turnIndex, depth >= 2 ? JIEQI_SEARCH_LIMIT : 18);
  if (moves.length === 0) return evaluateJieqiPosition(pieces, perspective);

  if (sideToMove === perspective) {
    let value = -Infinity;
    for (const move of moves) {
      value = Math.max(value, jieqiAlphaBeta(move.nextPieces, oppositeSide(sideToMove), depth - 1, alpha, beta, perspective, turnIndex + 1));
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  }

  let value = Infinity;
  for (const move of moves) {
    value = Math.min(value, jieqiAlphaBeta(move.nextPieces, oppositeSide(sideToMove), depth - 1, alpha, beta, perspective, turnIndex + 1));
    beta = Math.min(beta, value);
    if (alpha >= beta) break;
  }
  return value;
}

function generateJieqiCandidates(
  pieces: JieqiPiece[],
  side: Side,
  turnIndex: number,
  limit = JIEQI_SEARCH_LIMIT,
): Array<{
  pieceId: string;
  to: Position;
  piece: JieqiPiece;
  captured?: JieqiPiece;
  nextPieces: JieqiPiece[];
  score: number;
}> {
  return pieces
    .filter((piece) => piece.side === side)
    .flatMap((piece) =>
      getJieqiLegalMovesForPiece(pieces, piece).map((to) => {
        const captured = getJieqiPieceAt(pieces, to);
        const nextPieces = revealMovedPiece(moveJieqiPiece(pieces, piece.id, to), piece.id);
        return {
          pieceId: piece.id,
          to,
          piece,
          captured,
          nextPieces,
          score: scoreJieqiMove(piece, to, captured, nextPieces, turnIndex),
        };
      }),
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function evaluateJieqiPosition(pieces: JieqiPiece[], perspective: Side): number {
  const rival = oppositeSide(perspective);
  if (!pieces.some((piece) => piece.side === perspective && piece.kind === 'king')) return -JIEQI_MATE_SCORE;
  if (!pieces.some((piece) => piece.side === rival && piece.kind === 'king')) return JIEQI_MATE_SCORE;
  if (isJieqiCheckmate(pieces, perspective)) return -JIEQI_MATE_SCORE;
  if (isJieqiCheckmate(pieces, rival)) return JIEQI_MATE_SCORE;

  let score = 0;
  pieces.forEach((piece) => {
    const sign = piece.side === perspective ? 1 : -1;
    score += sign * pieceValues[piece.kind];
    score += sign * jieqiPositionValue(piece);
  });
  if (isJieqiInCheck(pieces, perspective)) score -= 900;
  if (isJieqiInCheck(pieces, rival)) score += 900;
  score += (countJieqiMoves(pieces, perspective) - countJieqiMoves(pieces, rival)) * 5;
  score += (bestJieqiCaptureValue(pieces, perspective) - bestJieqiCaptureValue(pieces, rival)) * 3;
  return score;
}

function isObviousJieqiBlunder(piece: JieqiPiece, captured: JieqiPiece | undefined, nextPieces: JieqiPiece[]): boolean {
  const movedPiece = findJieqiPiece(nextPieces, piece.id);
  if (!movedPiece) return false;
  const loss = pieceValues[movedPiece.kind];
  const gain = captured ? pieceValues[captured.kind] : 0;
  return loss >= 400 && loss > gain + 180 && isJieqiSquareAttacked(nextPieces, movedPiece, oppositeSide(piece.side));
}

function isJieqiSquareAttacked(pieces: JieqiPiece[], position: Position, attacker: Side): boolean {
  return pieces
    .filter((piece) => piece.side === attacker)
    .some((piece) => getJieqiLegalMovesForPiece(pieces, piece).some((to) => samePoint(to, position)));
}

function isJieqiCheckmate(pieces: JieqiPiece[], side: Side): boolean {
  return isJieqiInCheck(pieces, side) && countJieqiMoves(pieces, side) === 0;
}

function countJieqiMoves(pieces: JieqiPiece[], side: Side): number {
  return pieces
    .filter((piece) => piece.side === side)
    .reduce((total, piece) => total + getJieqiLegalMovesForPiece(pieces, piece).length, 0);
}

function bestJieqiCaptureValue(pieces: JieqiPiece[], side: Side): number {
  let best = 0;
  pieces
    .filter((piece) => piece.side === side)
    .forEach((piece) => {
      getJieqiLegalMovesForPiece(pieces, piece).forEach((to) => {
        const captured = getJieqiPieceAt(pieces, to);
        if (captured && captured.side !== side) best = Math.max(best, pieceValues[captured.kind]);
      });
    });
  return best;
}

function jieqiPositionValue(piece: JieqiPiece): number {
  const activeKind = getActiveJieqiKind(piece);
  const center = 4 - Math.abs(4 - piece.x);
  if (activeKind === 'pawn') {
    const crossedRiver = piece.side === 'red' ? piece.y <= 4 : piece.y >= 5;
    const advance = piece.side === 'red' ? 9 - piece.y : piece.y;
    return advance * 15 + (crossedRiver ? 60 + center * 10 : 0);
  }
  if (activeKind === 'rook') return center * 12;
  if (activeKind === 'horse') return center * 15;
  if (activeKind === 'cannon') return center * 10;
  return 0;
}

function oppositeSide(side: Side): Side {
  return side === 'red' ? 'black' : 'red';
}

function scoreJieqiMove(
  piece: JieqiPiece,
  to: Position,
  captured: JieqiPiece | undefined,
  nextPieces: JieqiPiece[],
  turnIndex: number,
): number {
  const rival = piece.side === 'red' ? 'black' : 'red';
  const activeKind = getActiveJieqiKind(piece);
  const captureScore = captured ? pieceValues[captured.kind] * 12 - pieceValues[piece.kind] : 0;
  const checkScore = isJieqiInCheck(nextPieces, rival) ? 700 : 0;
  const mateScore = isJieqiCheckmate(nextPieces, rival) ? JIEQI_MATE_SCORE : 0;
  const movedPiece = findJieqiPiece(nextPieces, piece.id);
  const safetyPenalty = movedPiece && isJieqiSquareAttacked(nextPieces, movedPiece, rival)
    ? pieceValues[movedPiece.kind] * 7
    : 0;
  const replyCapturePenalty = bestJieqiCaptureValue(nextPieces, rival) * 4;
  const advance = piece.side === 'black' ? to.y - piece.y : piece.y - to.y;
  const pawnAdvance = activeKind === 'pawn' ? advance * 8 : advance * 2;
  const center = 4 - Math.abs(4 - to.x);
  return mateScore + captureScore + checkScore + pawnAdvance + center + ((to.x + turnIndex) % 2) - safetyPenalty - replyCapturePenalty;
}
