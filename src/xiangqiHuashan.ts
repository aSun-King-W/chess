export type XiangqiHuashanMode = 'pass' | 'summit';

export type XiangqiHuashanTimeControl = {
  totalMinutes: number;
  regularStepSeconds: number;
  openingStepSeconds: number;
  openingMoveCount: number;
};

export type XiangqiHuashanModeConfig = {
  id: XiangqiHuashanMode;
  title: string;
  description: string;
  unlock: string;
  startLabel: string;
  timeControl: XiangqiHuashanTimeControl;
};

export type XiangqiHuashanConfig = {
  id: string;
  title: string;
  seasonLabel: string;
  countdown: string;
  rank: number;
  winRate: number;
  streak: number;
  effectiveGames: number;
  passProgress: string;
  modes: XiangqiHuashanModeConfig[];
  rules: string[];
  rewards: string[];
};

export const xiangqiHuashanConfig: XiangqiHuashanConfig = {
  id: 'xiangqi-huashan-season',
  title: '华山论剑',
  seasonLabel: 'S3赛季',
  countdown: '34天18时后结束',
  rank: 1286,
  winRate: 62,
  streak: 3,
  effectiveGames: 18,
  passProgress: '12/20关',
  modes: [
    {
      id: 'pass',
      title: '过关赛',
      description: '通过20关后获得山顶赛资格，按有效局和连胜更新赛季成绩。',
      unlock: '当前进度12/20关',
      startLabel: '挑战过关赛',
      timeControl: { totalMinutes: 15, regularStepSeconds: 90, openingStepSeconds: 30, openingMoveCount: 3 },
    },
    {
      id: 'summit',
      title: '山顶赛',
      description: '每晚8点开赛，开赛前5分钟上华山可参加本场山顶赛。',
      unlock: '本地模拟已开放',
      startLabel: '进入山顶赛',
      timeControl: { totalMinutes: 10, regularStepSeconds: 60, openingStepSeconds: 30, openingMoveCount: 3 },
    },
  ],
  rules: [
    '有效局会计入赛季成绩，逃跑或恶意超时按负局处理。',
    '长将长捉会触发强制变招提示，判和按活动规则计入。',
    '真实观赛、实时排行和奖励领取在本地版只展示占位反馈。',
  ],
  rewards: ['赛季排名奖励', '连胜宝箱', '山顶赛称号资格'],
};

export function getHuashanModes(config: XiangqiHuashanConfig = xiangqiHuashanConfig): XiangqiHuashanModeConfig[] {
  return config.modes.map((mode) => ({ ...mode, timeControl: { ...mode.timeControl } }));
}

export function getHuashanMode(mode: XiangqiHuashanMode, config: XiangqiHuashanConfig = xiangqiHuashanConfig): XiangqiHuashanModeConfig {
  const found = config.modes.find((item) => item.id === mode);
  if (!found) throw new Error(`Unknown Huashan mode: ${mode}`);
  return { ...found, timeControl: { ...found.timeControl } };
}

export function getHuashanEventRows(config: XiangqiHuashanConfig = xiangqiHuashanConfig): Array<{ title: string; detail: string }> {
  return [
    { title: '赛季', detail: `${config.seasonLabel} · ${config.countdown}` },
    { title: '过关进度', detail: config.passProgress },
    { title: '当前排名', detail: `第${config.rank}名` },
    { title: '胜率/连胜', detail: `${config.winRate}% · ${config.streak}连胜` },
    { title: '有效局', detail: `${config.effectiveGames}局` },
  ];
}

export function getHuashanResultRows(
  didWin: boolean,
  mode: XiangqiHuashanMode,
  config: XiangqiHuashanConfig = xiangqiHuashanConfig,
): Array<{ title: string; detail: string }> {
  const modeConfig = getHuashanMode(mode, config);
  return [
    { title: '赛制', detail: modeConfig.title },
    { title: '赛季排名', detail: didWin ? `第${Math.max(1, config.rank - 18)}名` : `第${config.rank + 9}名` },
    { title: '连胜', detail: didWin ? `${config.streak + 1}连胜` : '连胜中断' },
    { title: '胜率', detail: `${didWin ? config.winRate + 1 : Math.max(0, config.winRate - 1)}%` },
  ];
}

export type XiangqiHuashanStageId = XiangqiHuashanMode;

export type XiangqiHuashanOutcome = 'win' | 'draw' | 'loss';

export type XiangqiHuashanSafePlaceholderId = 'spectating' | 'live-ranking' | 'reward-claim';

export type XiangqiHuashanRuleItem = {
  id: string;
  title: string;
  description: string;
};

export type XiangqiHuashanRewardItem = {
  id: string;
  title: string;
  requirement: string;
  reward: string;
};

export type XiangqiHuashanLeaderboardRow = {
  rank: number;
  player: string;
  score: number;
  streak: number;
  winRateLabel: string;
};

export type XiangqiHuashanSeasonStats = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  score: number;
  rank: number;
  effectiveGames: number;
};

export type XiangqiHuashanSeasonProgress = XiangqiHuashanSeasonStats & {
  title: string;
  progressTarget: number;
  progressPercent: number;
  progressLabel: string;
  winRate: number;
  winRateLabel: string;
  rankingLabel: string;
  streakLabel: string;
  effectiveGameTip: string;
};

export type XiangqiHuashanStageConfig = {
  id: XiangqiHuashanStageId;
  title: string;
  subtitle: string;
  entryLabel: string;
  settlementType: '闯关星数' | '山顶积分';
  scoringLabel: string;
  timeControl: XiangqiHuashanTimeControl & { label: string };
  challenge: {
    title: string;
    description: string;
    target: string;
    validGameRequirement: string;
  };
  rules: XiangqiHuashanRuleItem[];
  rewards: XiangqiHuashanRewardItem[];
};

export type XiangqiHuashanSafePlaceholder = {
  id: XiangqiHuashanSafePlaceholderId;
  title: string;
  message: string;
  available: false;
  localOnly: true;
};

export type XiangqiHuashanHomeData = {
  id: string;
  title: string;
  seasonTitle: string;
  countdownText: string;
  activeStage: XiangqiHuashanStageId;
  stages: XiangqiHuashanStageConfig[];
  seasonProgress: XiangqiHuashanSeasonProgress;
  leaderboard: XiangqiHuashanLeaderboardRow[];
  safePlaceholders: XiangqiHuashanSafePlaceholder[];
};

export type XiangqiHuashanChallengeSession = {
  id: string;
  stage: XiangqiHuashanStageId;
  moduleName: typeof XIANGQI_HUASHAN_TITLE;
  arenaTitle: string;
  tableLabel: string;
  timeLabel: string;
  stepLabel: string;
  totalSeconds: number;
  regularStepSeconds: number;
  openingMoveCount: number;
  openingStepSeconds: number;
  settlementType: XiangqiHuashanStageConfig['settlementType'];
  rewardLabel: string;
  validGameTip: string;
  replayTags: string[];
};

export type XiangqiHuashanResultSummary = {
  title: string;
  metricTitle: string;
  outcome: XiangqiHuashanOutcome;
  delta: string;
  progressLabel: string;
  streakLabel: string;
  rankLabel: string;
  validGameTip: string;
  rows: Array<{ title: string; detail: string }>;
};

export const XIANGQI_HUASHAN_TITLE = xiangqiHuashanConfig.title;

export const defaultHuashanSeasonStats: XiangqiHuashanSeasonStats = {
  played: 18,
  wins: 11,
  draws: 2,
  losses: 5,
  currentStreak: xiangqiHuashanConfig.streak,
  bestStreak: 6,
  score: 1260,
  rank: 128,
  effectiveGames: 16,
};

const huashanLeaderboard: readonly XiangqiHuashanLeaderboardRow[] = [
  { rank: 1, player: '西岳剑首', score: 2188, streak: 12, winRateLabel: '78%' },
  { rank: 2, player: '松风客', score: 2056, streak: 9, winRateLabel: '73%' },
  { rank: 3, player: '云台棋士', score: 1980, streak: 7, winRateLabel: '69%' },
  { rank: 128, player: '我', score: defaultHuashanSeasonStats.score, streak: 4, winRateLabel: '61%' },
];

const huashanSafePlaceholders: readonly XiangqiHuashanSafePlaceholder[] = [
  {
    id: 'spectating',
    title: '观赛',
    message: '真实观赛需要服务端房间流，本地版本仅保留入口文案，不连接直播对局。',
    available: false,
    localOnly: true,
  },
  {
    id: 'live-ranking',
    title: '实时排行',
    message: '实时排行需要服务端榜单推送，本地版本展示固定赛季榜示例。',
    available: false,
    localOnly: true,
  },
  {
    id: 'reward-claim',
    title: '奖励领取',
    message: '奖励领取需要账号与库存服务，本地版本只返回安全占位，不发放资产。',
    available: false,
    localOnly: true,
  },
];

export function getHuashanHomeData(
  activeStage: XiangqiHuashanStageId = 'pass',
  stats: XiangqiHuashanSeasonStats = defaultHuashanSeasonStats,
): XiangqiHuashanHomeData {
  return {
    id: 'xiangqi-huashan',
    title: XIANGQI_HUASHAN_TITLE,
    seasonTitle: xiangqiHuashanConfig.seasonLabel,
    countdownText: xiangqiHuashanConfig.countdown,
    activeStage,
    stages: getHuashanStages(),
    seasonProgress: getHuashanSeasonProgress(stats),
    leaderboard: getHuashanLeaderboard(),
    safePlaceholders: getHuashanSafePlaceholders(),
  };
}

export function getHuashanStages(): XiangqiHuashanStageConfig[] {
  return getHuashanModes().map(makeHuashanStageConfig);
}

export function getHuashanStage(stage: XiangqiHuashanStageId): XiangqiHuashanStageConfig {
  return makeHuashanStageConfig(getHuashanMode(stage));
}

export function getHuashanRules(stage?: XiangqiHuashanStageId): XiangqiHuashanRuleItem[] {
  if (stage) return getHuashanStage(stage).rules;
  return getHuashanStages().flatMap((item) => item.rules);
}

export function getHuashanRewards(stage?: XiangqiHuashanStageId): XiangqiHuashanRewardItem[] {
  if (stage) return getHuashanStage(stage).rewards;
  return getHuashanStages().flatMap((item) => item.rewards);
}

export function getHuashanLeaderboard(): XiangqiHuashanLeaderboardRow[] {
  return huashanLeaderboard.map((row) => ({ ...row }));
}

export function getHuashanSafePlaceholders(): XiangqiHuashanSafePlaceholder[] {
  return huashanSafePlaceholders.map((item) => ({ ...item }));
}

export function getHuashanSafePlaceholder(action: 'spectate' | 'ranking' | 'reward'): string;
export function getHuashanSafePlaceholder(id: XiangqiHuashanSafePlaceholderId): XiangqiHuashanSafePlaceholder;
export function getHuashanSafePlaceholder(
  id: 'spectate' | 'ranking' | 'reward' | XiangqiHuashanSafePlaceholderId,
): string | XiangqiHuashanSafePlaceholder {
  if (id === 'spectate') return '观赛入口为本地占位，不连接真实直播或旁观。';
  if (id === 'ranking') return '实时排行为本地模拟，不同步线上榜单。';
  if (id === 'reward') return '奖励领取为本地占位，不发放真实资产。';

  const found = huashanSafePlaceholders.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown Huashan placeholder: ${id}`);
  return { ...found };
}

export function getHuashanSeasonProgress(
  stats: XiangqiHuashanSeasonStats = defaultHuashanSeasonStats,
): XiangqiHuashanSeasonProgress {
  const progressTarget = 20;
  const progressPercent = Math.min(100, Math.round((stats.effectiveGames / progressTarget) * 100));
  const winRate = getHuashanWinRate(stats);

  return {
    ...stats,
    title: '本赛季进度',
    progressTarget,
    progressPercent,
    progressLabel: `${stats.effectiveGames}/${progressTarget} 有效局`,
    winRate,
    winRateLabel: `${winRate}%`,
    rankingLabel: `当前第 ${stats.rank} 名`,
    streakLabel: getHuashanWinningStreakSummary(stats.currentStreak, stats.bestStreak),
    effectiveGameTip: `当前${stats.effectiveGames}局计入赛季，满${progressTarget}局后进入完整奖励资格判断。`,
  };
}

export function getHuashanWinRate(stats: Pick<XiangqiHuashanSeasonStats, 'wins' | 'played'>): number {
  if (stats.played <= 0) return 0;
  return Math.round((stats.wins / stats.played) * 100);
}

export function getHuashanWinningStreakSummary(currentStreak: number, bestStreak: number): string {
  return `当前${currentStreak}连胜 / 最佳${bestStreak}连胜`;
}

export function createHuashanChallengeSession(
  stage: XiangqiHuashanStageId = 'pass',
  tableNumber = 1,
): XiangqiHuashanChallengeSession {
  const config = getHuashanStage(stage);
  const { timeControl } = config;

  return {
    id: `huashan-${stage}-${tableNumber}`,
    stage,
    moduleName: XIANGQI_HUASHAN_TITLE,
    arenaTitle: config.title,
    tableLabel: `${config.title} ${tableNumber}`,
    timeLabel: `${timeControl.totalMinutes}分钟`,
    stepLabel: `前3步${timeControl.openingStepSeconds}秒，之后${timeControl.regularStepSeconds}秒`,
    totalSeconds: timeControl.totalMinutes * 60,
    regularStepSeconds: timeControl.regularStepSeconds,
    openingMoveCount: timeControl.openingMoveCount,
    openingStepSeconds: timeControl.openingStepSeconds,
    settlementType: config.settlementType,
    rewardLabel: config.scoringLabel,
    validGameTip: config.challenge.validGameRequirement,
    replayTags: [XIANGQI_HUASHAN_TITLE, config.title, `${config.settlementType}结算`],
  };
}

export function getHuashanResultSummary(
  session: XiangqiHuashanChallengeSession,
  outcome: XiangqiHuashanOutcome,
  stats: XiangqiHuashanSeasonStats = defaultHuashanSeasonStats,
): XiangqiHuashanResultSummary {
  const delta = getHuashanOutcomeDelta(session.stage, outcome);
  const progress = getHuashanSeasonProgress(applyHuashanOutcome(stats, session.stage, outcome));

  return {
    title: `${session.arenaTitle}结算`,
    metricTitle: session.settlementType,
    outcome,
    delta: formatHuashanSigned(delta),
    progressLabel: progress.progressLabel,
    streakLabel: progress.streakLabel,
    rankLabel: progress.rankingLabel,
    validGameTip: session.validGameTip,
    rows: [
      { title: '模块', detail: session.moduleName },
      { title: '赛制', detail: session.arenaTitle },
      { title: '结算类型', detail: session.settlementType },
      { title: '结算', detail: session.rewardLabel },
      { title: '有效局提示', detail: session.validGameTip },
    ],
  };
}

export function getHuashanReplayRows(
  session: XiangqiHuashanChallengeSession,
): Array<{ title: string; detail: string }> {
  return [
    { title: '模块', detail: session.moduleName },
    { title: '赛制', detail: session.arenaTitle },
    { title: '桌号', detail: session.tableLabel },
    { title: '局时', detail: session.timeLabel },
    { title: '步时', detail: session.stepLabel },
    { title: '结算类型', detail: session.settlementType },
    { title: '结算', detail: session.rewardLabel },
    { title: '有效局', detail: session.validGameTip },
  ];
}

function makeHuashanStageConfig(mode: XiangqiHuashanModeConfig): XiangqiHuashanStageConfig {
  const isPass = mode.id === 'pass';

  return {
    id: mode.id,
    title: mode.title,
    subtitle: mode.description,
    entryLabel: mode.startLabel,
    settlementType: isPass ? '闯关星数' : '山顶积分',
    scoringLabel: isPass ? '胜+3星 / 和+1星 / 负不加星' : '胜+18分 / 和+3分 / 负-12分',
    timeControl: {
      ...mode.timeControl,
      label: `局时 ${mode.timeControl.totalMinutes} 分钟 / 步时 ${mode.timeControl.regularStepSeconds} 秒 / 前 3 步 ${mode.timeControl.openingStepSeconds} 秒`,
    },
    challenge: {
      title: '本地挑战局',
      description: isPass
        ? '本地生成过关赛练习局，只记录安全的结算和复盘展示数据。'
        : '本地生成山顶赛练习局，模拟积分、排名、胜率和连胜展示。',
      target: isPass ? '完成过关挑战并尽量保持连胜。' : '提升山顶积分并冲击赛季榜名次。',
      validGameRequirement: isPass
        ? '满20回合或完成将死、认输、超时结算后计为有效局。'
        : '满30回合或完成将死、认输、超时结算后计为有效局。',
    },
    rules: makeHuashanRules(mode.id),
    rewards: makeHuashanRewards(mode.id),
  };
}

function makeHuashanRules(stage: XiangqiHuashanStageId): XiangqiHuashanRuleItem[] {
  if (stage === 'pass') {
    return [
      { id: 'pass-stars', title: '闯关星数', description: '过关赛按单局结果累计星数，星数用于推进赛季进度。' },
      { id: 'pass-streak', title: '连胜加成', description: '三连胜后展示连胜状态，本地 helper 不叠加真实服务奖励。' },
      { id: 'valid-game', title: '有效局', description: '未达到有效局条件的对局只可复盘，不进入赛季统计。' },
    ];
  }

  return [
    { id: 'summit-score', title: '山顶积分', description: '山顶赛按胜平负改变积分，积分用于赛季榜排序展示。' },
    { id: 'summit-ranking', title: '排名', description: '排名由本地示例积分派生，实时排行接入前仅作安全占位。' },
    { id: 'valid-game', title: '有效局', description: '未达到有效局条件的对局只可复盘，不进入赛季统计。' },
  ];
}

function makeHuashanRewards(stage: XiangqiHuashanStageId): XiangqiHuashanRewardItem[] {
  if (stage === 'pass') {
    return [
      { id: 'pass-badge', title: '闯关徽记', requirement: '赛季星数达到30', reward: '展示用华山闯关徽记' },
      { id: 'pass-title', title: '剑客称号', requirement: '完成过关且胜率不低于60%', reward: '展示用限时称号' },
    ];
  }

  return [
    { id: 'summit-top', title: '山顶榜奖励', requirement: '赛季榜前100名', reward: '展示用榜单奖励资格' },
    { id: 'summit-streak', title: '连胜奖励', requirement: '赛季最佳连胜达到8', reward: '展示用连胜宝箱' },
  ];
}

function getHuashanOutcomeDelta(stage: XiangqiHuashanStageId, outcome: XiangqiHuashanOutcome): number {
  const passDelta: Record<XiangqiHuashanOutcome, number> = { win: 3, draw: 1, loss: 0 };
  const summitDelta: Record<XiangqiHuashanOutcome, number> = { win: 18, draw: 3, loss: -12 };
  return stage === 'pass' ? passDelta[outcome] : summitDelta[outcome];
}

function applyHuashanOutcome(
  stats: XiangqiHuashanSeasonStats,
  stage: XiangqiHuashanStageId,
  outcome: XiangqiHuashanOutcome,
): XiangqiHuashanSeasonStats {
  const isWin = outcome === 'win';
  const currentStreak = isWin ? stats.currentStreak + 1 : 0;

  return {
    ...stats,
    played: stats.played + 1,
    wins: stats.wins + (isWin ? 1 : 0),
    draws: stats.draws + (outcome === 'draw' ? 1 : 0),
    losses: stats.losses + (outcome === 'loss' ? 1 : 0),
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    score: stats.score + getHuashanOutcomeDelta(stage, outcome),
    rank: stage === 'summit' && isWin ? Math.max(1, stats.rank - 3) : stats.rank,
    effectiveGames: stats.effectiveGames + 1,
  };
}

function formatHuashanSigned(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}
