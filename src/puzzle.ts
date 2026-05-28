import {
  clonePieces,
  findPiece,
  getLegalMoves,
  getPieceAt,
  hasPoint,
  isCheckmate,
  movePiece,
  opposite,
  puzzlePieces,
  samePoint,
} from './game.js';
import type { Move, Piece, Position, Side } from './game.js';

export type PuzzleGoalType = 'capture-king' | 'checkmate' | 'solution-line';
export type PuzzleSessionStatus = 'ready' | 'playing' | 'solved' | 'failed';
export type PuzzleMoveVerdict = 'correct' | 'incorrect' | 'success' | 'failure';

export type PuzzleGoal = {
  type: PuzzleGoalType;
  description: string;
  maxMoves?: number;
  failureOnWrongMove?: boolean;
};

export type PuzzleStats = {
  challengeCount: number;
  passRate: number;
  fastestSeconds: number;
  commentCount: number;
};

export type PuzzleHintArrow = {
  from: Position;
  to: Position;
};

export type PuzzleHint = {
  moveIndex: number;
  title: string;
  target: Position;
  arrow?: PuzzleHintArrow;
  pieceId?: string;
  detail?: string;
};

export type PuzzleSolutionMove = {
  pieceId: string;
  from?: Position;
  to: Position;
  note?: string;
};

export type Puzzle = {
  id: string;
  title: string;
  pieces: Piece[];
  sideToMove: Side;
  goal: PuzzleGoal;
  hints: PuzzleHint[];
  solutionLine: PuzzleSolutionMove[];
  stats: PuzzleStats;
};

export type PuzzleSession = {
  puzzleId: string;
  pieces: Piece[];
  turn: Side;
  status: PuzzleSessionStatus;
  progressIndex: number;
  steps: number;
  elapsedSeconds: number;
  hintsRemaining: number;
  hintsUsed: number;
  revealedHint: PuzzleHint | null;
  moveHistory: Move[];
};

export type PuzzleApplyResult = {
  session: PuzzleSession;
  verdict: PuzzleMoveVerdict;
  message: string;
  move?: Move;
  expected?: PuzzleSolutionMove;
  hint?: PuzzleHint | null;
};

export const dailyPuzzle: Puzzle = {
  id: 'daily-490-che-lin-zhong-lu',
  title: '车临中路',
  pieces: clonePieces(puzzlePieces),
  sideToMove: 'red',
  goal: {
    type: 'capture-king',
    description: '红先一手取胜',
    maxMoves: 1,
    failureOnWrongMove: true,
  },
  hints: [
    {
      moveIndex: 0,
      title: '红车进一将军',
      detail: '车沿中路直取黑将。',
      pieceId: 'pr',
      target: { x: 4, y: 0 },
      arrow: {
        from: { x: 4, y: 8 },
        to: { x: 4, y: 0 },
      },
    },
  ],
  solutionLine: [
    {
      pieceId: 'pr',
      from: { x: 4, y: 8 },
      to: { x: 4, y: 0 },
      note: '车八进八',
    },
  ],
  stats: {
    challengeCount: 8048,
    passRate: 0.62,
    fastestSeconds: 4,
    commentCount: 128,
  },
};

export function createPuzzleSession(puzzle: Puzzle = dailyPuzzle): PuzzleSession {
  return {
    puzzleId: puzzle.id,
    pieces: clonePieces(puzzle.pieces),
    turn: puzzle.sideToMove,
    status: 'ready',
    progressIndex: 0,
    steps: 0,
    elapsedSeconds: 0,
    hintsRemaining: puzzle.hints.length,
    hintsUsed: 0,
    revealedHint: null,
    moveHistory: [],
  };
}

export function resetPuzzleSession(puzzle: Puzzle, session?: PuzzleSession): PuzzleSession {
  return {
    ...createPuzzleSession(puzzle),
    hintsRemaining: session ? Math.max(0, puzzle.hints.length - session.hintsUsed) : puzzle.hints.length,
    hintsUsed: session?.hintsUsed ?? 0,
  };
}

export function tickPuzzleSession(session: PuzzleSession, seconds = 1): PuzzleSession {
  if (session.status === 'solved' || session.status === 'failed') return session;
  return {
    ...session,
    elapsedSeconds: Math.max(0, session.elapsedSeconds + seconds),
  };
}

export function getPuzzleLegalMoves(session: PuzzleSession, pieceId: string): Position[] {
  const piece = findPiece(session.pieces, pieceId);
  if (!piece || piece.side !== session.turn || session.status === 'solved' || session.status === 'failed') return [];
  return getLegalMoves(session.pieces, piece);
}

export function getNextPuzzleHint(puzzle: Puzzle, session: PuzzleSession): PuzzleHint | null {
  return puzzle.hints.find((hint) => hint.moveIndex === session.progressIndex) ?? null;
}

export function revealPuzzleHint(
  puzzle: Puzzle,
  session: PuzzleSession,
): { session: PuzzleSession; hint: PuzzleHint | null; consumed: boolean } {
  const hint = getNextPuzzleHint(puzzle, session);
  if (!hint) return { session: { ...session, revealedHint: null }, hint: null, consumed: false };

  const alreadyRevealed = session.revealedHint?.moveIndex === hint.moveIndex;
  return {
    session: {
      ...session,
      revealedHint: hint,
      hintsRemaining: alreadyRevealed ? session.hintsRemaining : Math.max(0, session.hintsRemaining - 1),
      hintsUsed: alreadyRevealed ? session.hintsUsed : session.hintsUsed + 1,
    },
    hint,
    consumed: !alreadyRevealed,
  };
}

export function applyPuzzleMove(
  puzzle: Puzzle,
  session: PuzzleSession,
  attempt: Pick<PuzzleSolutionMove, 'pieceId' | 'to'>,
): PuzzleApplyResult {
  if (session.status === 'solved' || session.status === 'failed') {
    return {
      session,
      verdict: 'failure',
      message: '残局已经结束，请先重来。',
      hint: getNextPuzzleHint(puzzle, session),
    };
  }

  const piece = findPiece(session.pieces, attempt.pieceId);
  if (!piece || piece.side !== session.turn) {
    return {
      session,
      verdict: 'failure',
      message: '请选择当前行棋方的棋子。',
      hint: getNextPuzzleHint(puzzle, session),
    };
  }

  const legalMoves = getLegalMoves(session.pieces, piece);
  if (!hasPoint(legalMoves, attempt.to)) {
    return {
      session,
      verdict: 'failure',
      message: '这步不符合象棋走法。',
      hint: getNextPuzzleHint(puzzle, session),
    };
  }

  const expected = puzzle.solutionLine[session.progressIndex];
  const captured = getPieceAt(session.pieces, attempt.to);
  const move: Move = {
    pieceId: piece.id,
    from: { x: piece.x, y: piece.y },
    to: { ...attempt.to },
    captured,
    notation: formatPuzzleMove(piece, attempt.to, captured),
  };
  const nextPieces = movePiece(session.pieces, piece.id, attempt.to);
  const baseNextSession: PuzzleSession = {
    ...session,
    pieces: nextPieces,
    status: 'playing',
    steps: session.steps + 1,
    moveHistory: [...session.moveHistory, move],
    revealedHint: null,
  };

  if (!matchesSolutionMove(expected, move)) {
    const failed: PuzzleSession = {
      ...baseNextSession,
      status: puzzle.goal.failureOnWrongMove === false ? 'playing' : 'failed',
      turn: opposite(session.turn),
    };
    return {
      session: failed,
      verdict: 'incorrect',
      message: puzzle.goal.failureOnWrongMove === false ? '这步不是推荐解。' : '这步不是最佳解，挑战失败。',
      move,
      expected,
      hint: getNextPuzzleHint(puzzle, session),
    };
  }

  const nextProgress = session.progressIndex + 1;
  const solved = isPuzzleGoalSatisfied(puzzle, nextPieces, move, nextProgress);
  const failedByMoveLimit = !solved && puzzle.goal.maxMoves !== undefined && baseNextSession.steps >= puzzle.goal.maxMoves;
  return {
    session: {
      ...baseNextSession,
      turn: opposite(session.turn),
      status: solved ? 'solved' : failedByMoveLimit ? 'failed' : 'playing',
      progressIndex: nextProgress,
    },
    verdict: solved ? 'success' : failedByMoveLimit ? 'failure' : 'correct',
    message: solved ? '挑战成功。' : failedByMoveLimit ? '步数已用完，挑战失败。' : '正确，继续按解法应对。',
    move,
    expected,
    hint: solved || failedByMoveLimit ? null : getNextPuzzleHint(puzzle, { ...session, progressIndex: nextProgress }),
  };
}

function matchesSolutionMove(expected: PuzzleSolutionMove | undefined, move: Move): boolean {
  if (!expected) return false;
  if (expected.pieceId !== move.pieceId) return false;
  if (expected.from && !samePoint(expected.from, move.from)) return false;
  return samePoint(expected.to, move.to);
}

function isPuzzleGoalSatisfied(puzzle: Puzzle, pieces: Piece[], move: Move, progressIndex: number): boolean {
  if (puzzle.goal.type === 'solution-line') return progressIndex >= puzzle.solutionLine.length;
  if (puzzle.goal.type === 'capture-king') return move.captured?.kind === 'king';
  if (puzzle.goal.type === 'checkmate') return isCheckmate(pieces, opposite(findPiece(pieces, move.pieceId)?.side ?? puzzle.sideToMove));
  return false;
}

function formatPuzzleMove(piece: Piece, to: Position, captured?: Piece): string {
  return `${piece.label}${piece.x},${piece.y}-${to.x},${to.y}${captured ? ` 吃${captured.label}` : ''}`;
}
