export type CertificationRank = {
  title: string;
  tier: string;
  score: number;
};

export type CertificationProgress = {
  current: number;
  target: number;
  label: string;
};

export type CertificationTimeControl = {
  totalMinutes: number;
  stepSeconds: number;
  openingMoveCount: number;
  openingStepSeconds: number;
};

export type CertificationRuleOutcome = 'win' | 'draw' | 'loss';

export type CertificationOpponentLevel = 'same' | 'lower' | 'higher';

export type CertificationScoreChange = {
  opponentLevel: CertificationOpponentLevel;
  label: string;
  win: number;
  draw: number;
  loss: number;
  note: string;
};

export type CertificationInitialScore = {
  rank: string;
  score: number;
  note: string;
};

export type CertificationRuleSummaryItem = {
  id: string;
  title: string;
  description: string;
};

export type CertificationSessionRow = {
  id: string;
  label: string;
  value: string;
  detail?: string;
};

export type CertificationHistoryBestNode = {
  id: string;
  label: string;
  rank: string;
  progress: CertificationProgress;
  featured: boolean;
};

export type XiangqiCertificationConfig = {
  id: string;
  title: string;
  seasonCountdownText: string;
  currentRank: CertificationRank;
  nextRankLabel: string;
  nextProgress: CertificationProgress;
  historyBestRank: CertificationRank;
  rewardRequirement: string;
  entryResource: string;
  startDescription: string;
  timeControl: CertificationTimeControl;
  initialScores: CertificationInitialScore[];
  scoreChanges: CertificationScoreChange[];
  certificateRule: string;
  historyBestNodes: CertificationHistoryBestNode[];
};

export const xiangqiCertificationConfig: XiangqiCertificationConfig = {
  id: 'xiangqi-certification-4',
  title: '棋力认证第4届',
  seasonCountdownText: '12天12时后结束',
  currentRank: {
    title: '村级棋士I',
    tier: '村级棋士',
    score: 85,
  },
  nextRankLabel: '村级棋士II',
  nextProgress: {
    current: 85,
    target: 100,
    label: '85/100',
  },
  historyBestRank: {
    title: '村级棋士I',
    tier: '村级棋士',
    score: 70,
  },
  rewardRequirement: '达到【棋圣V】及以上',
  entryResource: '2500/次',
  startDescription: '输赢仅计算棋力分，局时15分钟，步时90秒，前3步30秒。',
  timeControl: {
    totalMinutes: 15,
    stepSeconds: 90,
    openingMoveCount: 3,
    openingStepSeconds: 30,
  },
  initialScores: [
    { rank: '村级棋士I', score: 0, note: '新认证用户从村级棋士I开始累计棋力分。' },
    { rank: '村级棋士II', score: 100, note: '达到下级门槛后进入村级棋士II。' },
    { rank: '棋圣V', score: 900, note: '达到棋圣V及以上可进入奖励资格判断。' },
  ],
  scoreChanges: [
    {
      opponentLevel: 'same',
      label: '同等级',
      win: 10,
      draw: 0,
      loss: -10,
      note: '同等级对局按标准胜平负变化棋力分。',
    },
    {
      opponentLevel: 'lower',
      label: '低等级',
      win: 5,
      draw: -5,
      loss: -15,
      note: '对低等级对手获胜加分较少，平负扣分更多。',
    },
    {
      opponentLevel: 'higher',
      label: '高等级',
      win: 15,
      draw: 5,
      loss: -5,
      note: '对高等级对手获胜和平局奖励更高，失利扣分较少。',
    },
  ],
  certificateRule: '活动结束后，系统按最终棋力等级发放证书；达到【棋圣V】及以上可获得奖励资格。',
  historyBestNodes: [
    {
      id: 'current-season',
      label: '本届当前',
      rank: '村级棋士I',
      progress: { current: 85, target: 100, label: '85/100' },
      featured: true,
    },
    {
      id: 'season-3',
      label: '第3届',
      rank: '村级棋士I',
      progress: { current: 85, target: 100, label: '85/100' },
      featured: false,
    },
    {
      id: 'season-2',
      label: '第2届',
      rank: '村级棋士I',
      progress: { current: 70, target: 100, label: '70/100' },
      featured: false,
    },
  ],
};

export function getCertificationSessionRows(
  config: XiangqiCertificationConfig = xiangqiCertificationConfig,
): CertificationSessionRow[] {
  return [
    {
      id: 'season-countdown',
      label: '赛季倒计时',
      value: config.seasonCountdownText,
    },
    {
      id: 'current-rank',
      label: '当前等级',
      value: config.currentRank.title,
      detail: `${config.currentRank.score}/${config.nextProgress.target}`,
    },
    {
      id: 'next-progress',
      label: '下级进度',
      value: config.nextProgress.label,
      detail: `下一等级 ${config.nextRankLabel}`,
    },
    {
      id: 'history-best',
      label: '历史最高',
      value: config.historyBestRank.title,
    },
    {
      id: 'reward-requirement',
      label: '奖励门槛',
      value: config.rewardRequirement,
    },
    {
      id: 'entry-resource',
      label: '入场资源',
      value: config.entryResource,
    },
  ];
}

export function getCertificationRuleSummary(
  config: XiangqiCertificationConfig = xiangqiCertificationConfig,
): CertificationRuleSummaryItem[] {
  const initialScoreText = config.initialScores
    .map((item) => `${item.rank} ${item.score}分`)
    .join('，');
  const scoreChangeText = config.scoreChanges
    .map((item) => `${item.label}胜${formatScoreChange(item.win)} 平${formatScoreChange(item.draw)} 负${formatScoreChange(item.loss)}`)
    .join('；');

  return [
    {
      id: 'start-description',
      title: '开局说明',
      description: config.startDescription,
    },
    {
      id: 'initial-scores',
      title: '初始等级积分',
      description: initialScoreText,
    },
    {
      id: 'score-changes',
      title: '胜平负变化',
      description: scoreChangeText,
    },
    {
      id: 'certificate',
      title: '证书发放',
      description: config.certificateRule,
    },
  ];
}

export function getCertificationHistoryBestNodes(
  config: XiangqiCertificationConfig = xiangqiCertificationConfig,
): CertificationHistoryBestNode[] {
  return config.historyBestNodes;
}

function formatScoreChange(score: number): string {
  if (score > 0) return `+${score}`;
  return String(score);
}
