import { dailyPuzzle } from './puzzle.js';
import type { Puzzle, PuzzleSession } from './puzzle.js';

export type PuzzleFeatureEntryKind =
  | 'daily'
  | 'campaign'
  | 'training'
  | 'theme'
  | 'mistakes'
  | 'favorites'
  | 'ranking'
  | 'comments'
  | 'analysis'
  | 'restart';

export type PuzzleFeatureActionType =
  | 'open-daily'
  | 'open-set'
  | 'open-review'
  | 'open-ranking'
  | 'open-comments'
  | 'show-panel'
  | 'disabled';

export type PuzzleTrainingSetKind = 'daily' | 'campaign' | 'tactic' | 'mate-theme' | 'review';
export type PuzzleAttemptOutcome = 'solved' | 'failed' | 'abandoned';

export type PuzzleFeatureEntry = {
  id: string;
  title: string;
  subtitle: string;
  kind: PuzzleFeatureEntryKind;
  badge?: string;
  trainingSetId?: string;
  requiresItems?: 'mistakes' | 'favorites';
  enabled: boolean;
  localOnly: boolean;
};

export type PuzzleTrainingSet = {
  id: string;
  title: string;
  kind: PuzzleTrainingSetKind;
  description: string;
  puzzleIds: string[];
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
};

export type PuzzleFeatureAction = {
  type: PuzzleFeatureActionType;
  entryId: string;
  label: string;
  puzzle?: Puzzle;
  set?: PuzzleTrainingSet;
  panel?: 'dashboard' | 'analysis' | 'restart';
  disabledReason?: string;
  localPlaceholder?: boolean;
};

export type PuzzleAttemptInput = {
  puzzleId: string;
  outcome: PuzzleAttemptOutcome;
  elapsedSeconds: number;
  hintsUsed?: number;
  moves?: number;
  favorited?: boolean;
  session?: Pick<PuzzleSession, 'status' | 'elapsedSeconds' | 'hintsUsed' | 'steps'>;
  attemptedAt?: string;
};

export type PuzzleHistoryItem = {
  puzzleId: string;
  outcome: PuzzleAttemptOutcome;
  elapsedSeconds: number;
  hintsUsed: number;
  moves: number;
  attemptedAt: string;
};

export type PuzzleProgress = {
  completedPuzzleIds: string[];
  failedPuzzleIds: string[];
  mistakePuzzleIds: string[];
  favoritePuzzleIds: string[];
  currentStreak: number;
  bestStreak: number;
  totalAttempts: number;
  totalSolved: number;
  totalFailed: number;
  totalHintsUsed: number;
  totalElapsedSeconds: number;
  fastestSolveSeconds: number | null;
  trainingSetProgress: Record<string, { completed: number; total: number }>;
  history: PuzzleHistoryItem[];
};

export type PuzzleDashboardStats = {
  completedCount: number;
  failedCount: number;
  mistakeCount: number;
  favoriteCount: number;
  currentStreak: number;
  bestStreak: number;
  totalAttempts: number;
  totalHintsUsed: number;
  averageSeconds: number;
  fastestSolveSeconds: number | null;
  dailyPuzzleId: string;
  localRanking: Array<{ rank: number; name: string; solved: number; streak: number; seconds: number }>;
  commentPreview: Array<{ id: string; author: string; text: string; localOnly: true }>;
};

const localPuzzleIds = {
  daily: dailyPuzzle.id,
  forkTrap: 'local-fork-trap-001',
  cannonNet: 'local-cannon-net-002',
  rookMate: 'local-rook-mate-003',
  palacePin: 'local-palace-pin-004',
  endgameSprint: 'local-endgame-sprint-005',
};

export const puzzleTrainingSets: PuzzleTrainingSet[] = [
  {
    id: 'daily-puzzle',
    title: '每日残局',
    kind: 'daily',
    description: '接入当前 dailyPuzzle，可提示、复盘、重来。',
    puzzleIds: [dailyPuzzle.id],
    estimatedMinutes: 2,
    difficulty: 2,
    tags: ['每日', '一手胜', '本地'],
  },
  {
    id: 'campaign-basic',
    title: '残局闯关',
    kind: 'campaign',
    description: '从一手杀到多步定式的本地闯关路线。',
    puzzleIds: [dailyPuzzle.id, localPuzzleIds.forkTrap, localPuzzleIds.cannonNet, localPuzzleIds.endgameSprint],
    estimatedMinutes: 12,
    difficulty: 3,
    tags: ['闯关', '进阶', '连胜'],
  },
  {
    id: 'tactics-core',
    title: '战术训练',
    kind: 'tactic',
    description: '抽练牵制、闪击、抽将和弃子抢先。',
    puzzleIds: [localPuzzleIds.forkTrap, localPuzzleIds.cannonNet, dailyPuzzle.id],
    estimatedMinutes: 8,
    difficulty: 3,
    tags: ['战术', '速度', '计算'],
  },
  {
    id: 'mate-patterns',
    title: '杀法专题',
    kind: 'mate-theme',
    description: '沉底车、重炮、卧槽马等常见杀法专题。',
    puzzleIds: [localPuzzleIds.rookMate, localPuzzleIds.palacePin, dailyPuzzle.id],
    estimatedMinutes: 10,
    difficulty: 4,
    tags: ['杀法', '专题', '复盘'],
  },
  {
    id: 'mistake-review',
    title: '错题本',
    kind: 'review',
    description: '自动收集失败或放弃的题，支持本地复练。',
    puzzleIds: [],
    estimatedMinutes: 5,
    difficulty: 2,
    tags: ['错题', '复练', '本地'],
  },
  {
    id: 'favorite-review',
    title: '收藏题',
    kind: 'review',
    description: '把值得反复看的题放进收藏夹。',
    puzzleIds: [],
    estimatedMinutes: 5,
    difficulty: 2,
    tags: ['收藏', '复盘', '本地'],
  },
];

export const puzzleFeatureEntries: PuzzleFeatureEntry[] = [
  {
    id: 'daily',
    title: '每日残局',
    subtitle: dailyPuzzle.title,
    kind: 'daily',
    badge: '今日',
    trainingSetId: 'daily-puzzle',
    enabled: true,
    localOnly: true,
  },
  {
    id: 'campaign',
    title: '残局闯关',
    subtitle: '本地关卡路线',
    kind: 'campaign',
    badge: '进阶',
    trainingSetId: 'campaign-basic',
    enabled: true,
    localOnly: true,
  },
  {
    id: 'tactics',
    title: '战术训练',
    subtitle: '牵制 闪击 抽将',
    kind: 'training',
    trainingSetId: 'tactics-core',
    enabled: true,
    localOnly: true,
  },
  {
    id: 'mate-patterns',
    title: '杀法专题',
    subtitle: '沉底车 重炮 卧槽马',
    kind: 'theme',
    trainingSetId: 'mate-patterns',
    enabled: true,
    localOnly: true,
  },
  {
    id: 'mistakes',
    title: '错题本',
    subtitle: '失败题自动进入',
    kind: 'mistakes',
    trainingSetId: 'mistake-review',
    requiresItems: 'mistakes',
    enabled: true,
    localOnly: true,
  },
  {
    id: 'favorites',
    title: '收藏题',
    subtitle: '本地收藏复盘',
    kind: 'favorites',
    trainingSetId: 'favorite-review',
    requiresItems: 'favorites',
    enabled: true,
    localOnly: true,
  },
  {
    id: 'ranking',
    title: '排行榜',
    subtitle: '本机成绩排行',
    kind: 'ranking',
    enabled: true,
    localOnly: true,
  },
  {
    id: 'comments',
    title: '评论/讨论',
    subtitle: `${dailyPuzzle.stats.commentCount} 条本地讨论占位`,
    kind: 'comments',
    enabled: true,
    localOnly: true,
  },
  {
    id: 'analysis',
    title: '提示/复盘',
    subtitle: '看提示、回看正解',
    kind: 'analysis',
    enabled: true,
    localOnly: true,
  },
  {
    id: 'restart',
    title: '重来',
    subtitle: '保留统计并重置棋盘',
    kind: 'restart',
    enabled: true,
    localOnly: true,
  },
];

export function createPuzzleProgress(seed: Partial<PuzzleProgress> = {}): PuzzleProgress {
  const progress: PuzzleProgress = {
    completedPuzzleIds: [],
    failedPuzzleIds: [],
    mistakePuzzleIds: [],
    favoritePuzzleIds: [],
    currentStreak: 0,
    bestStreak: 0,
    totalAttempts: 0,
    totalSolved: 0,
    totalFailed: 0,
    totalHintsUsed: 0,
    totalElapsedSeconds: 0,
    fastestSolveSeconds: null,
    trainingSetProgress: buildTrainingSetProgress([]),
    history: [],
    ...seed,
  };

  return {
    ...progress,
    completedPuzzleIds: unique(progress.completedPuzzleIds),
    failedPuzzleIds: unique(progress.failedPuzzleIds),
    mistakePuzzleIds: unique(progress.mistakePuzzleIds),
    favoritePuzzleIds: unique(progress.favoritePuzzleIds),
    trainingSetProgress: {
      ...buildTrainingSetProgress(progress.completedPuzzleIds),
      ...progress.trainingSetProgress,
    },
    history: [...progress.history],
  };
}

export function getPuzzleFeatureAction(entryId: string, progress: PuzzleProgress): PuzzleFeatureAction {
  const entry = puzzleFeatureEntries.find((candidate) => candidate.id === entryId);
  if (!entry || !entry.enabled) {
    return {
      type: 'disabled',
      entryId,
      label: '暂不可用',
      disabledReason: entry ? '该入口已关闭。' : '入口不存在。',
    };
  }

  if (entry.requiresItems === 'mistakes' && progress.mistakePuzzleIds.length === 0) {
    return {
      type: 'open-review',
      entryId,
      label: '查看空错题本',
      set: buildReviewSet('mistake-review', progress.mistakePuzzleIds),
      localPlaceholder: true,
    };
  }

  if (entry.requiresItems === 'favorites' && progress.favoritePuzzleIds.length === 0) {
    return {
      type: 'open-review',
      entryId,
      label: '查看空收藏夹',
      set: buildReviewSet('favorite-review', progress.favoritePuzzleIds),
      localPlaceholder: true,
    };
  }

  if (entry.kind === 'daily') {
    return {
      type: 'open-daily',
      entryId,
      label: '开始每日残局',
      puzzle: dailyPuzzle,
      set: getTrainingSet('daily-puzzle'),
    };
  }

  if (entry.kind === 'ranking') {
    return {
      type: 'open-ranking',
      entryId,
      label: '查看本机排行榜',
      localPlaceholder: true,
    };
  }

  if (entry.kind === 'comments') {
    return {
      type: 'open-comments',
      entryId,
      label: '打开本地讨论',
      localPlaceholder: true,
    };
  }

  if (entry.kind === 'analysis' || entry.kind === 'restart') {
    return {
      type: 'show-panel',
      entryId,
      label: entry.kind === 'analysis' ? '打开提示复盘' : '重新开始',
      panel: entry.kind === 'analysis' ? 'analysis' : 'restart',
    };
  }

  if (entry.kind === 'mistakes') {
    return {
      type: 'open-review',
      entryId,
      label: '复练错题',
      set: buildReviewSet('mistake-review', progress.mistakePuzzleIds),
    };
  }

  if (entry.kind === 'favorites') {
    return {
      type: 'open-review',
      entryId,
      label: '复盘收藏',
      set: buildReviewSet('favorite-review', progress.favoritePuzzleIds),
    };
  }

  return {
    type: 'open-set',
    entryId,
    label: '开始训练',
    set: entry.trainingSetId ? getTrainingSet(entry.trainingSetId) : undefined,
  };
}

export function recordPuzzleAttempt(progress: PuzzleProgress, attempt: PuzzleAttemptInput): PuzzleProgress {
  const elapsedSeconds = Math.max(0, attempt.session?.elapsedSeconds ?? attempt.elapsedSeconds);
  const hintsUsed = Math.max(0, attempt.session?.hintsUsed ?? attempt.hintsUsed ?? 0);
  const moves = Math.max(0, attempt.session?.steps ?? attempt.moves ?? 0);
  const solved = attempt.outcome === 'solved';
  const failed = attempt.outcome === 'failed' || attempt.outcome === 'abandoned';
  const completedPuzzleIds = solved ? addUnique(progress.completedPuzzleIds, attempt.puzzleId) : progress.completedPuzzleIds;
  const failedPuzzleIds = failed ? addUnique(progress.failedPuzzleIds, attempt.puzzleId) : progress.failedPuzzleIds;
  const mistakePuzzleIds = failed ? addUnique(progress.mistakePuzzleIds, attempt.puzzleId) : removeItem(progress.mistakePuzzleIds, attempt.puzzleId);
  const favoritePuzzleIds =
    attempt.favorited === undefined
      ? progress.favoritePuzzleIds
      : attempt.favorited
        ? addUnique(progress.favoritePuzzleIds, attempt.puzzleId)
        : removeItem(progress.favoritePuzzleIds, attempt.puzzleId);
  const currentStreak = solved ? progress.currentStreak + 1 : 0;
  const fastestSolveSeconds =
    solved && (progress.fastestSolveSeconds === null || elapsedSeconds < progress.fastestSolveSeconds)
      ? elapsedSeconds
      : progress.fastestSolveSeconds;
  const historyItem: PuzzleHistoryItem = {
    puzzleId: attempt.puzzleId,
    outcome: attempt.outcome,
    elapsedSeconds,
    hintsUsed,
    moves,
    attemptedAt: attempt.attemptedAt ?? new Date().toISOString(),
  };

  return createPuzzleProgress({
    ...progress,
    completedPuzzleIds,
    failedPuzzleIds,
    mistakePuzzleIds,
    favoritePuzzleIds,
    currentStreak,
    bestStreak: Math.max(progress.bestStreak, currentStreak),
    totalAttempts: progress.totalAttempts + 1,
    totalSolved: progress.totalSolved + (solved ? 1 : 0),
    totalFailed: progress.totalFailed + (failed ? 1 : 0),
    totalHintsUsed: progress.totalHintsUsed + hintsUsed,
    totalElapsedSeconds: progress.totalElapsedSeconds + elapsedSeconds,
    fastestSolveSeconds,
    trainingSetProgress: buildTrainingSetProgress(completedPuzzleIds),
    history: [historyItem, ...progress.history].slice(0, 50),
  });
}

export function getPuzzleDashboardStats(progress: PuzzleProgress): PuzzleDashboardStats {
  const averageSeconds = progress.totalAttempts === 0 ? 0 : Math.round(progress.totalElapsedSeconds / progress.totalAttempts);

  return {
    completedCount: progress.completedPuzzleIds.length,
    failedCount: progress.failedPuzzleIds.length,
    mistakeCount: progress.mistakePuzzleIds.length,
    favoriteCount: progress.favoritePuzzleIds.length,
    currentStreak: progress.currentStreak,
    bestStreak: progress.bestStreak,
    totalAttempts: progress.totalAttempts,
    totalHintsUsed: progress.totalHintsUsed,
    averageSeconds,
    fastestSolveSeconds: progress.fastestSolveSeconds,
    dailyPuzzleId: dailyPuzzle.id,
    localRanking: buildLocalRanking(progress),
    commentPreview: [
      {
        id: 'local-comment-daily-plan',
        author: '本地棋友',
        text: '这一题先看中路，再判断将帅照面。',
        localOnly: true,
      },
      {
        id: 'local-comment-review',
        author: '复盘提示',
        text: '失败题会进入错题本，不需要登录。',
        localOnly: true,
      },
    ],
  };
}

function getTrainingSet(setId: string): PuzzleTrainingSet | undefined {
  return puzzleTrainingSets.find((set) => set.id === setId);
}

function buildReviewSet(setId: 'mistake-review' | 'favorite-review', puzzleIds: string[]): PuzzleTrainingSet {
  const base = getTrainingSet(setId);
  return {
    ...(base ?? {
      id: setId,
      title: setId === 'mistake-review' ? '错题本' : '收藏题',
      kind: 'review' as const,
      description: '本地复习列表。',
      estimatedMinutes: 5,
      difficulty: 2 as const,
      tags: ['本地'],
      puzzleIds: [],
    }),
    puzzleIds: unique(puzzleIds),
  };
}

function buildTrainingSetProgress(completedPuzzleIds: string[]): PuzzleProgress['trainingSetProgress'] {
  return Object.fromEntries(
    puzzleTrainingSets.map((set) => {
      const total = set.puzzleIds.length;
      const completed = unique(set.puzzleIds).filter((puzzleId) => completedPuzzleIds.includes(puzzleId)).length;
      return [set.id, { completed, total }];
    }),
  );
}

function buildLocalRanking(progress: PuzzleProgress): PuzzleDashboardStats['localRanking'] {
  return [
    {
      rank: 1,
      name: '你',
      solved: progress.totalSolved,
      streak: progress.bestStreak,
      seconds: progress.fastestSolveSeconds ?? 0,
    },
    {
      rank: 2,
      name: '本地示例 A',
      solved: Math.max(0, progress.totalSolved - 1),
      streak: Math.max(0, progress.bestStreak - 1),
      seconds: Math.max(6, progress.fastestSolveSeconds ?? dailyPuzzle.stats.fastestSeconds),
    },
    {
      rank: 3,
      name: '本地示例 B',
      solved: Math.max(0, progress.totalSolved - 2),
      streak: Math.max(0, progress.bestStreak - 2),
      seconds: Math.max(9, (progress.fastestSolveSeconds ?? dailyPuzzle.stats.fastestSeconds) + 3),
    },
  ];
}

function addUnique(items: string[], item: string): string[] {
  return items.includes(item) ? [...items] : [...items, item];
}

function removeItem(items: string[], item: string): string[] {
  return items.filter((candidate) => candidate !== item);
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}
