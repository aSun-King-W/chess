import {
  applyPuzzleMove,
  createPuzzleSession,
  dailyPuzzle,
  revealPuzzleHint,
  resetPuzzleSession,
  tickPuzzleSession,
} from './puzzle.js';
import type { Puzzle, PuzzleApplyResult, PuzzleHint, PuzzleSession, PuzzleSolutionMove } from './puzzle.js';

export type XiangqiPuzzleEntryId = 'daily' | 'campaign' | 'scored' | 'challenge' | 'study' | 'coin';

export type XiangqiPuzzleAttemptStatus = 'ready' | 'playing' | 'impossible' | 'solved' | 'abandoned';

export type XiangqiPuzzleEntry = {
  id: XiangqiPuzzleEntryId;
  title: string;
  subtitle: string;
  sceneLabel: string;
  badge?: string;
  ticketLabel: string;
  rewardLabel: string;
  settlementType: '每日成绩' | '闯关进度' | '评分' | '挑战成绩' | '学习记录' | '铜钱';
  timeLabel: string;
  primaryAction: string;
  localOnly: true;
  enabled: boolean;
};

export type XiangqiPuzzleModuleStats = {
  challengeCount: number;
  passRate: number;
  fastestSeconds: number;
  fastestPlayer: string;
  regionLabel: string;
  regionPassed: number;
  regionChallenged: number;
};

export type XiangqiPuzzleResources = {
  stamina: number;
  hintCards: number;
  silver: number;
};

export type XiangqiPuzzleAttempt = {
  id: string;
  entryId: XiangqiPuzzleEntryId;
  puzzleId: string;
  title: string;
  status: XiangqiPuzzleAttemptStatus;
  session: PuzzleSession;
  resources: XiangqiPuzzleResources;
  startedAt: string;
  updatedAt: string;
  restarts: number;
  impossiblePrompt: string | null;
  latestMessage: string;
  comments: XiangqiPuzzleComment[];
};

export type XiangqiPuzzleMoveInput = Pick<PuzzleSolutionMove, 'pieceId' | 'to'>;

export type XiangqiPuzzleMoveResult = {
  attempt: XiangqiPuzzleAttempt;
  verdict: PuzzleApplyResult['verdict'] | 'blocked';
  message: string;
  impossible: boolean;
  expected?: PuzzleSolutionMove;
};

export type XiangqiPuzzleHintResult = {
  attempt: XiangqiPuzzleAttempt;
  hint: PuzzleHint | null;
  consumed: boolean;
  message: string;
};

export type XiangqiPuzzleSettlement = {
  title: string;
  statusLabel: string;
  timeLabel: string;
  regionLabel: string;
  regionRankText: string;
  nationalPercentText: string;
  friendText: string;
  rewardText: string;
  buttons: ['关闭', '炫耀一下'];
  rows: XiangqiPuzzleInfoRow[];
};

export type XiangqiPuzzleInfoRow = {
  title: string;
  detail: string;
  accent?: 'good' | 'warn' | 'muted';
};

export type XiangqiPuzzleRecord = {
  id: string;
  entryId: XiangqiPuzzleEntryId;
  puzzleId: string;
  title: string;
  status: XiangqiPuzzleAttemptStatus;
  elapsedSeconds: number;
  steps: number;
  hintsUsed: number;
  restarts: number;
  recordedAt: string;
  settlementRows: XiangqiPuzzleInfoRow[];
  replayRows: XiangqiPuzzleInfoRow[];
};

export type XiangqiPuzzleComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  liked: boolean;
  localOnly: true;
};

export type XiangqiPuzzleCommentPanel = {
  title: '棋谱评论';
  topic: string;
  challengeText: string;
  passRateText: string;
  readAvatars: string[];
  comments: XiangqiPuzzleComment[];
  inputPlaceholder: string;
};

const defaultStats: XiangqiPuzzleModuleStats = {
  challengeCount: 62369,
  passRate: 0.94,
  fastestSeconds: 4,
  fastestPlayer: '棋小',
  regionLabel: '北京市北京市',
  regionPassed: 9112,
  regionChallenged: 9134,
};

const defaultResources: XiangqiPuzzleResources = {
  stamina: 6,
  hintCards: 3,
  silver: 5830,
};

const defaultComments: XiangqiPuzzleComment[] = [
  {
    id: 'local-comment-opening',
    author: '每日一题棋友',
    content: '先看将帅线路，再判断哪枚大子能一步到位。',
    createdAt: '2026-05-28T09:12:00.000Z',
    liked: false,
    localOnly: true,
  },
  {
    id: 'local-comment-restart',
    author: '本地复盘',
    content: '走偏后直接重来，比硬算残局更接近真实判题节奏。',
    createdAt: '2026-05-28T09:18:00.000Z',
    liked: false,
    localOnly: true,
  },
];

export const xiangqiPuzzleEntries: XiangqiPuzzleEntry[] = [
  {
    id: 'daily',
    title: '每日残局',
    subtitle: '今日一题，按最优路线过关',
    sceneLabel: '每日一题',
    badge: '今日',
    ticketLabel: '消耗体力 1',
    rewardLabel: '过关奖励体力卡+2',
    settlementType: '每日成绩',
    timeLabel: '不限局时，记录用时',
    primaryAction: '开始挑战',
    localOnly: true,
    enabled: true,
  },
  {
    id: 'campaign',
    title: '残局-闯关',
    subtitle: '连续关卡，本地保存进度',
    sceneLabel: '闯关路线',
    badge: '进阶',
    ticketLabel: '消耗体力 1',
    rewardLabel: '过关推进关卡星级',
    settlementType: '闯关进度',
    timeLabel: '不限局时，记录步数',
    primaryAction: '继续闯关',
    localOnly: true,
    enabled: true,
  },
  {
    id: 'scored',
    title: '残局-评分',
    subtitle: '按用时、提示、步数给出评分',
    sceneLabel: '评分残局',
    ticketLabel: '免费评分',
    rewardLabel: '生成本地评分报告',
    settlementType: '评分',
    timeLabel: '不限局时，记录评分',
    primaryAction: '开始评分',
    localOnly: true,
    enabled: true,
  },
  {
    id: 'challenge',
    title: '残局-挑战',
    subtitle: '挑战本机排行与最快记录',
    sceneLabel: '挑战残局',
    badge: '排行',
    ticketLabel: '消耗体力 1',
    rewardLabel: '刷新本机挑战榜',
    settlementType: '挑战成绩',
    timeLabel: '不限局时，记录最快',
    primaryAction: '发起挑战',
    localOnly: true,
    enabled: true,
  },
  {
    id: 'study',
    title: '残局-学习',
    subtitle: '看提示、评论与推荐正解',
    sceneLabel: '学习残局',
    ticketLabel: '免费学习',
    rewardLabel: '写入学习记录',
    settlementType: '学习记录',
    timeLabel: '不限局时',
    primaryAction: '进入学习',
    localOnly: true,
    enabled: true,
  },
  {
    id: 'coin',
    title: '残局-铜钱场',
    subtitle: '本地铜钱判定，不触发充值',
    sceneLabel: '铜钱残局',
    badge: '铜钱',
    ticketLabel: '门票 1000 铜钱',
    rewardLabel: '过关结算铜钱',
    settlementType: '铜钱',
    timeLabel: '不限局时，结算铜钱',
    primaryAction: '进入铜钱场',
    localOnly: true,
    enabled: true,
  },
];

export function getXiangqiPuzzleEntry(entryId: XiangqiPuzzleEntryId): XiangqiPuzzleEntry {
  const entry = xiangqiPuzzleEntries.find((candidate) => candidate.id === entryId);
  if (!entry) throw new Error(`Unknown puzzle entry: ${entryId}`);
  return entry;
}

export function getXiangqiPuzzleModuleStats(stats: Partial<XiangqiPuzzleModuleStats> = {}): XiangqiPuzzleModuleStats {
  return { ...defaultStats, ...stats };
}

export function getXiangqiPuzzleIntroRows(
  entryId: XiangqiPuzzleEntryId,
  stats: Partial<XiangqiPuzzleModuleStats> = {},
): XiangqiPuzzleInfoRow[] {
  const entry = getXiangqiPuzzleEntry(entryId);
  const mergedStats = getXiangqiPuzzleModuleStats(stats);

  return [
    { title: '入口', detail: entry.title },
    { title: '玩法', detail: entry.sceneLabel },
    { title: '资源', detail: entry.ticketLabel },
    { title: '挑战人数', detail: `${formatCount(mergedStats.challengeCount)}人挑战` },
    { title: '过关率', detail: formatPercent(mergedStats.passRate) },
    { title: '最快记录', detail: `${mergedStats.fastestPlayer}${mergedStats.fastestSeconds}秒过关` },
  ];
}

export function createXiangqiPuzzleAttempt(
  entryId: XiangqiPuzzleEntryId = 'daily',
  options: {
    puzzle?: Puzzle;
    resources?: Partial<XiangqiPuzzleResources>;
    now?: string;
    comments?: XiangqiPuzzleComment[];
  } = {},
): XiangqiPuzzleAttempt {
  const puzzle = options.puzzle ?? dailyPuzzle;
  const now = options.now ?? new Date().toISOString();

  return {
    id: `${entryId}-${puzzle.id}-${now}`,
    entryId,
    puzzleId: puzzle.id,
    title: puzzle.title,
    status: 'ready',
    session: createPuzzleSession(puzzle),
    resources: { ...defaultResources, ...options.resources },
    startedAt: now,
    updatedAt: now,
    restarts: 0,
    impossiblePrompt: null,
    latestMessage: '准备开始残局挑战。',
    comments: options.comments ? [...options.comments] : [...defaultComments],
  };
}

export function startXiangqiPuzzleAttempt(
  attempt: XiangqiPuzzleAttempt,
  now = new Date().toISOString(),
): XiangqiPuzzleAttempt {
  if (attempt.status === 'solved' || attempt.status === 'abandoned') return attempt;
  return {
    ...attempt,
    status: 'playing',
    updatedAt: now,
    latestMessage: '残局已开始，按最优路线行棋。',
  };
}

export function tickXiangqiPuzzleAttempt(attempt: XiangqiPuzzleAttempt, seconds = 1): XiangqiPuzzleAttempt {
  if (attempt.status !== 'playing') return attempt;
  return {
    ...attempt,
    session: tickPuzzleSession(attempt.session, seconds),
  };
}

export function applyXiangqiPuzzleAttemptMove(
  puzzle: Puzzle,
  attempt: XiangqiPuzzleAttempt,
  move: XiangqiPuzzleMoveInput,
  now = new Date().toISOString(),
): XiangqiPuzzleMoveResult {
  if (attempt.status === 'ready') {
    return applyXiangqiPuzzleAttemptMove(puzzle, startXiangqiPuzzleAttempt(attempt, now), move, now);
  }

  if (attempt.status !== 'playing') {
    return {
      attempt,
      verdict: 'blocked',
      message: attempt.status === 'impossible' ? '当前已无法过关，请重来后继续。' : '本局残局已经结束。',
      impossible: attempt.status === 'impossible',
    };
  }

  const result = applyPuzzleMove(puzzle, attempt.session, move);
  const impossible = result.verdict === 'incorrect' && result.session.status === 'failed';
  const solved = result.verdict === 'success';
  const nextAttempt: XiangqiPuzzleAttempt = {
    ...attempt,
    status: solved ? 'solved' : impossible ? 'impossible' : 'playing',
    session: result.session,
    updatedAt: now,
    impossiblePrompt: impossible ? '当前已无法过关，是否重来' : null,
    latestMessage: solved ? '挑战成功，已生成成绩卡。' : impossible ? '当前已无法过关，是否重来。' : result.message,
  };

  return {
    attempt: nextAttempt,
    verdict: result.verdict,
    message: nextAttempt.latestMessage,
    impossible,
    expected: result.expected,
  };
}

export function revealXiangqiPuzzleHint(
  puzzle: Puzzle,
  attempt: XiangqiPuzzleAttempt,
  now = new Date().toISOString(),
): XiangqiPuzzleHintResult {
  if (attempt.status === 'impossible') {
    return {
      attempt,
      hint: null,
      consumed: false,
      message: '当前路线已无法过关，请先重来。',
    };
  }

  const result = revealPuzzleHint(puzzle, attempt.session);
  const spentHintCard = result.consumed ? 1 : 0;
  const nextAttempt: XiangqiPuzzleAttempt = {
    ...attempt,
    status: attempt.status === 'ready' ? 'playing' : attempt.status,
    session: result.session,
    resources: {
      ...attempt.resources,
      hintCards: Math.max(0, attempt.resources.hintCards - spentHintCard),
    },
    updatedAt: now,
    latestMessage: result.hint
      ? result.consumed
        ? `提示：${result.hint.title}`
        : `提示已显示：${result.hint.title}`
      : '本题暂无更多提示。',
  };

  return {
    attempt: nextAttempt,
    hint: result.hint,
    consumed: result.consumed,
    message: nextAttempt.latestMessage,
  };
}

export function restartXiangqiPuzzleAttempt(
  puzzle: Puzzle,
  attempt: XiangqiPuzzleAttempt,
  now = new Date().toISOString(),
): XiangqiPuzzleAttempt {
  return {
    ...attempt,
    status: 'playing',
    session: resetPuzzleSession(puzzle, attempt.session),
    updatedAt: now,
    restarts: attempt.restarts + 1,
    impossiblePrompt: null,
    latestMessage: '已重来，本次尝试继续记录提示与重来次数。',
  };
}

export function abandonXiangqiPuzzleAttempt(
  attempt: XiangqiPuzzleAttempt,
  now = new Date().toISOString(),
): XiangqiPuzzleAttempt {
  if (attempt.status === 'solved') return attempt;
  return {
    ...attempt,
    status: 'abandoned',
    updatedAt: now,
    latestMessage: '已退出残局，本地保留本次记录。',
  };
}

export function getXiangqiPuzzleMenuActions(attempt: XiangqiPuzzleAttempt): string[] {
  if (attempt.status === 'impossible') return ['退出', '重来', '设置'];
  if (attempt.status === 'solved') return ['关闭', '炫耀一下', '复盘'];
  return ['退出', '重来', '设置'];
}

export function buildXiangqiPuzzleSettlement(
  attempt: XiangqiPuzzleAttempt,
  stats: Partial<XiangqiPuzzleModuleStats> = {},
): XiangqiPuzzleSettlement {
  const mergedStats = getXiangqiPuzzleModuleStats(stats);
  const elapsedSeconds = Math.max(0, attempt.session.elapsedSeconds);
  const overRegion = Math.max(0, mergedStats.regionPassed - Math.max(0, attempt.restarts * 7 + attempt.session.hintsUsed * 13));
  const nationalPercent = clamp(0.5, 0.99, mergedStats.passRate - attempt.session.hintsUsed * 0.04 - attempt.restarts * 0.03);
  const rewardText = attempt.status === 'solved' ? getXiangqiPuzzleEntry(attempt.entryId).rewardLabel : '未过关，不发放奖励';

  return {
    title: attempt.title,
    statusLabel: attempt.status === 'solved' ? '挑战成功' : '挑战未完成',
    timeLabel: `${elapsedSeconds}秒过关`,
    regionLabel: mergedStats.regionLabel,
    regionRankText: `${mergedStats.regionLabel}超过${overRegion}人`,
    nationalPercentText: `超过全国${formatPercent(nationalPercent)}棋友`,
    friendText: attempt.status === 'solved' ? '已有好友完成今日挑战' : '好友成绩将在过关后展示',
    rewardText,
    buttons: ['关闭', '炫耀一下'],
    rows: getXiangqiPuzzleSettlementRows(attempt, mergedStats),
  };
}

export function getXiangqiPuzzleSettlementRows(
  attempt: XiangqiPuzzleAttempt,
  stats: Partial<XiangqiPuzzleModuleStats> = {},
): XiangqiPuzzleInfoRow[] {
  const entry = getXiangqiPuzzleEntry(attempt.entryId);
  const mergedStats = getXiangqiPuzzleModuleStats(stats);

  return [
    { title: '模块', detail: '残局' },
    { title: '入口', detail: entry.title },
    { title: '成绩', detail: attempt.status === 'solved' ? `${attempt.session.elapsedSeconds}秒过关` : attempt.latestMessage, accent: attempt.status === 'solved' ? 'good' : 'warn' },
    { title: '步数', detail: `${attempt.session.steps}步` },
    { title: '评分', detail: `${calculatePuzzleScore(attempt, mergedStats)}分` },
    { title: '提示', detail: `已用${attempt.session.hintsUsed}次` },
    { title: '奖励', detail: attempt.status === 'solved' ? entry.rewardLabel : '重来后可继续挑战' },
  ];
}

export function getXiangqiPuzzleReplayRows(
  attempt: XiangqiPuzzleAttempt,
  stats: Partial<XiangqiPuzzleModuleStats> = {},
): XiangqiPuzzleInfoRow[] {
  const entry = getXiangqiPuzzleEntry(attempt.entryId);
  const mergedStats = getXiangqiPuzzleModuleStats(stats);

  return [
    { title: '模块', detail: '残局体系' },
    { title: '题目', detail: attempt.title },
    { title: '入口', detail: entry.title },
    { title: '局内指标', detail: `步数${attempt.session.steps}，计时${attempt.session.elapsedSeconds}秒，评分${calculatePuzzleScore(attempt, mergedStats)}` },
    { title: '判题', detail: attempt.status === 'impossible' ? '当前路线无法过关' : attempt.status === 'solved' ? '已按正解过关' : '可继续挑战' },
    { title: '底部按钮', detail: '菜单 / 排行 / 分享 / 提示' },
  ];
}

export function createXiangqiPuzzleRecord(
  attempt: XiangqiPuzzleAttempt,
  stats: Partial<XiangqiPuzzleModuleStats> = {},
  now = new Date().toISOString(),
): XiangqiPuzzleRecord {
  return {
    id: `record-${attempt.id}-${now}`,
    entryId: attempt.entryId,
    puzzleId: attempt.puzzleId,
    title: attempt.title,
    status: attempt.status,
    elapsedSeconds: attempt.session.elapsedSeconds,
    steps: attempt.session.steps,
    hintsUsed: attempt.session.hintsUsed,
    restarts: attempt.restarts,
    recordedAt: now,
    settlementRows: getXiangqiPuzzleSettlementRows(attempt, stats),
    replayRows: getXiangqiPuzzleReplayRows(attempt, stats),
  };
}

export function createXiangqiPuzzleCommentPanel(
  attempt: XiangqiPuzzleAttempt,
  stats: Partial<XiangqiPuzzleModuleStats> = {},
): XiangqiPuzzleCommentPanel {
  const mergedStats = getXiangqiPuzzleModuleStats(stats);

  return {
    title: '棋谱评论',
    topic: '每日一题',
    challengeText: `${formatCount(mergedStats.challengeCount)}人挑战`,
    passRateText: `${formatPercent(mergedStats.passRate)}过关`,
    readAvatars: ['你', '棋友A', '棋友B', '复盘助手'],
    comments: [...attempt.comments],
    inputPlaceholder: '说说你的解法或复盘发现',
  };
}

export function addXiangqiPuzzleComment(
  attempt: XiangqiPuzzleAttempt,
  content: string,
  options: { author?: string; now?: string } = {},
): XiangqiPuzzleAttempt {
  const trimmed = content.trim();
  if (!trimmed) return attempt;

  const now = options.now ?? new Date().toISOString();
  const comment: XiangqiPuzzleComment = {
    id: `local-comment-${attempt.comments.length + 1}-${now}`,
    author: options.author ?? '你',
    content: trimmed,
    createdAt: now,
    liked: false,
    localOnly: true,
  };

  return {
    ...attempt,
    comments: [comment, ...attempt.comments],
    updatedAt: now,
    latestMessage: '评论已写入本地棋谱记录。',
  };
}

export function calculatePuzzleScore(
  attempt: XiangqiPuzzleAttempt,
  stats: Partial<XiangqiPuzzleModuleStats> = {},
): number {
  const mergedStats = getXiangqiPuzzleModuleStats(stats);
  const timePenalty = Math.max(0, attempt.session.elapsedSeconds - mergedStats.fastestSeconds);
  const raw = 100 - timePenalty - attempt.session.hintsUsed * 12 - attempt.restarts * 8 - Math.max(0, attempt.session.steps - 1) * 3;
  return clamp(0, 100, raw);
}

function formatCount(value: number): string {
  if (value >= 10000) return `${Math.round(value / 10000)}万`;
  return `${value}`;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}
