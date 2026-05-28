export type XiangqiRatingDimensionId =
  | 'opening'
  | 'middlegame'
  | 'endgame'
  | 'blunder'
  | 'sacrifice'
  | 'mateConversion';

export type XiangqiRatingOutcome = 'win' | 'draw' | 'loss';
export type XiangqiRatingGrade = 'excellent' | 'stable' | 'needs-practice';

export type XiangqiRatingTimeControl = {
  totalMinutes: number;
  stepSeconds: number;
  openingStepSeconds: number;
  openingMoveCount: number;
  label: string;
};

export type XiangqiRatingDimension = {
  id: XiangqiRatingDimensionId;
  title: string;
  description: string;
  reviewLabel: string;
  suggestion: string;
  maxScore: number;
};

export type XiangqiRatingConfig = {
  id: string;
  title: string;
  arenaTitle: string;
  description: string;
  currentTitle: string;
  currentProgress: number;
  targetProgress: number;
  entryResource: string;
  settlementType: '评测分';
  timeControl: XiangqiRatingTimeControl;
  dimensions: XiangqiRatingDimension[];
};

export type XiangqiRatingEntryRow = {
  id: string;
  label: string;
  value: string;
};

export type XiangqiRatingSessionRow = {
  id: string;
  title: string;
  detail: string;
};

export type XiangqiRatingReviewRow = {
  title: string;
  detail: string;
};

export type XiangqiRatingScoreInput = {
  dimensionId: XiangqiRatingDimensionId;
  score: number;
};

export type XiangqiRatingDimensionResult = XiangqiRatingDimension & {
  score: number;
  grade: XiangqiRatingGrade;
};

export type XiangqiRatingSettlement = {
  outcome: XiangqiRatingOutcome;
  ratingScore: number;
  ratingDelta: string;
  progressLabel: string;
  progressPercent: number;
  dimensionResults: XiangqiRatingDimensionResult[];
  strongestDimension: XiangqiRatingDimensionResult;
  weakestDimension: XiangqiRatingDimensionResult;
  trainingSuggestions: string[];
  replayRows: XiangqiRatingReviewRow[];
};

export const XIANGQI_RATING_DIMENSIONS: XiangqiRatingDimension[] = [
  {
    id: 'opening',
    title: '开局',
    description: '布局完整度、出子效率和常见变化选择。',
    reviewLabel: '开局准备',
    suggestion: '继续巩固中炮、屏风马常见变化。',
    maxScore: 100,
  },
  {
    id: 'middlegame',
    title: '中局',
    description: '子力协调、攻守转换和局面判断。',
    reviewLabel: '中局协调',
    suggestion: '注意子力协调，减少无根子暴露。',
    maxScore: 100,
  },
  {
    id: 'endgame',
    title: '残局',
    description: '优势转化、守和能力和基本型掌握。',
    reviewLabel: '残局功底',
    suggestion: '多练车兵残局和单车守和基本型。',
    maxScore: 100,
  },
  {
    id: 'blunder',
    title: '漏着',
    description: '对将杀、捉双和战术威胁的识别。',
    reviewLabel: '漏着控制',
    suggestion: '落子前检查对方将杀与捉双。',
    maxScore: 100,
  },
  {
    id: 'sacrifice',
    title: '送子',
    description: '交换计算、净得失和弃子合理性。',
    reviewLabel: '送子风险',
    suggestion: '交换前先确认净得子或形成攻势。',
    maxScore: 100,
  },
  {
    id: 'mateConversion',
    title: '将杀把握',
    description: '连续将军、杀法路线和临门转化。',
    reviewLabel: '将杀转化',
    suggestion: '保持将军路线连续性，避免攻势中断。',
    maxScore: 100,
  },
];

export const xiangqiRatingConfig: XiangqiRatingConfig = {
  id: 'xiangqi-rating-evaluation',
  title: '棋力评测',
  arenaTitle: '15分钟评测局',
  description: '通过一盘15分钟评测局，分析开局、中局、残局和关键失误质量。',
  currentTitle: '业余1级',
  currentProgress: 70,
  targetProgress: 100,
  entryResource: '免费评测',
  settlementType: '评测分',
  timeControl: {
    totalMinutes: 15,
    stepSeconds: 90,
    openingStepSeconds: 30,
    openingMoveCount: 3,
    label: '局时15分钟，步时90秒，前3步30秒',
  },
  dimensions: XIANGQI_RATING_DIMENSIONS,
};

export function getRatingEntryRows(config: XiangqiRatingConfig = xiangqiRatingConfig): XiangqiRatingEntryRow[] {
  return [
    { id: 'module', label: '模块', value: config.title },
    { id: 'time-control', label: '本场说明', value: config.timeControl.label },
    { id: 'dimensions', label: '能力维度', value: config.dimensions.map((dimension) => dimension.title).join(' / ') },
    { id: 'settlement', label: '结算类型', value: config.settlementType },
    { id: 'entry-resource', label: '入场', value: config.entryResource },
  ];
}

export function getRatingSessionRows(config: XiangqiRatingConfig = xiangqiRatingConfig): XiangqiRatingSessionRow[] {
  return [
    { id: 'current-title', title: '当前头衔', detail: `${config.currentTitle} · ${config.currentProgress}/${config.targetProgress}` },
    { id: 'time-control', title: '局时步时', detail: config.timeControl.label },
    {
      id: 'description',
      title: '评测说明',
      detail: `${config.description} ${config.timeControl.label}，能力维度结算为${config.settlementType}。`,
    },
    { id: 'dimensions', title: '评测维度', detail: config.dimensions.map((dimension) => dimension.title).join(' / ') },
    { id: 'entry-resource', title: '入场', detail: config.entryResource },
  ];
}

export function getRatingDimensions(config: XiangqiRatingConfig = xiangqiRatingConfig): XiangqiRatingDimension[] {
  return config.dimensions.map((dimension) => ({ ...dimension }));
}

export function settleXiangqiRating(
  outcome: XiangqiRatingOutcome,
  scores: XiangqiRatingScoreInput[],
  config: XiangqiRatingConfig = xiangqiRatingConfig,
): XiangqiRatingSettlement {
  const dimensionResults = config.dimensions.map((dimension) => {
    const score = normalizeScore(scores.find((item) => item.dimensionId === dimension.id)?.score ?? 70);
    return {
      ...dimension,
      score,
      grade: score >= 85 ? 'excellent' : score >= 75 ? 'stable' : 'needs-practice',
    } satisfies XiangqiRatingDimensionResult;
  });
  const average = Math.round(dimensionResults.reduce((sum, item) => sum + item.score, 0) / dimensionResults.length);
  const ratingScore = average + (outcome === 'win' ? 12 : outcome === 'draw' ? 2 : -8);
  const delta = ratingScore - 60;
  const progress = Math.max(0, Math.min(config.targetProgress, config.currentProgress + delta));
  const weakestDimension = [...dimensionResults].sort((a, b) => a.score - b.score)[0];
  const strongestDimension = [...dimensionResults].sort((a, b) => b.score - a.score)[0];
  const trainingSuggestions = dimensionResults
    .filter((item) => item.score < 70)
    .map((item) => `${item.title}：${item.suggestion}`);
  const fallbackSuggestions = [`${weakestDimension.title}：${weakestDimension.suggestion}`];
  const finalSuggestions = trainingSuggestions.length > 0 ? trainingSuggestions : fallbackSuggestions;

  return {
    outcome,
    ratingScore,
    ratingDelta: formatSigned(delta),
    progressLabel: `${progress}/${config.targetProgress}`,
    progressPercent: toPercent(progress, config.targetProgress),
    dimensionResults,
    strongestDimension,
    weakestDimension,
    trainingSuggestions: finalSuggestions,
    replayRows: getRatingReplayRows(ratingScore, delta, dimensionResults, finalSuggestions, config),
  };
}

export function getRatingReplayRows(
  ratingScore: number,
  delta: number,
  dimensionResults: XiangqiRatingDimensionResult[],
  trainingSuggestions: string[],
  config: XiangqiRatingConfig = xiangqiRatingConfig,
): XiangqiRatingReviewRow[] {
  return [
    { title: '模块', detail: config.title },
    { title: '场次', detail: config.arenaTitle },
    { title: '局时', detail: config.timeControl.label },
    { title: '结算类型', detail: config.settlementType },
    { title: '评测分', detail: `${ratingScore} (${formatSigned(delta)})` },
    {
      title: '能力维度',
      detail: dimensionResults.map((item) => `${item.title}${item.score}`).join(' / '),
    },
    { title: '训练建议', detail: trainingSuggestions.join('；') },
  ];
}

export function getRatingResult(didWin: boolean, config: XiangqiRatingConfig = xiangqiRatingConfig) {
  const settlement = settleXiangqiRating(didWin ? 'win' : 'loss', defaultScores(didWin), config);
  return {
    scoreDelta: Number(settlement.ratingDelta),
    scoreLabel: `${settlement.ratingDelta}评测分`,
    progressLabel: settlement.progressLabel,
    progressPercent: settlement.progressPercent,
    rows: settlement.dimensionResults.map((item) => ({
      title: item.title,
      detail: `${item.score}分 · ${item.suggestion}`,
    })),
    advice: settlement.trainingSuggestions,
  };
}

export function getRatingReplayTags(config: XiangqiRatingConfig = xiangqiRatingConfig): string[] {
  return [config.title, config.currentTitle, `${config.timeControl.totalMinutes}分钟`, '评测结算'];
}

function defaultScores(didWin: boolean): XiangqiRatingScoreInput[] {
  if (didWin) {
    return [
      { dimensionId: 'opening', score: 82 },
      { dimensionId: 'middlegame', score: 76 },
      { dimensionId: 'endgame', score: 68 },
      { dimensionId: 'blunder', score: 58 },
      { dimensionId: 'sacrifice', score: 63 },
      { dimensionId: 'mateConversion', score: 88 },
    ];
  }

  return [
    { dimensionId: 'opening', score: 72 },
    { dimensionId: 'middlegame', score: 66 },
    { dimensionId: 'endgame', score: 64 },
    { dimensionId: 'blunder', score: 58 },
    { dimensionId: 'sacrifice', score: 60 },
    { dimensionId: 'mateConversion', score: 62 },
  ];
}

function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function toPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}
