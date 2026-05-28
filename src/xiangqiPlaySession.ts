import {
  getCertificationRuleSummary,
  xiangqiCertificationConfig,
} from './xiangqiCertification.js';
import {
  coinArenaRandomOpening,
  defaultCoinArenaWallet,
  getCoinArenaRow,
  getCoinArenaSession,
} from './xiangqiCoinArena.js';
import type { XiangqiCoinArenaRowId, XiangqiCoinArenaWallet } from './xiangqiCoinArena.js';
import { getMinuteArenaSession } from './xiangqiMinuteArena.js';
import type { XiangqiMinuteArenaMode } from './xiangqiMinuteArena.js';
import {
  getRatingReplayTags,
  getRatingResult,
  getRatingSessionRows,
  xiangqiRatingConfig,
} from './xiangqiRating.js';
import {
  getHuashanMode,
  getHuashanResultRows,
  xiangqiHuashanConfig,
} from './xiangqiHuashan.js';
import type { XiangqiHuashanMode } from './xiangqiHuashan.js';
import {
  createFriendRoom,
  getFriendRoomRows,
} from './xiangqiFriendRoom.js';
import type { XiangqiFriendRoom, XiangqiFriendRoomMode } from './xiangqiFriendRoom.js';

export type XiangqiPlayMatchMode =
  | 'certification'
  | 'coinRandom'
  | 'fast5'
  | 'standard10'
  | 'slow20'
  | 'training'
  | 'rating'
  | 'huashan'
  | 'friend';

export type XiangqiPlaySessionKind = 'certification' | 'coin' | 'minute' | 'rating' | 'huashan' | 'friend' | 'generic';
export type XiangqiPlaySettlementType = '棋力分' | '铜钱' | '积分' | '评测分' | '活动成绩' | '好友局' | '练习';

export type XiangqiPlaySession = {
  id: string;
  kind: XiangqiPlaySessionKind;
  matchMode: XiangqiPlayMatchMode;
  moduleName: string;
  label: string;
  entryTitle: string;
  arenaTitle: string;
  tableLabel: string;
  detail: string;
  timeLabel: string;
  stepLabel: string;
  ticketLabel: string;
  costLabel: string;
  rewardLabel: string;
  settlementType: XiangqiPlaySettlementType;
  totalSeconds: number;
  regularStepSeconds: number;
  openingStepSeconds: number;
  openingMoveCount: number;
  resultMetricTitle: string;
  winDelta: string;
  lossDelta: string;
  progressTitle: string;
  progressWinLabel: string;
  progressLossLabel: string;
  progressWinPercent: number;
  progressLossPercent: number;
  replayTags: string[];
  notes: string[];
  resultRows?: Array<{ title: string; detail: string }>;
  replayRows?: Array<{ title: string; detail: string }>;
};

export type XiangqiPlayResultSummary = {
  metricTitle: string;
  delta: string;
  progressTitle: string;
  progressLabel: string;
  progressPercent: number;
  rows: Array<{ title: string; detail: string }>;
};

export function createCertificationPlaySession(tableSeed = 1): XiangqiPlaySession {
  const time = xiangqiCertificationConfig.timeControl;
  const highLevelScoreChange = xiangqiCertificationConfig.scoreChanges.find((item) => item.opponentLevel === 'higher');
  const lowLevelScoreChange = xiangqiCertificationConfig.scoreChanges.find((item) => item.opponentLevel === 'lower');
  const ruleText = getCertificationRuleSummary()
    .find((item) => item.id === 'score-changes')
    ?.description ?? '胜负结算棋力分';
  const winDelta = highLevelScoreChange?.win ?? 15;
  const lossDelta = lowLevelScoreChange?.loss ?? -15;
  const lossProgress = xiangqiCertificationConfig.currentRank.score;
  const targetProgress = xiangqiCertificationConfig.nextProgress.target;

  return {
    id: xiangqiCertificationConfig.id,
    kind: 'certification',
    matchMode: 'certification',
    moduleName: '棋力认证',
    label: xiangqiCertificationConfig.title,
    entryTitle: xiangqiCertificationConfig.title,
    arenaTitle: xiangqiCertificationConfig.currentRank.title,
    tableLabel: `认证席 ${tableSeed}`,
    detail: '输赢仅计算棋力分',
    timeLabel: `${time.totalMinutes}分钟`,
    stepLabel: `前${time.openingMoveCount}步${time.openingStepSeconds}秒，之后${time.stepSeconds}秒`,
    ticketLabel: xiangqiCertificationConfig.entryResource,
    costLabel: xiangqiCertificationConfig.entryResource,
    rewardLabel: '输赢仅计算棋力分',
    settlementType: '棋力分',
    totalSeconds: time.totalMinutes * 60,
    regularStepSeconds: time.stepSeconds,
    openingStepSeconds: time.openingStepSeconds,
    openingMoveCount: time.openingMoveCount,
    resultMetricTitle: '棋力分变化',
    winDelta: formatSignedDelta(winDelta),
    lossDelta: formatSignedDelta(lossDelta),
    progressTitle: xiangqiCertificationConfig.currentRank.title,
    progressWinLabel: '100/110',
    progressLossLabel: `${lossProgress}/${targetProgress}`,
    progressWinPercent: toPercent(100, 110),
    progressLossPercent: toPercent(lossProgress, targetProgress),
    replayTags: [
      '棋力认证',
      xiangqiCertificationConfig.currentRank.title,
      `${time.totalMinutes}分钟`,
      '棋力分结算',
    ],
    notes: [ruleText, xiangqiCertificationConfig.certificateRule],
  };
}

export function createCoinPlaySession(
  rowId: XiangqiCoinArenaRowId,
  wallet: XiangqiCoinArenaWallet = defaultCoinArenaWallet,
  tableSeed = 1,
): XiangqiPlaySession {
  const row = getCoinArenaRow(rowId);
  const admission = getCoinArenaSession(rowId, wallet);
  const time = getCoinTimeControl(rowId);
  const winAmount = row.randomOpening
    ? row.randomOpening.winLoss
    : Math.round(row.baseStake * (1 + row.bonus.rate / 100));
  const lossAmount = row.randomOpening ? row.randomOpening.winLoss : row.baseStake;
  const winBalance = admission.coinBalance + winAmount;
  const lossBalance = Math.max(0, admission.coinBalance - lossAmount);
  const ticketLabel = row.randomOpening ? `门票${row.randomOpening.ticket}铜钱` : '无门票';
  const randomDetail = row.randomOpening
    ? `${row.randomOpening.description}，门票${row.randomOpening.ticket}，单局输赢${row.randomOpening.winLoss}`
    : `${row.detail}，${row.bonus.rate > 0 ? `胜局加成${row.bonus.label}` : '无胜局加成'}`;

  return {
    id: `coin-${row.id}`,
    kind: 'coin',
    matchMode: getCoinRowMatchMode(rowId),
    moduleName: '铜钱场',
    label: `铜钱场-${row.title}`,
    entryTitle: '铜钱场',
    arenaTitle: row.title,
    tableLabel: `铜钱桌 ${tableSeed}`,
    detail: randomDetail,
    timeLabel: `${time.totalMinutes}分钟`,
    stepLabel: `前${time.openingMoveCount}步${time.openingStepSeconds}秒，之后${time.regularStepSeconds}秒`,
    ticketLabel,
    costLabel: ticketLabel,
    rewardLabel: row.randomOpening ? `单局输赢${row.randomOpening.winLoss}铜钱` : `底注${row.baseStakeLabel}${row.bonus.rate > 0 ? ` · 胜局加成${row.bonus.label}` : ''}`,
    settlementType: '铜钱',
    totalSeconds: time.totalMinutes * 60,
    regularStepSeconds: time.regularStepSeconds,
    openingStepSeconds: time.openingStepSeconds,
    openingMoveCount: time.openingMoveCount,
    resultMetricTitle: '铜钱变化',
    winDelta: formatSignedDelta(winAmount),
    lossDelta: formatSignedDelta(-lossAmount),
    progressTitle: `铜钱 ${admission.coinBalance}`,
    progressWinLabel: `余额 ${winBalance}`,
    progressLossLabel: `余额 ${lossBalance}`,
    progressWinPercent: toCoinBalancePercent(winBalance),
    progressLossPercent: toCoinBalancePercent(lossBalance),
    replayTags: ['铜钱场', row.title, `${time.totalMinutes}分钟`, '铜钱结算'],
    notes: [
      `准入：${row.admission.label}`,
      admission.canEnter ? '当前铜钱可进入该场次。' : admission.reliefPrompt?.message ?? '当前不满足准入条件。',
    ],
  };
}

export function createMinutePlaySession(
  mode: XiangqiMinuteArenaMode,
  tableSeed = 1,
): XiangqiPlaySession {
  const session = getMinuteArenaSession(mode);
  return {
    id: `minute-${session.mode}`,
    kind: 'minute',
    matchMode: minuteModeToMatchMode(session.mode),
    moduleName: session.entryTitle,
    label: `${session.title}场`,
    entryTitle: session.entryTitle,
    arenaTitle: session.title,
    tableLabel: `积分桌 ${tableSeed}`,
    detail: session.description,
    timeLabel: `${session.timeControl.totalMinutes}分钟`,
    stepLabel: `前${session.timeControl.openingMoveCount}步${session.timeControl.openingMoveSeconds}秒，之后${session.timeControl.moveSeconds}秒`,
    ticketLabel: session.ticket.label,
    costLabel: session.ticket.label,
    rewardLabel: '胜负影响积分与头衔',
    settlementType: '积分',
    totalSeconds: session.timeControl.totalMinutes * 60,
    regularStepSeconds: session.timeControl.moveSeconds,
    openingStepSeconds: session.timeControl.openingMoveSeconds,
    openingMoveCount: session.timeControl.openingMoveCount,
    resultMetricTitle: '积分变化',
    winDelta: '+12',
    lossDelta: '-12',
    progressTitle: '业余1级',
    progressWinLabel: '54/100',
    progressLossLabel: '30/100',
    progressWinPercent: 54,
    progressLossPercent: 30,
    replayTags: [session.entryTitle, session.title, `${session.timeControl.totalMinutes}分钟`, '积分结算'],
    notes: [...session.scoringTips],
  };
}

export function createRatingPlaySession(tableSeed = 1): XiangqiPlaySession {
  const config = xiangqiRatingConfig;
  const time = config.timeControl;
  const winResult = getRatingResult(true, config);
  const lossResult = getRatingResult(false, config);

  return {
    id: config.id,
    kind: 'rating',
    matchMode: 'rating',
    moduleName: config.title,
    label: config.title,
    entryTitle: config.title,
    arenaTitle: config.arenaTitle,
    tableLabel: `评测桌 ${tableSeed}`,
    detail: config.description,
    timeLabel: `${time.totalMinutes}分钟`,
    stepLabel: `前${time.openingMoveCount}步${time.openingStepSeconds}秒，之后${time.stepSeconds}秒`,
    ticketLabel: config.entryResource,
    costLabel: config.entryResource,
    rewardLabel: '结算评测分与能力维度',
    settlementType: config.settlementType,
    totalSeconds: time.totalMinutes * 60,
    regularStepSeconds: time.stepSeconds,
    openingStepSeconds: time.openingStepSeconds,
    openingMoveCount: time.openingMoveCount,
    resultMetricTitle: '评测分变化',
    winDelta: winResult.scoreLabel.replace('评测分', ''),
    lossDelta: lossResult.scoreLabel.replace('评测分', ''),
    progressTitle: config.currentTitle,
    progressWinLabel: winResult.progressLabel,
    progressLossLabel: lossResult.progressLabel,
    progressWinPercent: winResult.progressPercent,
    progressLossPercent: lossResult.progressPercent,
    replayTags: getRatingReplayTags(config),
    notes: getRatingSessionRows(config).map((row) => `${row.title}：${row.detail}`),
    resultRows: winResult.rows,
    replayRows: getRatingSessionRows(config).map((row) => ({ title: row.title, detail: row.detail })),
  };
}

export function createHuashanPlaySession(
  mode: XiangqiHuashanMode = 'pass',
  tableSeed = 1,
): XiangqiPlaySession {
  const modeConfig = getHuashanMode(mode);
  const time = modeConfig.timeControl;
  const winRows = getHuashanResultRows(true, mode);
  const lossRows = getHuashanResultRows(false, mode);
  const winRank = winRows.find((row) => row.title === '赛季排名')?.detail ?? `第${xiangqiHuashanConfig.rank}名`;
  const lossRank = lossRows.find((row) => row.title === '赛季排名')?.detail ?? `第${xiangqiHuashanConfig.rank}名`;

  return {
    id: `huashan-${mode}`,
    kind: 'huashan',
    matchMode: 'huashan',
    moduleName: xiangqiHuashanConfig.title,
    label: `${xiangqiHuashanConfig.title}-${modeConfig.title}`,
    entryTitle: xiangqiHuashanConfig.title,
    arenaTitle: modeConfig.title,
    tableLabel: `华山台 ${tableSeed}`,
    detail: modeConfig.description,
    timeLabel: `${time.totalMinutes}分钟`,
    stepLabel: `前${time.openingMoveCount}步${time.openingStepSeconds}秒，之后${time.regularStepSeconds}秒`,
    ticketLabel: '本地活动券',
    costLabel: '本地活动券',
    rewardLabel: '赛季排名、连胜和胜率变化',
    settlementType: '活动成绩',
    totalSeconds: time.totalMinutes * 60,
    regularStepSeconds: time.regularStepSeconds,
    openingStepSeconds: time.openingStepSeconds,
    openingMoveCount: time.openingMoveCount,
    resultMetricTitle: '活动积分变化',
    winDelta: '+26',
    lossDelta: '-18',
    progressTitle: `${xiangqiHuashanConfig.seasonLabel} · ${modeConfig.title}`,
    progressWinLabel: winRank,
    progressLossLabel: lossRank,
    progressWinPercent: 72,
    progressLossPercent: 48,
    replayTags: [xiangqiHuashanConfig.title, modeConfig.title, xiangqiHuashanConfig.seasonLabel, '活动结算'],
    notes: [...xiangqiHuashanConfig.rules],
    resultRows: winRows,
    replayRows: [
      { title: '赛季', detail: `${xiangqiHuashanConfig.seasonLabel} · ${xiangqiHuashanConfig.countdown}` },
      { title: '赛制', detail: modeConfig.title },
      { title: '过关进度', detail: xiangqiHuashanConfig.passProgress },
      { title: '奖励', detail: xiangqiHuashanConfig.rewards.join(' / ') },
    ],
  };
}

export function createFriendPlaySession(
  mode: XiangqiFriendRoomMode = 'ten-minute',
  tableSeed = 1,
  room: XiangqiFriendRoom = createFriendRoom(mode, tableSeed),
): XiangqiPlaySession {
  const time = room.timeControl;
  return {
    id: room.id,
    kind: 'friend',
    matchMode: 'friend',
    moduleName: '好友对战',
    label: room.title,
    entryTitle: '好友对战',
    arenaTitle: room.title,
    tableLabel: `${room.clubNo} · ${room.tableNo}`,
    detail: room.inviteText,
    timeLabel: `${time.totalMinutes}分钟`,
    stepLabel: `前${time.openingMoveCount}步${time.openingStepSeconds}秒，之后${time.regularStepSeconds}秒`,
    ticketLabel: '免费',
    costLabel: '免费',
    rewardLabel: '好友局默认不计分，不扣铜钱',
    settlementType: '好友局',
    totalSeconds: time.totalMinutes * 60,
    regularStepSeconds: time.regularStepSeconds,
    openingStepSeconds: time.openingStepSeconds,
    openingMoveCount: time.openingMoveCount,
    resultMetricTitle: '好友局',
    winDelta: '不计分',
    lossDelta: '不计分',
    progressTitle: '本地房间',
    progressWinLabel: '已保存棋谱',
    progressLossLabel: '已保存棋谱',
    progressWinPercent: 100,
    progressLossPercent: 100,
    replayTags: ['好友对战', room.title, room.clubNo, room.tableNo],
    notes: getFriendRoomRows(room).map((row) => `${row.title}：${row.detail}`),
    resultRows: getFriendRoomRows(room),
    replayRows: getFriendRoomRows(room),
  };
}

export function createGenericPlaySession(
  matchMode: XiangqiPlayMatchMode,
  label: string,
  totalSeconds: number,
  stepLabel: string,
): XiangqiPlaySession {
  return {
    id: `generic-${matchMode}`,
    kind: 'generic',
    matchMode,
    moduleName: '本地练习',
    label,
    entryTitle: label,
    arenaTitle: label,
    tableLabel: '本地桌 1',
    detail: '本地人机练习',
    timeLabel: `${Math.round(totalSeconds / 60)}分钟`,
    stepLabel,
    ticketLabel: '免费',
    costLabel: '免费',
    rewardLabel: '练习局',
    settlementType: '练习',
    totalSeconds,
    regularStepSeconds: 90,
    openingStepSeconds: 30,
    openingMoveCount: 3,
    resultMetricTitle: '本局积分',
    winDelta: '+10',
    lossDelta: '-10',
    progressTitle: '业余1级',
    progressWinLabel: '42/100',
    progressLossLabel: '30/100',
    progressWinPercent: 58,
    progressLossPercent: 42,
    replayTags: ['本地练习', label, '练习结算'],
    notes: ['本地练习不连接真实匹配或支付。'],
  };
}

export function getPlaySessionResultSummary(
  session: XiangqiPlaySession,
  didWin: boolean,
): XiangqiPlayResultSummary {
  const resultRows = session.kind === 'rating'
    ? getRatingResult(didWin).rows
    : session.kind === 'huashan'
      ? getHuashanResultRows(didWin, session.id.endsWith('summit') ? 'summit' : 'pass')
      : session.resultRows ?? [];

  return {
    metricTitle: session.resultMetricTitle,
    delta: didWin ? session.winDelta : session.lossDelta,
    progressTitle: session.progressTitle,
    progressLabel: didWin ? session.progressWinLabel : session.progressLossLabel,
    progressPercent: didWin ? session.progressWinPercent : session.progressLossPercent,
    rows: [
      { title: '模块', detail: session.moduleName },
      { title: '场次', detail: session.arenaTitle },
      { title: '桌号', detail: session.tableLabel },
      { title: '门票', detail: session.ticketLabel },
      { title: '结算类型', detail: session.settlementType },
      { title: '结算', detail: session.rewardLabel },
      ...resultRows,
    ],
  };
}

export function getPlaySessionReplayRows(session: XiangqiPlaySession): Array<{ title: string; detail: string }> {
  return [
    { title: '模块', detail: session.moduleName },
    { title: '场次', detail: session.arenaTitle },
    { title: '局时', detail: session.timeLabel },
    { title: '步时', detail: session.stepLabel },
    { title: '门票', detail: session.ticketLabel },
    { title: '结算类型', detail: session.settlementType },
    { title: '结算', detail: session.rewardLabel },
    ...(session.replayRows ?? []),
  ];
}

export function getCoinRowMatchMode(rowId: XiangqiCoinArenaRowId): XiangqiPlayMatchMode {
  if (rowId === 'random') return 'coinRandom';
  if (rowId.startsWith('five-')) return 'fast5';
  if (rowId === 'twenty-primary') return 'slow20';
  return 'standard10';
}

export function minuteModeToMatchMode(mode: XiangqiMinuteArenaMode): XiangqiPlayMatchMode {
  if (mode === 'five-minute') return 'fast5';
  if (mode === 'twenty-minute') return 'slow20';
  return 'standard10';
}

function getCoinTimeControl(rowId: XiangqiCoinArenaRowId) {
  if (rowId === 'random') {
    return {
      totalMinutes: coinArenaRandomOpening.totalMinutes,
      regularStepSeconds: coinArenaRandomOpening.moveSeconds,
      openingStepSeconds: coinArenaRandomOpening.openingMoveSeconds,
      openingMoveCount: coinArenaRandomOpening.openingMoveCount,
    };
  }

  const totalMinutes = rowId.startsWith('five-') ? 5 : rowId === 'twenty-primary' ? 20 : 10;
  return {
    totalMinutes,
    regularStepSeconds: 60,
    openingStepSeconds: 30,
    openingMoveCount: 3,
  };
}

function formatSignedDelta(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function toPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

function toCoinBalancePercent(balance: number): number {
  return Math.max(0, Math.min(100, Math.round(balance / 100)));
}
