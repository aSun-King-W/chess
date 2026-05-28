import {
  applyJieqiMove,
  createInitialJieqiPieces,
  isHiddenJieqiPiece,
  revealMovedPiece,
} from './jieqi.js';
import type { JieqiMoveResult, JieqiPiece } from './jieqi.js';
import type { Piece, PieceKind, Side } from './game.js';

export type JieqiArenaId = 'rating' | 'normal' | 'middle' | 'expert' | 'elite';
export type JieqiAdmissionStatus = 'allowed' | 'insufficient' | 'above-limit';
export type JieqiPlaceholderId = 'coin-relief' | 'invite-spectator' | 'draw-offer' | 'leave' | 'resign';
export type JieqiRevealReason = 'initial' | 'first-move' | 'rule';
export type JieqiOutcome = 'win' | 'draw' | 'loss';

export type JieqiWallet = {
  gold: number;
  silver: number;
};

export type JieqiTimeControl = {
  totalMinutes: number;
  moveSeconds: number;
  openingMoveCount: number;
  openingMoveSeconds: number;
  label: string;
};

export type JieqiArenaConfig = {
  id: JieqiArenaId;
  title: string;
  description: string;
  entryCta: string;
  resourceType: 'silver';
  ticket: number;
  baseStake: number;
  minSilver?: number;
  maxSilver?: number;
  bonusRate: number;
  settlementType: '揭棋棋力分' | '铜钱';
  timeControl: JieqiTimeControl;
  replayTags: string[];
};

export type JieqiAdmission = {
  status: JieqiAdmissionStatus;
  canEnter: boolean;
  title: string;
  detail: string;
  primaryAction: string;
  secondaryAction?: string;
  paymentRequired: false;
};

export type JieqiLifecycle = {
  pieceId: string;
  side: Side;
  realKind: PieceKind;
  realLabel: string;
  state: 'hidden' | 'revealed' | 'captured';
  revealReason?: JieqiRevealReason;
  revealedAtMove?: number;
  capturedAtMove?: number;
  capturedWhileHidden?: boolean;
};

export type JieqiCaptureRecord = {
  moveIndex: number;
  attackerId: string;
  attackerSide: Side;
  capturedId: string;
  capturedSide: Side;
  capturedKind: PieceKind;
  capturedLabel: string;
  wasHidden: boolean;
  visibleLabel: string;
};

export type JieqiSideCaptureStats = {
  side: Side;
  total: number;
  hidden: number;
  revealed: number;
  badges: Array<{ label: string; count: number }>;
};

export type JieqiBoardState = {
  pieces: JieqiPiece[];
  turn: Side;
  moveCount: number;
  moves: JieqiMoveResult['move'][];
  captures: JieqiCaptureRecord[];
  lifecycles: Record<string, JieqiLifecycle>;
};

export type JieqiPlaceholder = {
  id: JieqiPlaceholderId;
  title: string;
  detail: string;
  actions: string[];
  paymentRequired: false;
};

export type JieqiSettlement = {
  outcome: JieqiOutcome;
  resultTitle: string;
  ratingDelta: string;
  ownRank: string;
  opponentRank: string;
  ticket: number;
  rows: Array<{ title: string; detail: string }>;
  actions: string[];
  replayRows: Array<{ title: string; detail: string }>;
};

const DEFAULT_TIME_CONTROL: JieqiTimeControl = {
  totalMinutes: 10,
  moveSeconds: 60,
  openingMoveCount: 3,
  openingMoveSeconds: 30,
  label: '10分钟，步时60秒，前3步30秒',
};

export const jieqiArenaConfigs: JieqiArenaConfig[] = [
  {
    id: 'rating',
    title: '揭棋评测',
    description: '匹配揭棋段位相近的对手，输赢结算揭棋棋力分。',
    entryCta: '快速开始',
    resourceType: 'silver',
    ticket: 2000,
    baseStake: 0,
    bonusRate: 0,
    settlementType: '揭棋棋力分',
    timeControl: DEFAULT_TIME_CONTROL,
    replayTags: ['揭棋', '揭棋评测', '棋力分结算', '暗子复盘'],
  },
  {
    id: 'normal',
    title: '普通场',
    description: '入门铜钱场，财富不足时只展示安全救济占位。',
    entryCta: '进入普通场',
    resourceType: 'silver',
    ticket: 0,
    baseStake: 4500,
    minSilver: 6000,
    maxSilver: 200000,
    bonusRate: 0,
    settlementType: '铜钱',
    timeControl: DEFAULT_TIME_CONTROL,
    replayTags: ['揭棋', '普通场', '铜钱结算', '暗子复盘'],
  },
  {
    id: 'middle',
    title: '中级场',
    description: '进阶铜钱场，胜局奖励按场次加成。',
    entryCta: '进入中级场',
    resourceType: 'silver',
    ticket: 0,
    baseStake: 15000,
    minSilver: 20000,
    maxSilver: 800000,
    bonusRate: 15,
    settlementType: '铜钱',
    timeControl: DEFAULT_TIME_CONTROL,
    replayTags: ['揭棋', '中级场', '+15%加成', '暗子复盘'],
  },
  {
    id: 'expert',
    title: '高手场',
    description: '高阶铜钱场，适合高财富揭棋对局。',
    entryCta: '进入高手场',
    resourceType: 'silver',
    ticket: 0,
    baseStake: 50000,
    minSilver: 60000,
    bonusRate: 30,
    settlementType: '铜钱',
    timeControl: DEFAULT_TIME_CONTROL,
    replayTags: ['揭棋', '高手场', '+30%加成', '暗子复盘'],
  },
  {
    id: 'elite',
    title: '精英场',
    description: '精英铜钱场，底注和准入均最高。',
    entryCta: '进入精英场',
    resourceType: 'silver',
    ticket: 0,
    baseStake: 300000,
    minSilver: 350000,
    bonusRate: 30,
    settlementType: '铜钱',
    timeControl: DEFAULT_TIME_CONTROL,
    replayTags: ['揭棋', '精英场', '+30%加成', '暗子复盘'],
  },
];

export function getJieqiArenaConfig(arenaId: JieqiArenaId): JieqiArenaConfig {
  const config = jieqiArenaConfigs.find((item) => item.id === arenaId);
  if (!config) throw new Error(`Unknown Jieqi arena: ${arenaId}`);
  return cloneArenaConfig(config);
}

export function getJieqiEntryRows(arenaId: JieqiArenaId): Array<{ id: string; label: string; value: string }> {
  const config = getJieqiArenaConfig(arenaId);
  return [
    { id: 'module', label: '模块', value: '揭棋' },
    { id: 'arena', label: '场次', value: config.title },
    { id: 'ticket', label: '对局门票', value: config.ticket > 0 ? `${config.ticket}` : '无门票' },
    { id: 'settlement', label: '结算类型', value: config.settlementType },
    { id: 'time-control', label: '本场说明', value: config.timeControl.label },
  ];
}

export function getJieqiAdmission(arenaId: JieqiArenaId, wallet: JieqiWallet): JieqiAdmission {
  const config = getJieqiArenaConfig(arenaId);
  const required = config.ticket > 0 ? config.ticket : config.minSilver ?? 0;

  if (wallet.silver < required) {
    return {
      status: 'insufficient',
      canEnter: false,
      title: '铜钱不足，领铜钱！',
      detail: `当前铜钱${wallet.silver}，${config.title}需要${required}铜钱。看视频、更多铜钱、充值等入口在本地仅展示安全占位。`,
      primaryAction: '查看救济提示',
      secondaryAction: '返回大厅',
      paymentRequired: false,
    };
  }

  if (typeof config.maxSilver === 'number' && wallet.silver > config.maxSilver) {
    return {
      status: 'above-limit',
      canEnter: false,
      title: '财富超出本场上限',
      detail: `当前铜钱${wallet.silver}，${config.title}上限为${config.maxSilver}铜钱，请切换更高场次。`,
      primaryAction: '切换场次',
      secondaryAction: '返回大厅',
      paymentRequired: false,
    };
  }

  return {
    status: 'allowed',
    canEnter: true,
    title: `${config.title}可进入`,
    detail: `${config.timeControl.label}，${config.ticket > 0 ? `对局门票${config.ticket}` : `底注${config.baseStake}`}，${config.settlementType}结算。`,
    primaryAction: config.entryCta,
    paymentRequired: false,
  };
}

export function getJieqiPlaceholder(id: JieqiPlaceholderId): JieqiPlaceholder {
  const placeholders: Record<JieqiPlaceholderId, JieqiPlaceholder> = {
    'coin-relief': {
      id,
      title: '铜钱不足，领铜钱！',
      detail: '看视频、更多铜钱、充值和活动奖励入口只展示说明，不触发真实广告、支付或账号资产变更。',
      actions: ['看视频(安全占位)', '更多铜钱(安全占位)', '返回'],
      paymentRequired: false,
    },
    'invite-spectator': {
      id,
      title: '邀请旁观',
      detail: '本地模拟不会拉起微信分享或真实观赛房间，只保留邀请旁观的局内反馈。',
      actions: ['知道了'],
      paymentRequired: false,
    },
    'draw-offer': {
      id,
      title: '提和(3)',
      detail: '本地记录求和次数；未满7回合时提示暂不可提和，达到条件后只做模拟反馈。',
      actions: ['继续对局'],
      paymentRequired: false,
    },
    leave: {
      id,
      title: '您确定要退出吗？',
      detail: '退出会按本地强退/认输处理，并保留棋谱用于复盘分析。',
      actions: ['取消', '确定'],
      paymentRequired: false,
    },
    resign: {
      id,
      title: '认输确认',
      detail: '认输后本局立即判负，进入揭棋结算页；棋谱仍可复盘。',
      actions: ['取消', '认输'],
      paymentRequired: false,
    },
  };

  return placeholders[id];
}

export function createJieqiBoardState(source?: Piece[]): JieqiBoardState {
  const pieces = createInitialJieqiPieces(source);
  return {
    pieces,
    turn: 'red',
    moveCount: 0,
    moves: [],
    captures: [],
    lifecycles: Object.fromEntries(pieces.map((piece) => [piece.id, createLifecycle(piece)])),
  };
}

export function applyJieqiStateMove(state: JieqiBoardState, pieceId: string, to: { x: number; y: number }): JieqiBoardState {
  const result = applyJieqiMove(state.pieces, pieceId, to);
  if (!result) return state;

  const moveIndex = state.moveCount + 1;
  const lifecycles = { ...state.lifecycles };
  if (result.revealed) {
    lifecycles[pieceId] = {
      ...lifecycles[pieceId],
      state: 'revealed',
      revealReason: 'first-move',
      revealedAtMove: moveIndex,
    };
  }

  const captures = [...state.captures];
  if (result.captured) {
    const wasHidden = isHiddenJieqiPiece(result.captured);
    captures.push({
      moveIndex,
      attackerId: pieceId,
      attackerSide: result.movedPiece.side,
      capturedId: result.captured.id,
      capturedSide: result.captured.side,
      capturedKind: result.captured.kind,
      capturedLabel: result.captured.label,
      wasHidden,
      visibleLabel: wasHidden ? '暗' : result.captured.label,
    });
    lifecycles[result.captured.id] = {
      ...lifecycles[result.captured.id],
      state: 'captured',
      capturedAtMove: moveIndex,
      capturedWhileHidden: wasHidden,
    };
  }

  return {
    pieces: result.pieces,
    turn: state.turn === 'red' ? 'black' : 'red',
    moveCount: moveIndex,
    moves: [...state.moves, result.move],
    captures,
    lifecycles,
  };
}

export function revealJieqiPieceByRule(
  state: JieqiBoardState,
  pieceId: string,
  reason: Exclude<JieqiRevealReason, 'first-move'> = 'rule',
): JieqiBoardState {
  const lifecycle = state.lifecycles[pieceId];
  if (!lifecycle || lifecycle.state !== 'hidden') return state;

  return {
    ...state,
    pieces: revealMovedPiece(state.pieces, pieceId),
    lifecycles: {
      ...state.lifecycles,
      [pieceId]: {
        ...lifecycle,
        state: 'revealed',
        revealReason: reason,
        revealedAtMove: state.moveCount,
      },
    },
  };
}

export function getJieqiCaptureStats(state: JieqiBoardState): Record<Side, JieqiSideCaptureStats> {
  return {
    red: buildCaptureStats(state, 'red'),
    black: buildCaptureStats(state, 'black'),
  };
}

export function settleJieqiRating(
  outcome: JieqiOutcome,
  state: JieqiBoardState = createJieqiBoardState(),
  options: {
    ownRank?: string;
    opponentRank?: string;
    arenaId?: JieqiArenaId;
  } = {},
): JieqiSettlement {
  const config = getJieqiArenaConfig(options.arenaId ?? 'rating');
  const delta = outcome === 'win' ? 10 : outcome === 'draw' ? 0 : -8;
  const ownRank = options.ownRank ?? '揭1-1';
  const opponentRank = options.opponentRank ?? '揭8-3';
  const resultTitle = outcome === 'win' ? '胜利' : outcome === 'draw' ? '和棋' : '失败';
  const captureStats = getJieqiCaptureStats(state);
  const rows = [
    { title: '结果', detail: resultTitle },
    { title: '结算类型', detail: config.settlementType },
    { title: '揭棋评测分', detail: formatSigned(delta) },
    { title: '我方段位', detail: ownRank },
    { title: '对手段位', detail: opponentRank },
    { title: '对局门票', detail: `${config.ticket}` },
    { title: '暗子翻明', detail: `${countRevealedPieces(state)}子已揭示 / ${countHiddenPieces(state)}子仍隐藏` },
    {
      title: '吃子统计',
      detail: `红方被吃${captureStats.red.total}子，黑方被吃${captureStats.black.total}子`,
    },
  ];

  return {
    outcome,
    resultTitle,
    ratingDelta: formatSigned(delta),
    ownRank,
    opponentRank,
    ticket: config.ticket,
    rows,
    actions: ['切换对手', '再来一局', '分享', '复盘分析'],
    replayRows: getJieqiReplayRows(config.id, state, rows),
  };
}

export function getJieqiReplayRows(
  arenaId: JieqiArenaId = 'rating',
  state: JieqiBoardState = createJieqiBoardState(),
  settlementRows: Array<{ title: string; detail: string }> = [],
): Array<{ title: string; detail: string }> {
  const config = getJieqiArenaConfig(arenaId);
  const settlementType = settlementRows.find((row) => row.title === '结算类型')?.detail ?? config.settlementType;
  return [
    { title: '模块', detail: '揭棋' },
    { title: '场次', detail: config.title },
    { title: '局时', detail: `${config.timeControl.totalMinutes}分钟` },
    { title: '步时', detail: `${config.timeControl.moveSeconds}秒` },
    { title: '前三步', detail: `${config.timeControl.openingMoveCount}步${config.timeControl.openingMoveSeconds}秒` },
    { title: '对局门票', detail: config.ticket > 0 ? `${config.ticket}` : '无门票' },
    { title: '结算类型', detail: settlementType },
    { title: '暗子生命周期', detail: summarizeLifecycle(state) },
    { title: '吃子记录', detail: summarizeCaptures(state) },
    { title: '复盘隐藏信息', detail: '未揭示暗子在棋盘和被吃子堆显示为“暗”，内部保留真实身份供结算与复盘校验。' },
  ];
}

function cloneArenaConfig(config: JieqiArenaConfig): JieqiArenaConfig {
  return {
    ...config,
    timeControl: { ...config.timeControl },
    replayTags: [...config.replayTags],
  };
}

function createLifecycle(piece: JieqiPiece): JieqiLifecycle {
  const revealed = !isHiddenJieqiPiece(piece);
  return {
    pieceId: piece.id,
    side: piece.side,
    realKind: piece.kind,
    realLabel: piece.label,
    state: revealed ? 'revealed' : 'hidden',
    revealReason: revealed ? 'initial' : undefined,
    revealedAtMove: revealed ? 0 : undefined,
  };
}

function buildCaptureStats(state: JieqiBoardState, side: Side): JieqiSideCaptureStats {
  const records = state.captures.filter((capture) => capture.capturedSide === side);
  const counts = new Map<string, number>();
  records.forEach((capture) => {
    counts.set(capture.visibleLabel, (counts.get(capture.visibleLabel) ?? 0) + 1);
  });
  return {
    side,
    total: records.length,
    hidden: records.filter((capture) => capture.wasHidden).length,
    revealed: records.filter((capture) => !capture.wasHidden).length,
    badges: [...counts.entries()].map(([label, count]) => ({ label, count })),
  };
}

function countRevealedPieces(state: JieqiBoardState): number {
  return Object.values(state.lifecycles).filter((lifecycle) => lifecycle.state === 'revealed').length;
}

function countHiddenPieces(state: JieqiBoardState): number {
  return Object.values(state.lifecycles).filter((lifecycle) => lifecycle.state === 'hidden').length;
}

function summarizeLifecycle(state: JieqiBoardState): string {
  const revealed = countRevealedPieces(state);
  const hidden = countHiddenPieces(state);
  const capturedHidden = Object.values(state.lifecycles).filter(
    (lifecycle) => lifecycle.state === 'captured' && lifecycle.capturedWhileHidden,
  ).length;
  return `已揭示${revealed}子，仍隐藏${hidden}子，暗子被吃${capturedHidden}子`;
}

function summarizeCaptures(state: JieqiBoardState): string {
  if (state.captures.length === 0) return '暂无吃子';
  return state.captures
    .map((capture) => {
      const visible = capture.wasHidden ? '暗子' : capture.capturedLabel;
      return `第${capture.moveIndex}步${capture.attackerId}吃${visible}`;
    })
    .join('；');
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}
