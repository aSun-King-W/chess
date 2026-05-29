import {
  clonePieces,
  findPiece,
  getDefeatReason,
  getLegalMoves,
  getPieceAt,
  hasPoint,
  movePiece,
  opposite,
  samePoint,
} from './game.js';
import type { Move, Piece, Position, Side } from './game.js';
import type { PieceKind } from './game.js';

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
  source?: string;
  motif?: string;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  mode?: 'line' | 'free-mate';
  pieces: Piece[];
  sideToMove: Side;
  goal: PuzzleGoal;
  hints: PuzzleHint[];
  solutionLine: PuzzleSolutionMove[];
  stats: PuzzleStats;
};

function puzzlePiece(id: string, side: Side, kind: PieceKind, x: number, y: number): Piece {
  const labels: Record<Side, Record<PieceKind, string>> = {
    red: {
      rook: '車',
      horse: '馬',
      elephant: '相',
      advisor: '仕',
      king: '帥',
      cannon: '炮',
      pawn: '兵',
    },
    black: {
      rook: '車',
      horse: '馬',
      elephant: '象',
      advisor: '士',
      king: '將',
      cannon: '炮',
      pawn: '卒',
    },
  };

  return { id, side, kind, label: labels[side][kind], x, y };
}

function puzzleStats(challengeCount: number, passRate: number, fastestSeconds: number, commentCount: number): PuzzleStats {
  return { challengeCount, passRate, fastestSeconds, commentCount };
}

function hintFromMove(
  moveIndex: number,
  title: string,
  pieceId: string,
  from: Position,
  to: Position,
  detail: string,
): PuzzleHint {
  return {
    moveIndex,
    title,
    detail,
    pieceId,
    target: to,
    arrow: { from, to },
  };
}

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
  id: 'daily-20260529-user-endgame',
  title: '车炮混战',
  source: '用户截图每日残局复刻',
  motif: '车炮多子攻防，将死判胜',
  difficulty: 4,
  mode: 'free-mate',
  pieces: [
    puzzlePiece('daily-rc-top', 'red', 'cannon', 1, 0),
    puzzlePiece('daily-ba-top', 'black', 'advisor', 3, 0),
    puzzlePiece('daily-ba-mid', 'black', 'advisor', 4, 1),
    puzzlePiece('daily-bk', 'black', 'king', 5, 1),
    puzzlePiece('daily-br-center', 'black', 'rook', 5, 3),
    puzzlePiece('daily-bp-left', 'black', 'pawn', 0, 3),
    puzzlePiece('daily-bp-right', 'black', 'pawn', 8, 3),
    puzzlePiece('daily-bc-side', 'black', 'cannon', 8, 6),
    puzzlePiece('daily-rh-side', 'red', 'horse', 8, 7),
    puzzlePiece('daily-br-bottom', 'black', 'rook', 5, 8),
    puzzlePiece('daily-rr-center', 'red', 'rook', 4, 4),
    puzzlePiece('daily-rr-river', 'red', 'rook', 6, 5),
    puzzlePiece('daily-rp-left', 'red', 'pawn', 0, 6),
    puzzlePiece('daily-rp-mid', 'red', 'pawn', 4, 6),
    puzzlePiece('daily-bc-bottom', 'black', 'cannon', 3, 8),
    puzzlePiece('daily-ra-mid', 'red', 'advisor', 4, 8),
    puzzlePiece('daily-re-left', 'red', 'elephant', 2, 9),
    puzzlePiece('daily-ra-left', 'red', 'advisor', 3, 9),
    puzzlePiece('daily-rk', 'red', 'king', 4, 9),
    puzzlePiece('daily-re-right', 'red', 'elephant', 6, 9),
  ],
  sideToMove: 'red',
  goal: {
    type: 'capture-king',
    description: '红方将死黑方才算过关，黑方将死红方才算失败',
    maxMoves: 30,
    failureOnWrongMove: false,
  },
  hints: [
    hintFromMove(0, '车吃中士', 'daily-rr-center', { x: 4, y: 4 }, { x: 4, y: 1 }, '复刻每日截图：红车沿中路吃中士，先打开九宫防线。'),
  ],
  solutionLine: [
    {
      pieceId: 'daily-rr-center',
      from: { x: 4, y: 4 },
      to: { x: 4, y: 1 },
      note: '车五进三',
    },
  ],
  stats: {
    challengeCount: 8048,
    passRate: 0.62,
    fastestSeconds: 4,
    commentCount: 128,
  },
};

export const campaignPuzzles: Puzzle[] = [
  {
    id: 'campaign-001-double-pawn-lock',
    title: '双兵锁士',
    source: '用户截图第1关复刻',
    motif: '双兵封宫，吃士入局',
    difficulty: 1,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c1-bk', 'black', 'king', 4, 0),
      puzzlePiece('c1-ba', 'black', 'advisor', 4, 1),
      puzzlePiece('c1-bp-wing', 'black', 'pawn', 5, 0),
      puzzlePiece('c1-rp-left', 'red', 'pawn', 3, 1),
      puzzlePiece('c1-rp-right', 'red', 'pawn', 5, 1),
      puzzlePiece('c1-rk', 'red', 'king', 5, 7),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '红兵吃中士，双兵封死九宫',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '右兵吃中士', 'c1-rp-right', { x: 5, y: 1 }, { x: 4, y: 1 }, '复刻第1张图：兵吃中士后贴住将门，左兵守住另一侧逃点。'),
    ],
    solutionLine: [
      { pieceId: 'c1-rp-right', from: { x: 5, y: 1 }, to: { x: 4, y: 1 }, note: '兵四平五' },
    ],
    stats: puzzleStats(6231, 0.71, 5, 42),
  },
  {
    id: 'campaign-002-double-rook-gate',
    title: '双车封门',
    source: '用户截图第2关复刻',
    motif: '双车贴宫，边车牵制',
    difficulty: 1,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c2-bk', 'black', 'king', 3, 0),
      puzzlePiece('c2-rr-side', 'red', 'rook', 2, 1),
      puzzlePiece('c2-rr-file', 'red', 'rook', 5, 2),
      puzzlePiece('c2-br-left', 'black', 'rook', 1, 6),
      puzzlePiece('c2-br-mid', 'black', 'rook', 2, 7),
      puzzlePiece('c2-ra', 'red', 'advisor', 4, 7),
      puzzlePiece('c2-rk', 'red', 'king', 4, 8),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '红车贴将，另一车横守',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '边车贴肋', 'c2-rr-side', { x: 2, y: 1 }, { x: 3, y: 1 }, '复刻第2张图：左车贴到将下方，另一车在侧翼牵制。'),
    ],
    solutionLine: [
      { pieceId: 'c2-rr-side', from: { x: 2, y: 1 }, to: { x: 3, y: 1 }, note: '车七平六' },
    ],
    stats: puzzleStats(5812, 0.64, 6, 38),
  },
  {
    id: 'campaign-003-double-cannon-net',
    title: '多子夹攻',
    source: '用户截图第3关复刻',
    motif: '双炮车马混战，先占宫肋',
    difficulty: 2,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c3-bk', 'black', 'king', 3, 1),
      puzzlePiece('c3-ba', 'black', 'advisor', 4, 1),
      puzzlePiece('c3-rc-left', 'red', 'cannon', 3, 4),
      puzzlePiece('c3-rc-mid', 'red', 'cannon', 4, 3),
      puzzlePiece('c3-rr', 'red', 'rook', 0, 5),
      puzzlePiece('c3-br', 'black', 'rook', 5, 5),
      puzzlePiece('c3-bh', 'black', 'horse', 6, 6),
      puzzlePiece('c3-be-red', 'red', 'elephant', 4, 7),
      puzzlePiece('c3-bc-corner', 'black', 'cannon', 8, 9),
      puzzlePiece('c3-ra', 'red', 'advisor', 5, 9),
      puzzlePiece('c3-re', 'red', 'elephant', 6, 9),
      puzzlePiece('c3-rk', 'red', 'king', 4, 9),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '后炮归中，以前炮为炮架照宫',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '炮压宫肋', 'c3-rc-left', { x: 3, y: 4 }, { x: 3, y: 2 }, '复刻第3张图：先把河口炮压上去，封住将侧活动空间。'),
    ],
    solutionLine: [
      { pieceId: 'c3-rc-left', from: { x: 3, y: 4 }, to: { x: 3, y: 2 }, note: '炮六进二' },
    ],
    stats: puzzleStats(5489, 0.58, 7, 34),
  },
  {
    id: 'campaign-004-horse-cannon-cage',
    title: '车炮困宫',
    source: '用户截图第4关复刻',
    motif: '车炮贴宫，黑车守边',
    difficulty: 2,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c4-bk', 'black', 'king', 4, 0),
      puzzlePiece('c4-ba-right', 'black', 'advisor', 5, 0),
      puzzlePiece('c4-ba-mid', 'black', 'advisor', 4, 1),
      puzzlePiece('c4-be', 'black', 'elephant', 4, 2),
      puzzlePiece('c4-be-river', 'black', 'elephant', 6, 4),
      puzzlePiece('c4-rr-palace', 'red', 'rook', 5, 1),
      puzzlePiece('c4-br-side', 'black', 'rook', 8, 6),
      puzzlePiece('c4-rc', 'red', 'cannon', 6, 2),
      puzzlePiece('c4-bc-left', 'black', 'cannon', 7, 9),
      puzzlePiece('c4-bc-right', 'black', 'cannon', 8, 9),
      puzzlePiece('c4-bp', 'black', 'pawn', 0, 4),
      puzzlePiece('c4-ra-left', 'red', 'advisor', 4, 8),
      puzzlePiece('c4-ra-right', 'red', 'advisor', 3, 9),
      puzzlePiece('c4-rk', 'red', 'king', 5, 8),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '红车贴宫吃士，红炮在侧翼牵制',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '车吃右士', 'c4-rr-palace', { x: 5, y: 1 }, { x: 5, y: 0 }, '复刻第4张图：红车在黑宫右肋，先吃右士打开宫门；右边河下那枚车是黑车。'),
    ],
    solutionLine: [
      { pieceId: 'c4-rr-palace', from: { x: 5, y: 1 }, to: { x: 5, y: 0 }, note: '车四进一' },
    ],
    stats: puzzleStats(4972, 0.52, 9, 31),
  },
  {
    id: 'campaign-005-horse-pawn-side',
    title: '马兵侧击',
    source: '用户截图第5关复刻',
    motif: '马兵贴宫，先抢将侧',
    difficulty: 3,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c5-bk', 'black', 'king', 3, 0),
      puzzlePiece('c5-ba', 'black', 'advisor', 3, 2),
      puzzlePiece('c5-bh', 'black', 'horse', 2, 5),
      puzzlePiece('c5-rp', 'red', 'pawn', 5, 1),
      puzzlePiece('c5-rh', 'red', 'horse', 5, 2),
      puzzlePiece('c5-rk', 'red', 'king', 3, 9),
      puzzlePiece('c5-re', 'red', 'elephant', 6, 9),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '红马先进将侧，兵从上方压宫',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '马跳将侧', 'c5-rh', { x: 5, y: 2 }, { x: 3, y: 1 }, '复刻第5张图：马跳到将侧，配合顶兵压住九宫。'),
    ],
    solutionLine: [
      { pieceId: 'c5-rh', from: { x: 5, y: 2 }, to: { x: 3, y: 1 }, note: '马四进六' },
    ],
    stats: puzzleStats(4972, 0.52, 9, 31),
  },
  {
    id: 'campaign-006-horse-cannon-pressure',
    title: '马炮压顶',
    source: '用户截图第6关复刻',
    motif: '马炮夹宫，兵控河口',
    difficulty: 3,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c6-bc-top', 'black', 'cannon', 3, 0),
      puzzlePiece('c6-bk', 'black', 'king', 4, 1),
      puzzlePiece('c6-ba', 'black', 'advisor', 3, 2),
      puzzlePiece('c6-be', 'black', 'elephant', 4, 2),
      puzzlePiece('c6-bh-river', 'black', 'horse', 2, 4),
      puzzlePiece('c6-bh-bottom', 'black', 'horse', 3, 6),
      puzzlePiece('c6-rc-top', 'red', 'cannon', 8, 0),
      puzzlePiece('c6-rh', 'red', 'horse', 6, 1),
      puzzlePiece('c6-rp-mid', 'red', 'pawn', 4, 4),
      puzzlePiece('c6-rp-side', 'red', 'pawn', 8, 6),
      puzzlePiece('c6-rk', 'red', 'king', 4, 9),
      puzzlePiece('c6-re', 'red', 'elephant', 6, 9),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '红马抢顶，配合边炮压住将位',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '马跃顶宫', 'c6-rh', { x: 6, y: 1 }, { x: 4, y: 0 }, '复刻第6张图：马跃到将顶，边炮和中兵一起限制黑方腾挪。'),
    ],
    solutionLine: [
      { pieceId: 'c6-rh', from: { x: 6, y: 1 }, to: { x: 4, y: 0 }, note: '马三进五' },
    ],
    stats: puzzleStats(4650, 0.49, 10, 29),
  },
  {
    id: 'campaign-007-cannon-elephant-wall',
    title: '炮轰象墙',
    source: '用户截图第7关复刻',
    motif: '边炮牵制，宫顶马象成墙',
    difficulty: 3,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c7-bk', 'black', 'king', 4, 0),
      puzzlePiece('c7-be-top', 'black', 'elephant', 2, 0),
      puzzlePiece('c7-bh', 'black', 'horse', 4, 1),
      puzzlePiece('c7-be-mid', 'black', 'elephant', 4, 2),
      puzzlePiece('c7-bc-left', 'black', 'cannon', 0, 2),
      puzzlePiece('c7-rc-left', 'red', 'cannon', 1, 3),
      puzzlePiece('c7-re-mid', 'red', 'elephant', 4, 7),
      puzzlePiece('c7-ra', 'red', 'advisor', 4, 8),
      puzzlePiece('c7-rk', 'red', 'king', 4, 9),
      puzzlePiece('c7-re-right', 'red', 'elephant', 6, 9),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '红炮先进河口，借边路牵制象马墙',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '红炮进压', 'c7-rc-left', { x: 1, y: 3 }, { x: 1, y: 1 }, '复刻第7张图：红炮压到黑炮下方，先牵住左翼炮象结构。'),
    ],
    solutionLine: [
      { pieceId: 'c7-rc-left', from: { x: 1, y: 3 }, to: { x: 1, y: 1 }, note: '炮八进二' },
    ],
    stats: puzzleStats(4210, 0.44, 12, 26),
  },
  {
    id: 'campaign-008-horse-cannon-wall',
    title: '马炮压墙',
    source: '用户截图第8关复刻',
    motif: '马炮夹宫，双象士成墙',
    difficulty: 3,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c8-bk', 'black', 'king', 4, 0),
      puzzlePiece('c8-ba-right', 'black', 'advisor', 5, 0),
      puzzlePiece('c8-be-right', 'black', 'elephant', 6, 0),
      puzzlePiece('c8-ba-mid', 'black', 'advisor', 4, 1),
      puzzlePiece('c8-be-mid', 'black', 'elephant', 4, 2),
      puzzlePiece('c8-bh', 'black', 'horse', 4, 3),
      puzzlePiece('c8-bp', 'black', 'pawn', 0, 3),
      puzzlePiece('c8-bc-left', 'black', 'cannon', 0, 5),
      puzzlePiece('c8-rc-top', 'red', 'cannon', 1, 0),
      puzzlePiece('c8-rh', 'red', 'horse', 5, 3),
      puzzlePiece('c8-rk', 'red', 'king', 3, 7),
      puzzlePiece('c8-ra', 'red', 'advisor', 3, 9),
      puzzlePiece('c8-re', 'red', 'elephant', 6, 9),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '红马先吃中士，打松黑方宫墙',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '马吃中士', 'c8-rh', { x: 5, y: 3 }, { x: 4, y: 1 }, '复刻第8张图：红马先进中士位，先拆黑方九宫防线。'),
    ],
    solutionLine: [
      { pieceId: 'c8-rh', from: { x: 5, y: 3 }, to: { x: 4, y: 1 }, note: '马四进五' },
    ],
    stats: puzzleStats(3920, 0.39, 14, 24),
  },
  {
    id: 'campaign-009-horse-pawn-elephant',
    title: '兵马破象',
    source: '用户截图第9关复刻',
    motif: '兵马靠宫，黑象挡门',
    difficulty: 3,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c9-bk', 'black', 'king', 4, 0),
      puzzlePiece('c9-be-top', 'black', 'elephant', 2, 0),
      puzzlePiece('c9-be-mid', 'black', 'elephant', 4, 2),
      puzzlePiece('c9-bh-bottom', 'black', 'horse', 4, 8),
      puzzlePiece('c9-rp-top', 'red', 'pawn', 3, 1),
      puzzlePiece('c9-rh-side', 'red', 'horse', 6, 2),
      puzzlePiece('c9-rk', 'red', 'king', 3, 9),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '红兵横进宫肋，配合侧马压将',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '兵横入肋', 'c9-rp-top', { x: 3, y: 1 }, { x: 4, y: 1 }, '复刻第9张图：顶兵先进宫肋，给红马创造贴宫攻击点。'),
    ],
    solutionLine: [
      { pieceId: 'c9-rp-top', from: { x: 3, y: 1 }, to: { x: 4, y: 1 }, note: '兵六平五' },
    ],
    stats: puzzleStats(3504, 0.34, 16, 21),
  },
  {
    id: 'campaign-010-chaotic-left-net',
    title: '左翼混战',
    source: '用户截图第10关复刻',
    motif: '车马炮兵挤压左宫',
    difficulty: 3,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c10-be-top', 'black', 'elephant', 2, 0),
      puzzlePiece('c10-br-left', 'black', 'rook', 1, 1),
      puzzlePiece('c10-bk', 'black', 'king', 3, 1),
      puzzlePiece('c10-be-mid', 'black', 'elephant', 4, 2),
      puzzlePiece('c10-bh-mid', 'black', 'horse', 3, 3),
      puzzlePiece('c10-bh-river', 'black', 'horse', 5, 5),
      puzzlePiece('c10-bp-bottom', 'black', 'pawn', 4, 8),
      puzzlePiece('c10-rp-top', 'red', 'pawn', 4, 0),
      puzzlePiece('c10-rp-left', 'red', 'pawn', 2, 2),
      puzzlePiece('c10-rh-left', 'red', 'horse', 2, 3),
      puzzlePiece('c10-rc-left', 'red', 'cannon', 0, 5),
      puzzlePiece('c10-rc-mid', 'red', 'cannon', 4, 6),
      puzzlePiece('c10-rk', 'red', 'king', 5, 9),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '顶兵横走，先卡住黑将旁侧',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '顶兵横压', 'c10-rp-top', { x: 4, y: 0 }, { x: 3, y: 0 }, '复刻第10张图：顶兵横到将顶一侧，先压住黑将退路。'),
    ],
    solutionLine: [
      { pieceId: 'c10-rp-top', from: { x: 4, y: 0 }, to: { x: 3, y: 0 }, note: '兵五平六' },
    ],
    stats: puzzleStats(3188, 0.31, 18, 19),
  },
  {
    id: 'campaign-011-rook-in-palace',
    title: '车入中宫',
    source: '用户截图第11关复刻',
    motif: '红车贴宫，边马炮牵制',
    difficulty: 4,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c11-bk', 'black', 'king', 4, 0),
      puzzlePiece('c11-ba-left', 'black', 'advisor', 3, 0),
      puzzlePiece('c11-ba-mid', 'black', 'advisor', 4, 1),
      puzzlePiece('c11-bh-top', 'black', 'horse', 7, 0),
      puzzlePiece('c11-bc-top', 'black', 'cannon', 8, 0),
      puzzlePiece('c11-br-bottom', 'black', 'rook', 2, 8),
      puzzlePiece('c11-rr-palace', 'red', 'rook', 4, 2),
      puzzlePiece('c11-rh-left', 'red', 'horse', 1, 3),
      puzzlePiece('c11-rp-mid', 'red', 'pawn', 4, 6),
      puzzlePiece('c11-rk', 'red', 'king', 5, 7),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '红车进宫先吃中士，继续压将',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '车吃中士', 'c11-rr-palace', { x: 4, y: 2 }, { x: 4, y: 1 }, '复刻第11张图：红车已经入宫，先吃中士继续逼将。'),
    ],
    solutionLine: [
      { pieceId: 'c11-rr-palace', from: { x: 4, y: 2 }, to: { x: 4, y: 1 }, note: '车五退一' },
    ],
    stats: puzzleStats(2861, 0.28, 21, 16),
  },
  {
    id: 'campaign-012-double-rook-horse',
    title: '双车马攻',
    source: '用户截图第12关复刻',
    motif: '双车守底，马炮兵多线牵制',
    difficulty: 4,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c12-bk', 'black', 'king', 5, 0),
      puzzlePiece('c12-be-top', 'black', 'elephant', 6, 0),
      puzzlePiece('c12-ba', 'black', 'advisor', 4, 1),
      puzzlePiece('c12-bc-mid', 'black', 'cannon', 4, 2),
      puzzlePiece('c12-be-side', 'black', 'elephant', 8, 2),
      puzzlePiece('c12-bp-left', 'black', 'pawn', 0, 3),
      puzzlePiece('c12-bp-right', 'black', 'pawn', 8, 3),
      puzzlePiece('c12-bh-bottom', 'black', 'horse', 2, 8),
      puzzlePiece('c12-br-left', 'black', 'rook', 3, 9),
      puzzlePiece('c12-br-right', 'black', 'rook', 5, 9),
      puzzlePiece('c12-rc-top', 'red', 'cannon', 8, 1),
      puzzlePiece('c12-rh-mid', 'red', 'horse', 6, 3),
      puzzlePiece('c12-rp-left', 'red', 'pawn', 0, 6),
      puzzlePiece('c12-rp-right', 'red', 'pawn', 8, 6),
      puzzlePiece('c12-rk', 'red', 'king', 4, 8),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '红马先进中肋，避开黑方双车底线反扑',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '马入中肋', 'c12-rh-mid', { x: 6, y: 3 }, { x: 5, y: 1 }, '复刻第12张图：红马先跳到将侧中肋，准备配合边炮和双兵。'),
    ],
    solutionLine: [
      { pieceId: 'c12-rh-mid', from: { x: 6, y: 3 }, to: { x: 5, y: 1 }, note: '马三进五' },
    ],
    stats: puzzleStats(2510, 0.25, 24, 14),
  },
  {
    id: 'campaign-013-three-cannon-edge',
    title: '三炮临边',
    source: '用户截图第13关复刻',
    motif: '三炮夹宫，边车炮牵制',
    difficulty: 4,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c13-bk', 'black', 'king', 3, 0),
      puzzlePiece('c13-bp-river', 'black', 'pawn', 6, 6),
      puzzlePiece('c13-br-edge', 'black', 'rook', 8, 7),
      puzzlePiece('c13-bc-edge', 'black', 'cannon', 8, 8),
      puzzlePiece('c13-rc-mid', 'red', 'cannon', 4, 1),
      puzzlePiece('c13-rh-mid', 'red', 'horse', 5, 1),
      puzzlePiece('c13-rc-side', 'red', 'cannon', 7, 1),
      puzzlePiece('c13-rp-side', 'red', 'pawn', 8, 5),
      puzzlePiece('c13-rk', 'red', 'king', 4, 8),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '中炮先下压，保持三炮夹宫态势',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '中炮下压', 'c13-rc-mid', { x: 4, y: 1 }, { x: 4, y: 2 }, '复刻第13张图：中炮先下压一步，给马炮夹攻留出后续空间。'),
    ],
    solutionLine: [
      { pieceId: 'c13-rc-mid', from: { x: 4, y: 1 }, to: { x: 4, y: 2 }, note: '炮五进一' },
    ],
    stats: puzzleStats(2188, 0.22, 29, 12),
  },
  {
    id: 'campaign-014-lone-horse',
    title: '单马破士',
    source: '用户截图第14关复刻',
    motif: '单马贴宫，先破中士',
    difficulty: 5,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c14-bk', 'black', 'king', 5, 0),
      puzzlePiece('c14-ba', 'black', 'advisor', 5, 2),
      puzzlePiece('c14-rh', 'red', 'horse', 4, 4),
      puzzlePiece('c14-rk', 'red', 'king', 5, 9),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '单马先吃中士，进入精细收束',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '马踩中士', 'c14-rh', { x: 4, y: 4 }, { x: 5, y: 2 }, '复刻第14张图：单马先踩中士，保留后续将门控制。'),
    ],
    solutionLine: [
      { pieceId: 'c14-rh', from: { x: 4, y: 4 }, to: { x: 5, y: 2 }, note: '马五进六' },
    ],
    stats: puzzleStats(1930, 0.2, 32, 10),
  },
  {
    id: 'campaign-015-double-horse-cannon',
    title: '双马边炮',
    source: '用户截图第15关复刻',
    motif: '双马贴宫，边炮牵制',
    difficulty: 5,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c15-br-top', 'black', 'rook', 2, 0),
      puzzlePiece('c15-ba-top', 'black', 'advisor', 3, 0),
      puzzlePiece('c15-bk', 'black', 'king', 5, 0),
      puzzlePiece('c15-ba-mid', 'black', 'advisor', 4, 1),
      puzzlePiece('c15-be-left', 'black', 'elephant', 0, 2),
      puzzlePiece('c15-bc-mid', 'black', 'cannon', 3, 2),
      puzzlePiece('c15-bp-left', 'black', 'pawn', 3, 8),
      puzzlePiece('c15-bp-right', 'black', 'pawn', 6, 8),
      puzzlePiece('c15-bc-bottom', 'black', 'cannon', 7, 8),
      puzzlePiece('c15-rh-left', 'red', 'horse', 6, 1),
      puzzlePiece('c15-rh-right', 'red', 'horse', 7, 1),
      puzzlePiece('c15-rc-side', 'red', 'cannon', 8, 3),
      puzzlePiece('c15-ra-mid', 'red', 'advisor', 5, 7),
      puzzlePiece('c15-rk', 'red', 'king', 4, 9),
      puzzlePiece('c15-ra-right', 'red', 'advisor', 5, 9),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '双马贴近九宫，先跳将顶压门',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '马跳将顶', 'c15-rh-left', { x: 6, y: 1 }, { x: 4, y: 0 }, '复刻第15张图：左马先跳到将顶，配合右马和边炮形成贴宫压力。'),
    ],
    solutionLine: [
      { pieceId: 'c15-rh-left', from: { x: 6, y: 1 }, to: { x: 4, y: 0 }, note: '马三进五' },
    ],
    stats: puzzleStats(1684, 0.18, 35, 9),
  },
  {
    id: 'campaign-016-left-wing-chaos',
    title: '左翼车马',
    source: '用户截图第16关复刻',
    motif: '车马兵象左翼混战，士象护宫',
    difficulty: 5,
    mode: 'free-mate',
    pieces: [
      puzzlePiece('c16-bk', 'black', 'king', 4, 0),
      puzzlePiece('c16-ba', 'black', 'advisor', 5, 0),
      puzzlePiece('c16-be-top', 'black', 'elephant', 2, 0),
      puzzlePiece('c16-ba-side', 'black', 'advisor', 5, 2),
      puzzlePiece('c16-be-river', 'black', 'elephant', 2, 4),
      puzzlePiece('c16-bp-left', 'black', 'pawn', 0, 4),
      puzzlePiece('c16-bp-right', 'black', 'pawn', 8, 3),
      puzzlePiece('c16-br-left', 'black', 'rook', 1, 2),
      puzzlePiece('c16-rr-top', 'red', 'rook', 3, 1),
      puzzlePiece('c16-rh-left', 'red', 'horse', 2, 2),
      puzzlePiece('c16-rp-side', 'red', 'pawn', 8, 6),
      puzzlePiece('c16-ra-mid', 'red', 'advisor', 4, 8),
      puzzlePiece('c16-ra-left', 'red', 'advisor', 3, 9),
      puzzlePiece('c16-rk', 'red', 'king', 4, 9),
    ],
    sideToMove: 'red',
    goal: {
      type: 'solution-line',
      description: '红车先横贴宫肋，配合左翼马兵控将',
      maxMoves: 12,
      failureOnWrongMove: true,
    },
    hints: [
      hintFromMove(0, '车平将肋', 'c16-rr-top', { x: 3, y: 1 }, { x: 4, y: 1 }, '复刻第16张图：红车先横到将下方，配合左马和边兵压住宫门。'),
    ],
    solutionLine: [
      { pieceId: 'c16-rr-top', from: { x: 3, y: 1 }, to: { x: 4, y: 1 }, note: '车六平五' },
    ],
    stats: puzzleStats(1420, 0.16, 39, 8),
  },
];

export function getCampaignPuzzle(level: number): Puzzle {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return campaignPuzzles[(safeLevel - 1) % campaignPuzzles.length];
}

export function getPuzzleById(puzzleId: string): Puzzle | undefined {
  return [dailyPuzzle, ...campaignPuzzles].find((puzzle) => puzzle.id === puzzleId);
}

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

export function undoPuzzleStep(puzzle: Puzzle, session: PuzzleSession, stepCount = 1): PuzzleSession {
  const remainingHistory = session.moveHistory.slice(0, Math.max(0, session.moveHistory.length - Math.max(1, stepCount)));
  let pieces = clonePieces(puzzle.pieces);
  remainingHistory.forEach((move) => {
    pieces = movePiece(pieces, move.pieceId, move.to);
  });

  return {
    ...session,
    pieces,
    turn: remainingHistory.length % 2 === 0 ? puzzle.sideToMove : opposite(puzzle.sideToMove),
    status: remainingHistory.length === 0 ? 'ready' : 'playing',
    steps: remainingHistory.length,
    progressIndex: Math.min(session.progressIndex, remainingHistory.length),
    moveHistory: remainingHistory,
    revealedHint: null,
  };
}

export function undoPuzzleRound(puzzle: Puzzle, session: PuzzleSession): PuzzleSession {
  const stepCount = session.turn === puzzle.sideToMove ? 2 : 1;
  return undoPuzzleStep(puzzle, session, stepCount);
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

export function applyPuzzleFreeMove(
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

  const captured = getPieceAt(session.pieces, attempt.to);
  const move: Move = {
    pieceId: piece.id,
    from: { x: piece.x, y: piece.y },
    to: { ...attempt.to },
    captured,
    notation: formatPuzzleMove(piece, attempt.to, captured),
  };
  const nextPieces = movePiece(session.pieces, piece.id, attempt.to);
  const rival = opposite(piece.side);
  const rivalDefeatReason = getDefeatReason(nextPieces, rival);
  const playerMoved = piece.side === puzzle.sideToMove;

  if (rivalDefeatReason) {
    const winnerMessage = rivalDefeatReason === 'checkmate'
      ? '将死黑方，挑战成功。'
      : '黑方无合法应手，挑战成功。';
    const loserMessage = rivalDefeatReason === 'checkmate'
      ? '黑方将死我方，挑战失败。'
      : '我方无合法应手，挑战失败。';
    return {
      session: {
        ...session,
        pieces: nextPieces,
        turn: rival,
        status: playerMoved ? 'solved' : 'failed',
        steps: session.steps + 1,
        progressIndex: session.progressIndex + 1,
        moveHistory: [...session.moveHistory, move],
        revealedHint: null,
      },
      verdict: playerMoved ? 'success' : 'failure',
      message: playerMoved ? winnerMessage : loserMessage,
      move,
      hint: null,
    };
  }

  return {
    session: {
      ...session,
      pieces: nextPieces,
      turn: rival,
      status: 'playing',
      steps: session.steps + 1,
      progressIndex: session.progressIndex,
      moveHistory: [...session.moveHistory, move],
      revealedHint: null,
    },
    verdict: 'correct',
    message: playerMoved ? '这步还没有将死黑方，轮到黑方应手。' : '黑方已应手，继续寻找杀法。',
    move,
    hint: getNextPuzzleHint(puzzle, session),
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
  if (puzzle.goal.type === 'checkmate') return Boolean(getDefeatReason(pieces, opposite(findPiece(pieces, move.pieceId)?.side ?? puzzle.sideToMove)));
  return false;
}

function formatPuzzleMove(piece: Piece, to: Position, captured?: Piece): string {
  return `${piece.label}${piece.x},${piece.y}-${to.x},${to.y}${captured ? ` 吃${captured.label}` : ''}`;
}
