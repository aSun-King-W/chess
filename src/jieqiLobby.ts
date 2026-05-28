export type JieqiFeatureEntryId =
  | 'rating'
  | 'normal'
  | 'middle'
  | 'expert'
  | 'elite'
  | 'friend'
  | 'records'
  | 'daily-benefits'
  | 'events'
  | 'ad-time'
  | 'shop';

export type JieqiFeatureActionType = 'start-jieqi' | 'open-guide' | 'show-panel' | 'disabled';
export type JieqiFeatureCategory = 'match' | 'social' | 'archive' | 'benefit' | 'commerce';

export type JieqiMatchConfig = {
  timeControl: string;
  totalMinutes: number;
  moveSeconds: number;
  openingMoveSeconds: number;
  openingMoveCount: number;
  ticket?: number;
};

export type JieqiFeatureEntry = {
  id: JieqiFeatureEntryId;
  title: string;
  description: string;
  cta: string;
  actionType: JieqiFeatureActionType;
  category: JieqiFeatureCategory;
  detail?: string;
  online?: number;
  baseStake?: number;
  wealthRange?: string;
  bonusRate?: number;
  rewardHint?: string;
  entryLimit?: string;
  matchConfig?: JieqiMatchConfig;
  ruleCalloutIds: JieqiRuleCalloutId[];
};

export type JieqiFeatureAction = {
  entryId: JieqiFeatureEntryId;
  type: JieqiFeatureActionType;
  title: string;
  description: string;
  cta: string;
  disabledReason?: string;
  paymentRequired: false;
  payload: {
    panel: 'jieqi-match' | 'jieqi-guide' | 'jieqi-records' | 'jieqi-benefit' | 'jieqi-shop';
    baseStake?: number;
    wealthRange?: string;
    matchConfig?: JieqiMatchConfig;
  };
};

export type JieqiFeatureDockItem = {
  id: Extract<JieqiFeatureEntryId, 'daily-benefits' | 'events' | 'ad-time' | 'shop'>;
  label: string;
  badge?: string;
  entryId: JieqiFeatureEntryId;
};

export type JieqiRuleCalloutId =
  | 'hidden-reveal'
  | 'random-hidden-setup'
  | 'captured-hidden-invisible'
  | 'revealed-advisor-elephant-cross-river'
  | 'six-round-chase-check-ban'
  | 'forty-round-no-capture-draw'
  | 'fivefold-repetition-draw'
  | 'loss-conditions'
  | 'resign-draw-after-seven-rounds';

export type JieqiRuleCallout = {
  id: JieqiRuleCalloutId;
  title: string;
  body: string;
};

const commonMatchRules: JieqiRuleCalloutId[] = [
  'hidden-reveal',
  'random-hidden-setup',
  'captured-hidden-invisible',
  'revealed-advisor-elephant-cross-river',
  'six-round-chase-check-ban',
  'forty-round-no-capture-draw',
  'fivefold-repetition-draw',
  'loss-conditions',
  'resign-draw-after-seven-rounds',
];

export const jieqiRuleCallouts: JieqiRuleCallout[] = [
  {
    id: 'hidden-reveal',
    title: '暗子翻明',
    body: '暗子未移动前只显示背面，第一步按所在位置的象棋规则行走，走完后翻明为真实棋种；明子之后按真实棋种继续行棋。',
  },
  {
    id: 'random-hidden-setup',
    title: '随机暗子摆子',
    body: '开局保留帅/将等明子，其余暗子身份随机分配到各自合法初始暗子位，双方在走子前看不到未揭示身份。',
  },
  {
    id: 'captured-hidden-invisible',
    title: '被吃暗子不可见',
    body: '未翻明的暗子若被吃掉，不向对手展示真实身份，只在结算和棋谱内部保留必要记录。',
  },
  {
    id: 'revealed-advisor-elephant-cross-river',
    title: '士象过河',
    body: '暗子揭开后的士、象按揭棋规则可过河，突破标准象棋中士不出九宫、象不过河的限制。',
  },
  {
    id: 'six-round-chase-check-ban',
    title: '长将长捉禁着',
    body: '连续长将或长捉达到 6 回合时，系统判定当前循环手段为禁着，需要改走其他合法着法。',
  },
  {
    id: 'forty-round-no-capture-draw',
    title: '40 回合无吃子判和',
    body: '双方连续 40 回合没有产生吃子时，对局自动判和。',
  },
  {
    id: 'fivefold-repetition-draw',
    title: '局面重复 5 次判和',
    body: '同一局面重复出现 5 次时，对局自动判和。',
  },
  {
    id: 'loss-conditions',
    title: '负局条件',
    body: '绝杀、困毙、超时、强退、认输均判负，结算入口需要展示对应失败原因。',
  },
  {
    id: 'resign-draw-after-seven-rounds',
    title: '7 回合后议和认输',
    body: '开局未满 7 回合时不能认输或求和，达到 7 回合后才开放认输和求和操作。',
  },
];

export const jieqiFeatureEntries: JieqiFeatureEntry[] = [
  {
    id: 'rating',
    title: '揭棋评测',
    description: '匹配棋力相当的对手，输赢结算揭棋棋力分。',
    cta: '开始评测',
    actionType: 'start-jieqi',
    category: 'match',
    detail: '门票 2000，棋力分结算',
    online: 6394,
    rewardHint: '胜负影响揭棋棋力分',
    entryLimit: '需支付对局门票 2000；开始后可取消匹配',
    matchConfig: {
      timeControl: '10 分钟局时 / 60 秒步时 / 前 3 步 30 秒',
      totalMinutes: 10,
      moveSeconds: 60,
      openingMoveSeconds: 30,
      openingMoveCount: 3,
      ticket: 2000,
    },
    ruleCalloutIds: commonMatchRules,
  },
  {
    id: 'normal',
    title: '普通场',
    description: '适合揭棋入门和日常对弈的基础金币场。',
    cta: '进入普通场',
    actionType: 'start-jieqi',
    category: 'match',
    detail: '底注 4500',
    online: 12109,
    baseStake: 4500,
    wealthRange: '6000--20万',
    rewardHint: '按底注 4500 结算，适用普通场倍率',
    entryLimit: '财富 6000 至 20万可入场',
    ruleCalloutIds: commonMatchRules,
  },
  {
    id: 'middle',
    title: '中级场',
    description: '更高底注的揭棋进阶场，结算奖励带场次加成。',
    cta: '进入中级场',
    actionType: 'start-jieqi',
    category: 'match',
    detail: '底注 1.5万',
    online: 779,
    baseStake: 15000,
    wealthRange: '2万--80万',
    bonusRate: 15,
    rewardHint: '奖励加成 +15%',
    entryLimit: '财富 2万 至 80万可入场',
    ruleCalloutIds: commonMatchRules,
  },
  {
    id: 'expert',
    title: '高手场',
    description: '面向高财富玩家的揭棋高阶场。',
    cta: '进入高手场',
    actionType: 'start-jieqi',
    category: 'match',
    detail: '底注 5万',
    online: 130,
    baseStake: 50000,
    wealthRange: '6万以上',
    bonusRate: 30,
    rewardHint: '奖励加成 +30%',
    entryLimit: '财富 6万以上可入场',
    ruleCalloutIds: commonMatchRules,
  },
  {
    id: 'elite',
    title: '精英场',
    description: '揭棋精英玩家的高底注场次。',
    cta: '进入精英场',
    actionType: 'start-jieqi',
    category: 'match',
    detail: '底注 30万',
    online: 0,
    baseStake: 300000,
    wealthRange: '35万以上',
    bonusRate: 30,
    rewardHint: '奖励加成 +30%',
    entryLimit: '财富 35万以上可入场',
    ruleCalloutIds: commonMatchRules,
  },
  {
    id: 'friend',
    title: '好友对战',
    description: '邀请关注棋友或通过分享链接发起揭棋约战。',
    cta: '发起邀请',
    actionType: 'open-guide',
    category: 'social',
    online: 650,
    rewardHint: '好友局不直接触发金币支付',
    entryLimit: '需选择对局时长后创建邀请',
    ruleCalloutIds: commonMatchRules,
  },
  {
    id: 'records',
    title: '我的棋谱',
    description: '查看最近对局、我的收藏以及高手揭棋棋谱。',
    cta: '查看棋谱',
    actionType: 'show-panel',
    category: 'archive',
    detail: '最近对局、我的收藏、顶级高手棋谱',
    ruleCalloutIds: ['hidden-reveal', 'captured-hidden-invisible', 'loss-conditions'],
  },
  {
    id: 'daily-benefits',
    title: '每日福利',
    description: '领取签到、任务和揭棋相关补给。',
    cta: '查看福利',
    actionType: 'show-panel',
    category: 'benefit',
    rewardHint: '展示可领取状态，不在模型中发放资产',
    ruleCalloutIds: ['resign-draw-after-seven-rounds'],
  },
  {
    id: 'events',
    title: '活动中心',
    description: '展示揭棋活动、赛季任务和限时奖励入口。',
    cta: '查看活动',
    actionType: 'show-panel',
    category: 'benefit',
    rewardHint: '仅打开活动面板，奖励由活动系统结算',
    ruleCalloutIds: ['loss-conditions'],
  },
  {
    id: 'ad-time',
    title: '广告时间',
    description: '进入广告奖励说明或播放前置面板。',
    cta: '查看奖励',
    actionType: 'show-panel',
    category: 'benefit',
    rewardHint: '只展示广告奖励说明，不直接发放奖励',
    ruleCalloutIds: [],
  },
  {
    id: 'shop',
    title: '商城',
    description: '浏览揭棋可用道具、装扮和补给。',
    cta: '浏览商城',
    actionType: 'show-panel',
    category: 'commerce',
    rewardHint: '商城入口只打开浏览面板，不直接支付或下单',
    ruleCalloutIds: [],
  },
];

export const jieqiFeatureDockItems: JieqiFeatureDockItem[] = [
  { id: 'daily-benefits', label: '每日福利', badge: '2', entryId: 'daily-benefits' },
  { id: 'events', label: '活动中心', entryId: 'events' },
  { id: 'ad-time', label: '广告时间', entryId: 'ad-time' },
  { id: 'shop', label: '商城', entryId: 'shop' },
];

export function getJieqiFeatureAction(entryId: JieqiFeatureEntryId): JieqiFeatureAction {
  const entry = getJieqiFeatureEntry(entryId);
  return {
    entryId,
    type: entry.actionType,
    title: entry.title,
    description: entry.description,
    cta: entry.cta,
    disabledReason: entry.actionType === 'disabled' ? `${entry.title}暂未开放` : undefined,
    paymentRequired: false,
    payload: {
      panel: getActionPanel(entry),
      baseStake: entry.baseStake,
      wealthRange: entry.wealthRange,
      matchConfig: entry.matchConfig,
    },
  };
}

export function getJieqiRuleCallouts(entryId: JieqiFeatureEntryId): JieqiRuleCallout[] {
  const entry = getJieqiFeatureEntry(entryId);
  return entry.ruleCalloutIds.map((id) => {
    const callout = jieqiRuleCallouts.find((item) => item.id === id);
    if (!callout) throw new Error(`Unknown Jieqi rule callout: ${id}`);
    return callout;
  });
}

export function getJieqiFeatureEntry(entryId: JieqiFeatureEntryId): JieqiFeatureEntry {
  const entry = jieqiFeatureEntries.find((item) => item.id === entryId);
  if (!entry) throw new Error(`Unknown Jieqi feature entry: ${entryId}`);
  return entry;
}

function getActionPanel(entry: JieqiFeatureEntry): JieqiFeatureAction['payload']['panel'] {
  if (entry.category === 'match') return 'jieqi-match';
  if (entry.category === 'social') return 'jieqi-guide';
  if (entry.category === 'archive') return 'jieqi-records';
  if (entry.category === 'commerce') return 'jieqi-shop';
  return 'jieqi-benefit';
}
