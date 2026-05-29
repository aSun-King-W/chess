export type XiangqiFlipChessArenaId = 'training' | 'normal' | 'middle' | 'expert' | 'elite' | 'friend';
export type XiangqiFlipChessSide = 'red' | 'black';
export type XiangqiFlipChessPhase = 'red-choice' | 'playing' | 'finished';
export type XiangqiFlipChessOpeningChoice = 'claim-red' | 'pass';
export type XiangqiFlipChessPieceKind = 'general' | 'advisor' | 'elephant' | 'horse' | 'rook' | 'cannon' | 'pawn';
export type XiangqiFlipChessResult = 'red-win' | 'black-win' | 'unfinished';
export type XiangqiFlipChessSafePlaceholderId = 'friend-invite' | 'share' | 'force-exit-timeout';

export type XiangqiFlipChessArenaConfig = {
  id: XiangqiFlipChessArenaId;
  title: string;
  entryTitle: string;
  ticket: number;
  resourceType: '银币' | '好友房';
  initialHp: number;
  baseMultiplier: number;
  maxMultiplier: number;
  forceExitPenaltyMultiplier: number;
  settlementType: '银币倍率' | '非计分';
  description: string;
  rules: string[];
};

export type XiangqiFlipChessPiece = {
  id: string;
  cellId: string;
  side: XiangqiFlipChessSide;
  kind: XiangqiFlipChessPieceKind;
  label: string;
  rank: number;
  damage: number;
  flipMultiplier: number;
  hidden: boolean;
  captured: boolean;
};

export type XiangqiFlipChessActionRecord = {
  id: string;
  type: 'opening' | 'flip' | 'move' | 'capture' | 'finish';
  side: XiangqiFlipChessSide;
  notation: string;
  multiplierAfter: number;
  redHp: number;
  blackHp: number;
};

export type XiangqiFlipChessGameState = {
  id: string;
  moduleName: '翻翻棋';
  arena: XiangqiFlipChessArenaConfig;
  phase: XiangqiFlipChessPhase;
  board: { rows: number; cols: number; cells: string[] };
  pieces: XiangqiFlipChessPiece[];
  playerSide: XiangqiFlipChessSide | null;
  turnSide: XiangqiFlipChessSide | null;
  openingChoice: XiangqiFlipChessOpeningChoice | null;
  redHp: number;
  blackHp: number;
  multiplier: number;
  moveNumber: number;
  consecutiveCaptures: { red: number; black: number };
  capturedBy: Record<XiangqiFlipChessSide, XiangqiFlipChessPiece[]>;
  result: XiangqiFlipChessResult;
  records: XiangqiFlipChessActionRecord[];
};

export type XiangqiFlipChessTrophyStack = {
  side: XiangqiFlipChessSide;
  label: string;
  count: number;
  pieces: Array<{ label: string; kind: XiangqiFlipChessPieceKind }>;
};

export type XiangqiFlipChessSettlement = {
  title: string;
  result: XiangqiFlipChessResult;
  winnerSide: XiangqiFlipChessSide | null;
  coinDelta: number;
  balanceAfter: number;
  summary: string;
  rows: Array<{ title: string; detail: string }>;
  actions: Array<{ id: string; label: string; safePlaceholder?: XiangqiFlipChessSafePlaceholderId }>;
};

export type XiangqiFlipChessSafePlaceholder = {
  id: XiangqiFlipChessSafePlaceholderId;
  title: string;
  message: string;
  available: false;
  localOnly: true;
};

export type XiangqiFlipChessGameOptions = {
  arenaId?: XiangqiFlipChessArenaId;
  seed?: number;
  pieces?: XiangqiFlipChessPiece[];
};

const BOARD_ROWS = 8;
const BOARD_COLS = 4;
const FLIP_CHESS_MODULE_NAME = '翻翻棋';

export const xiangqiFlipChessArenas: readonly XiangqiFlipChessArenaConfig[] = [
  {
    id: 'training',
    title: '新手训练场',
    entryTitle: '新手训练场',
    ticket: 0,
    resourceType: '银币',
    initialHp: 60,
    baseMultiplier: 8,
    maxMultiplier: 1000,
    forceExitPenaltyMultiplier: 400,
    settlementType: '银币倍率',
    description: '对局门票开局扣除，上限倍率1000，强退超时至少扣400倍。',
    rules: ['抢红争先可加倍，选择不抢则等待红方先动。', '暗子翻开后归属红黑阵营。', '吃子按棋子伤害扣血，血量归零结束。'],
  },
  {
    id: 'normal',
    title: '普通场',
    entryTitle: '普通场',
    ticket: 200,
    resourceType: '银币',
    initialHp: 60,
    baseMultiplier: 8,
    maxMultiplier: 1000,
    forceExitPenaltyMultiplier: 400,
    settlementType: '银币倍率',
    description: '普通银币场，按倍率、连击和血差结算。',
    rules: ['银币不足时只展示本地救济提示。', '强退和超时按至少400倍提示处理。'],
  },
  {
    id: 'middle',
    title: '中级场',
    entryTitle: '中级场',
    ticket: 1000,
    resourceType: '银币',
    initialHp: 60,
    baseMultiplier: 12,
    maxMultiplier: 1000,
    forceExitPenaltyMultiplier: 400,
    settlementType: '银币倍率',
    description: '中级银币场，初始倍率更高。',
    rules: ['准入余额由主线程展示，本地 helper 不发起充值。'],
  },
  {
    id: 'expert',
    title: '高手场',
    entryTitle: '高手场',
    ticket: 3000,
    resourceType: '银币',
    initialHp: 60,
    baseMultiplier: 16,
    maxMultiplier: 1000,
    forceExitPenaltyMultiplier: 400,
    settlementType: '银币倍率',
    description: '高手银币场，适合高倍率对局。',
    rules: ['倍率仍受1000上限保护。'],
  },
  {
    id: 'elite',
    title: '精英场',
    entryTitle: '精英场',
    ticket: 6000,
    resourceType: '银币',
    initialHp: 60,
    baseMultiplier: 20,
    maxMultiplier: 1000,
    forceExitPenaltyMultiplier: 400,
    settlementType: '银币倍率',
    description: '精英银币场，保留高倍率结算文案。',
    rules: ['本地版不校验真实账号资产。'],
  },
  {
    id: 'friend',
    title: '好友对战',
    entryTitle: '好友对战',
    ticket: 0,
    resourceType: '好友房',
    initialHp: 60,
    baseMultiplier: 8,
    maxMultiplier: 1000,
    forceExitPenaltyMultiplier: 400,
    settlementType: '非计分',
    description: '本地好友房只生成桌号和邀请占位，不触发外部分享。',
    rules: ['好友邀请、复制和分享均由安全占位承接。'],
  },
] as const;

const pieceBlueprints: Array<{
  side: XiangqiFlipChessSide;
  kind: XiangqiFlipChessPieceKind;
  label: string;
  rank: number;
  damage: number;
  flipMultiplier: number;
  count: number;
}> = [
  { side: 'red', kind: 'general', label: '帅', rank: 7, damage: 14, flipMultiplier: 6, count: 1 },
  { side: 'black', kind: 'general', label: '将', rank: 7, damage: 14, flipMultiplier: 6, count: 1 },
  { side: 'red', kind: 'advisor', label: '仕', rank: 6, damage: 5, flipMultiplier: 2, count: 2 },
  { side: 'black', kind: 'advisor', label: '士', rank: 6, damage: 5, flipMultiplier: 2, count: 2 },
  { side: 'red', kind: 'elephant', label: '相', rank: 5, damage: 6, flipMultiplier: 3, count: 2 },
  { side: 'black', kind: 'elephant', label: '象', rank: 5, damage: 6, flipMultiplier: 3, count: 2 },
  { side: 'red', kind: 'rook', label: '车', rank: 4, damage: 10, flipMultiplier: 5, count: 2 },
  { side: 'black', kind: 'rook', label: '车', rank: 4, damage: 10, flipMultiplier: 5, count: 2 },
  { side: 'red', kind: 'horse', label: '马', rank: 3, damage: 8, flipMultiplier: 4, count: 2 },
  { side: 'black', kind: 'horse', label: '马', rank: 3, damage: 8, flipMultiplier: 4, count: 2 },
  { side: 'red', kind: 'cannon', label: '炮', rank: 2, damage: 8, flipMultiplier: 4, count: 2 },
  { side: 'black', kind: 'cannon', label: '炮', rank: 2, damage: 8, flipMultiplier: 4, count: 2 },
  { side: 'red', kind: 'pawn', label: '兵', rank: 1, damage: 4, flipMultiplier: 2, count: 5 },
  { side: 'black', kind: 'pawn', label: '卒', rank: 1, damage: 4, flipMultiplier: 2, count: 5 },
];

export function getFlipChessArenaConfig(arenaId: XiangqiFlipChessArenaId): XiangqiFlipChessArenaConfig {
  const config = xiangqiFlipChessArenas.find((item) => item.id === arenaId);
  if (!config) throw new Error(`Unknown flip chess arena: ${arenaId}`);
  return { ...config, rules: [...config.rules] };
}

export function getFlipChessArenaRows(arenaId: XiangqiFlipChessArenaId): Array<{ title: string; detail: string }> {
  const config = getFlipChessArenaConfig(arenaId);
  return [
    { title: '场次', detail: config.title },
    { title: '对局门票', detail: config.ticket === 0 ? '免费' : `${config.ticket}${config.resourceType}` },
    { title: '血量', detail: `${config.initialHp}/${config.initialHp}` },
    { title: '上限倍率', detail: `${config.maxMultiplier}` },
    { title: '强退超时', detail: `至少扣${config.forceExitPenaltyMultiplier}倍` },
    { title: '结算', detail: config.settlementType },
  ];
}

export function createFlipChessGame(options: XiangqiFlipChessGameOptions = {}): XiangqiFlipChessGameState {
  const arena = getFlipChessArenaConfig(options.arenaId ?? 'training');
  const seed = options.seed ?? 1;
  const pieces = options.pieces ? cloneFlipChessPieces(options.pieces) : createInitialFlipChessPieces(seed);

  return {
    id: `flip-${arena.id}-${seed}`,
    moduleName: FLIP_CHESS_MODULE_NAME,
    arena,
    phase: 'red-choice',
    board: createFlipChessBoard(),
    pieces,
    playerSide: null,
    turnSide: null,
    openingChoice: null,
    redHp: arena.initialHp,
    blackHp: arena.initialHp,
    multiplier: arena.baseMultiplier,
    moveNumber: 0,
    consecutiveCaptures: { red: 0, black: 0 },
    capturedBy: { red: [], black: [] },
    result: 'unfinished',
    records: [],
  };
}

export function createInitialFlipChessPieces(seed = 1): XiangqiFlipChessPiece[] {
  const cells = createFlipChessBoard().cells;
  const pieces = pieceBlueprints.flatMap((blueprint) =>
    Array.from({ length: blueprint.count }, (_, index) => ({
      id: `${blueprint.side}-${blueprint.kind}-${index + 1}`,
      cellId: '',
      side: blueprint.side,
      kind: blueprint.kind,
      label: blueprint.label,
      rank: blueprint.rank,
      damage: blueprint.damage,
      flipMultiplier: blueprint.flipMultiplier,
      hidden: true,
      captured: false,
    })),
  );
  const ordered = rotatePieces(pieces, seed);

  return ordered.map((piece, index) => ({ ...piece, cellId: cells[index] }));
}

export function chooseFlipChessOpening(
  state: XiangqiFlipChessGameState,
  choice: XiangqiFlipChessOpeningChoice,
): XiangqiFlipChessGameState {
  ensurePhase(state, 'red-choice');
  const playerSide: XiangqiFlipChessSide = choice === 'claim-red' ? 'red' : 'black';
  const turnSide: XiangqiFlipChessSide = 'red';
  const multiplier = choice === 'claim-red'
    ? clampMultiplier(state.multiplier * 2, state.arena.maxMultiplier)
    : state.multiplier;
  const next = {
    ...cloneState(state),
    phase: 'playing' as const,
    playerSide,
    turnSide,
    openingChoice: choice,
    multiplier,
  };

  return appendRecord(next, {
    type: 'opening',
    side: turnSide,
    notation: choice === 'claim-red' ? '抢红争先，倍率翻倍' : '不抢，红方先动',
  });
}

export function previewFlipChessOpening(state: XiangqiFlipChessGameState, cellIds: string[]): XiangqiFlipChessGameState {
  ensurePhase(state, 'red-choice');
  const previewCells = new Set(cellIds);
  const next = cloneState(state);
  next.pieces = next.pieces.map((piece) => (
    previewCells.has(piece.cellId) && !piece.captured ? { ...piece, hidden: false } : piece
  ));
  return next;
}

export function flipFlipChessPiece(state: XiangqiFlipChessGameState, cellId: string): XiangqiFlipChessGameState {
  ensurePlaying(state);
  const piece = getActivePieceAt(state, cellId);
  if (!piece) throw new Error(`No flip chess piece at ${cellId}`);
  if (!piece.hidden) throw new Error(`${piece.label} at ${cellId} is already revealed`);

  const next = cloneState(state);
  next.pieces = next.pieces.map((item) => (item.id === piece.id ? { ...item, hidden: false } : item));
  next.multiplier = clampMultiplier(next.multiplier + piece.flipMultiplier, next.arena.maxMultiplier);
  next.moveNumber += 1;
  next.consecutiveCaptures = { red: 0, black: 0 };
  next.turnSide = oppositeSide(state.turnSide);

  return appendRecord(next, {
    type: 'flip',
    side: state.turnSide,
    notation: `${sideLabel(state.turnSide)}翻开${sideLabel(piece.side)}${piece.label}`,
  });
}

export function moveFlipChessPiece(
  state: XiangqiFlipChessGameState,
  pieceId: string,
  toCellId: string,
): XiangqiFlipChessGameState {
  ensurePlaying(state);
  const piece = findActivePiece(state, pieceId);
  if (!piece) throw new Error(`Unknown flip chess piece: ${pieceId}`);
  if (piece.hidden) throw new Error('Hidden pieces must be flipped before moving');
  if (piece.side !== state.turnSide) throw new Error(`It is ${sideLabel(state.turnSide)} turn`);
  if (getActivePieceAt(state, toCellId)) throw new Error(`${toCellId} is occupied`);
  if (!isAdjacentCell(piece.cellId, toCellId)) throw new Error('Only adjacent empty moves are supported');

  const next = cloneState(state);
  next.pieces = next.pieces.map((item) => (item.id === pieceId ? { ...item, cellId: toCellId } : item));
  next.moveNumber += 1;
  next.consecutiveCaptures = { ...next.consecutiveCaptures, [piece.side]: 0 };
  next.turnSide = oppositeSide(piece.side);

  return appendRecord(next, {
    type: 'move',
    side: piece.side,
    notation: `${sideLabel(piece.side)}${piece.label}移动到${toCellId}`,
  });
}

export function captureFlipChessPiece(
  state: XiangqiFlipChessGameState,
  attackerId: string,
  targetCellId: string,
): XiangqiFlipChessGameState {
  ensurePlaying(state);
  const attacker = findActivePiece(state, attackerId);
  const target = getActivePieceAt(state, targetCellId);
  if (!attacker) throw new Error(`Unknown flip chess piece: ${attackerId}`);
  if (!target) throw new Error(`No target at ${targetCellId}`);
  if (!canFlipChessPieceCapture(state, attacker, target)) {
    throw new Error(`${attacker.label}不能吃${target.label}`);
  }

  const combo = state.consecutiveCaptures[attacker.side] + 1;
  const damage = target.damage + Math.max(0, combo - 1) * 2;
  const next = cloneState(state);
  const targetHpKey = target.side === 'red' ? 'redHp' : 'blackHp';
  next[targetHpKey] = Math.max(0, next[targetHpKey] - damage);
  next.multiplier = clampMultiplier(next.multiplier + target.flipMultiplier + combo, next.arena.maxMultiplier);
  next.moveNumber += 1;
  next.consecutiveCaptures = {
    red: attacker.side === 'red' ? combo : 0,
    black: attacker.side === 'black' ? combo : 0,
  };
  next.capturedBy = {
    ...next.capturedBy,
    [attacker.side]: [...next.capturedBy[attacker.side], { ...target, captured: true, hidden: false }],
  };
  next.pieces = next.pieces
    .filter((piece) => piece.id !== target.id)
    .map((piece) => (piece.id === attacker.id ? { ...piece, cellId: targetCellId } : piece));
  next.turnSide = oppositeSide(attacker.side);

  const afterFinish = finishIfNeeded(next);
  return appendRecord(afterFinish, {
    type: afterFinish.phase === 'finished' ? 'finish' : 'capture',
    side: attacker.side,
    notation: `${sideLabel(attacker.side)}${attacker.label}吃${sideLabel(target.side)}${target.label}，${sideLabel(target.side)}扣${damage}血`,
  });
}

export function canFlipChessPieceCapture(
  state: XiangqiFlipChessGameState,
  attacker: XiangqiFlipChessPiece,
  target: XiangqiFlipChessPiece,
): boolean {
  if (state.phase !== 'playing') return false;
  if (attacker.hidden || attacker.captured || target.captured) return false;
  if (attacker.side !== state.turnSide) return false;

  if (attacker.kind === 'cannon') {
    return countScreensBetween(state, attacker.cellId, target.cellId) === 1;
  }

  if (target.hidden || attacker.side === target.side) return false;
  if (!isAdjacentCell(attacker.cellId, target.cellId)) return false;
  if (attacker.kind === 'pawn' && target.kind === 'general') return true;
  if (attacker.kind === 'general' && target.kind === 'pawn') return false;
  return attacker.rank >= target.rank;
}

export function getFlipChessTrophySidebar(state: XiangqiFlipChessGameState): Record<XiangqiFlipChessSide, XiangqiFlipChessTrophyStack[]> {
  return {
    red: buildTrophyStacks(state.capturedBy.red),
    black: buildTrophyStacks(state.capturedBy.black),
  };
}

export function createFlipChessSettlement(
  state: XiangqiFlipChessGameState,
  playerSide: XiangqiFlipChessSide = state.playerSide ?? 'red',
  startingSilver = 0,
): XiangqiFlipChessSettlement {
  const result = state.result;
  const winnerSide = result === 'red-win' ? 'red' : result === 'black-win' ? 'black' : null;
  const bloodDiff = playerSide === 'red' ? state.redHp - state.blackHp : state.blackHp - state.redHp;
  const rawDelta = Math.round(state.multiplier + Math.max(0, bloodDiff) * 0.25);
  const signedDelta = winnerSide === null ? 0 : winnerSide === playerSide ? rawDelta : -Math.max(state.arena.forceExitPenaltyMultiplier, rawDelta);
  const coinDelta = state.arena.settlementType === '非计分' ? 0 : signedDelta;
  const balanceAfter = startingSilver - state.arena.ticket + coinDelta;

  return {
    title: winnerSide ? `${sideLabel(winnerSide)}胜利` : '本局未结束',
    result,
    winnerSide,
    coinDelta,
    balanceAfter,
    summary: winnerSide
      ? `${winnerSide === playerSide ? '胜利' : '失败'}，银币 ${coinDelta >= 0 ? '+' : ''}${coinDelta}`
      : '本局尚未产生胜负，暂不结算银币。',
    rows: [
      { title: '场次', detail: state.arena.title },
      { title: '门票', detail: state.arena.ticket === 0 ? '免费' : `-${state.arena.ticket}银币` },
      { title: '抢先加倍', detail: state.openingChoice === 'claim-red' ? '已抢红，开局倍率翻倍' : '未抢红' },
      { title: '翻棋', detail: `${state.records.filter((record) => record.type === 'flip').length}次，当前${state.multiplier}倍` },
      { title: '连击', detail: `红${state.consecutiveCaptures.red} / 黑${state.consecutiveCaptures.black}` },
      { title: '血差', detail: `${sideLabel(playerSide)}${bloodDiff >= 0 ? '+' : ''}${bloodDiff}` },
      { title: '银币', detail: `${coinDelta >= 0 ? '+' : ''}${coinDelta}` },
    ],
    actions: [
      { id: 'switch-opponent', label: '切换对手' },
      { id: 'again', label: '再来一局' },
      { id: 'share', label: '分享', safePlaceholder: 'share' },
    ],
  };
}

export function getFlipChessReplayRows(state: XiangqiFlipChessGameState): Array<{ title: string; detail: string }> {
  return [
    { title: '模块', detail: state.moduleName },
    { title: '场次', detail: state.arena.title },
    { title: '阶段', detail: state.phase === 'finished' ? '已结束' : state.phase === 'red-choice' ? '抢红争先' : '对局中' },
    { title: '血量', detail: `红${state.redHp}/${state.arena.initialHp} · 黑${state.blackHp}/${state.arena.initialHp}` },
    { title: '倍率', detail: `${state.multiplier}倍，上限${state.arena.maxMultiplier}` },
    { title: '结算类型', detail: state.arena.settlementType },
    { title: '棋谱', detail: state.records.map((record) => record.notation).join(' / ') || '未开始' },
  ];
}

export function getFlipChessRecordRows(state: XiangqiFlipChessGameState): Array<{ title: string; detail: string }> {
  const winner = state.result === 'red-win' ? '红方胜' : state.result === 'black-win' ? '黑方胜' : '未完成';
  return [
    { title: '玩法', detail: FLIP_CHESS_MODULE_NAME },
    { title: '结果', detail: winner },
    { title: '场次', detail: state.arena.title },
    { title: '步数', detail: `${state.moveNumber}` },
    { title: '战利品', detail: `红${state.capturedBy.red.length} / 黑${state.capturedBy.black.length}` },
  ];
}

export function getFlipChessSafePlaceholder(id: XiangqiFlipChessSafePlaceholderId): XiangqiFlipChessSafePlaceholder {
  const placeholders: Record<XiangqiFlipChessSafePlaceholderId, XiangqiFlipChessSafePlaceholder> = {
    'friend-invite': {
      id,
      title: '好友对战',
      message: '真实好友邀请需要平台关系链，本地版只展示桌号和邀请占位，不拉起外部分享。',
      available: false,
      localOnly: true,
    },
    share: {
      id,
      title: '分享',
      message: '分享按钮只保留本地安全提示，不调用微信分享、复制链接或外部平台。',
      available: false,
      localOnly: true,
    },
    'force-exit-timeout': {
      id,
      title: '强退/超时',
      message: '强退或超时按至少400倍风险提示处理，本地版不扣真实资产。',
      available: false,
      localOnly: true,
    },
  };
  return placeholders[id];
}

export function revealPieceForTest(piece: XiangqiFlipChessPiece): XiangqiFlipChessPiece {
  return { ...piece, hidden: false };
}

function createFlipChessBoard(): { rows: number; cols: number; cells: string[] } {
  return {
    rows: BOARD_ROWS,
    cols: BOARD_COLS,
    cells: Array.from({ length: BOARD_ROWS * BOARD_COLS }, (_, index) => {
      const row = Math.floor(index / BOARD_COLS);
      const col = index % BOARD_COLS;
      return `f${row}-${col}`;
    }),
  };
}

function rotatePieces<T>(items: T[], seed: number): T[] {
  const offset = Math.abs(seed) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function cloneFlipChessPieces(pieces: XiangqiFlipChessPiece[]): XiangqiFlipChessPiece[] {
  return pieces.map((piece) => ({ ...piece }));
}

function cloneState(state: XiangqiFlipChessGameState): XiangqiFlipChessGameState {
  return {
    ...state,
    arena: { ...state.arena, rules: [...state.arena.rules] },
    board: { ...state.board, cells: [...state.board.cells] },
    pieces: cloneFlipChessPieces(state.pieces),
    consecutiveCaptures: { ...state.consecutiveCaptures },
    capturedBy: {
      red: cloneFlipChessPieces(state.capturedBy.red),
      black: cloneFlipChessPieces(state.capturedBy.black),
    },
    records: state.records.map((record) => ({ ...record })),
  };
}

function ensurePhase(state: XiangqiFlipChessGameState, phase: XiangqiFlipChessPhase): void {
  if (state.phase !== phase) throw new Error(`Flip chess phase must be ${phase}`);
}

function ensurePlaying(state: XiangqiFlipChessGameState): asserts state is XiangqiFlipChessGameState & { turnSide: XiangqiFlipChessSide } {
  if (state.phase !== 'playing' || !state.turnSide) throw new Error('Flip chess game is not playing');
}

function findActivePiece(state: XiangqiFlipChessGameState, pieceId: string): XiangqiFlipChessPiece | undefined {
  return state.pieces.find((piece) => piece.id === pieceId && !piece.captured);
}

function getActivePieceAt(state: XiangqiFlipChessGameState, cellId: string): XiangqiFlipChessPiece | undefined {
  return state.pieces.find((piece) => piece.cellId === cellId && !piece.captured);
}

function oppositeSide(side: XiangqiFlipChessSide): XiangqiFlipChessSide {
  return side === 'red' ? 'black' : 'red';
}

function sideLabel(side: XiangqiFlipChessSide | null): string {
  return side === 'red' ? '红方' : '黑方';
}

function appendRecord(
  state: XiangqiFlipChessGameState,
  input: Pick<XiangqiFlipChessActionRecord, 'type' | 'side' | 'notation'>,
): XiangqiFlipChessGameState {
  const next = cloneState(state);
  next.records = [
    ...next.records,
    {
      id: `${next.id}-${next.records.length + 1}`,
      type: input.type,
      side: input.side,
      notation: input.notation,
      multiplierAfter: next.multiplier,
      redHp: next.redHp,
      blackHp: next.blackHp,
    },
  ];
  return next;
}

function clampMultiplier(multiplier: number, maxMultiplier: number): number {
  return Math.max(1, Math.min(maxMultiplier, multiplier));
}

function parseCell(cellId: string): { row: number; col: number } {
  const match = /^f(\d+)-(\d+)$/.exec(cellId);
  if (!match) throw new Error(`Invalid flip chess cell: ${cellId}`);
  return { row: Number(match[1]), col: Number(match[2]) };
}

function isAdjacentCell(fromCellId: string, toCellId: string): boolean {
  const from = parseCell(fromCellId);
  const to = parseCell(toCellId);
  return Math.abs(from.row - to.row) + Math.abs(from.col - to.col) === 1;
}

function countScreensBetween(state: XiangqiFlipChessGameState, fromCellId: string, toCellId: string): number {
  const from = parseCell(fromCellId);
  const to = parseCell(toCellId);
  if (from.row !== to.row && from.col !== to.col) return -1;

  return state.pieces.filter((piece) => {
    if (piece.captured || piece.cellId === fromCellId || piece.cellId === toCellId) return false;
    const cell = parseCell(piece.cellId);
    if (from.row === to.row) {
      return cell.row === from.row && isBetween(cell.col, from.col, to.col);
    }
    return cell.col === from.col && isBetween(cell.row, from.row, to.row);
  }).length;
}

function isBetween(value: number, a: number, b: number): boolean {
  return value > Math.min(a, b) && value < Math.max(a, b);
}

function finishIfNeeded(state: XiangqiFlipChessGameState): XiangqiFlipChessGameState {
  if (state.redHp > 0 && state.blackHp > 0) return state;
  return {
    ...state,
    phase: 'finished',
    turnSide: null,
    result: state.redHp <= 0 ? 'black-win' : 'red-win',
  };
}

function buildTrophyStacks(pieces: XiangqiFlipChessPiece[]): XiangqiFlipChessTrophyStack[] {
  const groups = new Map<string, XiangqiFlipChessPiece[]>();
  pieces.forEach((piece) => {
    const key = `${piece.side}-${piece.kind}`;
    groups.set(key, [...(groups.get(key) ?? []), piece]);
  });

  return [...groups.values()].map((group) => ({
    side: group[0].side,
    label: group[0].label,
    count: group.length,
    pieces: group.map((piece) => ({ label: piece.label, kind: piece.kind })),
  }));
}
