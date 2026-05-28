export type XiangqiFeatureActionType =
  | 'start-match'
  | 'open-puzzle'
  | 'show-panel'
  | 'open-guide'
  | 'disabled';

export type XiangqiFeatureEntryId =
  | 'rank-certification'
  | 'endgame'
  | 'skill-evaluation'
  | 'coin-arena'
  | 'huashan'
  | 'ranked-5'
  | 'ranked-10'
  | 'ranked-20'
  | 'friend-match'
  | 'ai-match'
  | 'my-records'
  | 'tournament'
  | 'daily-benefits'
  | 'activity-center'
  | 'ad-time'
  | 'shop';

export type XiangqiFeatureGroup = 'competitive' | 'practice' | 'social' | 'profile' | 'service';

export type XiangqiFeatureEntry = {
  id: XiangqiFeatureEntryId;
  title: string;
  description: string;
  group: XiangqiFeatureGroup;
  badge?: string;
};

export type XiangqiFeatureDockItem = {
  id: XiangqiFeatureEntryId;
  title: string;
  group: XiangqiFeatureGroup;
  badge?: string;
};

export type XiangqiMatchConfig = {
  mode: 'rank-certification' | 'coin-arena' | 'huashan' | 'ranked' | 'friend' | 'ai';
  minutes?: 5 | 10 | 20;
  rated: boolean;
  titleEligible: boolean;
  requiresEffectiveGame: boolean;
};

export type XiangqiFeatureAction = {
  type: XiangqiFeatureActionType;
  title: string;
  description: string;
  cta: string;
  ruleTips: string[];
  riskTips: string[];
  match?: XiangqiMatchConfig;
  panelKey?: string;
  guideKey?: string;
};

export type XiangqiHelpTopic = {
  entryId: XiangqiFeatureEntryId;
  title: string;
  paragraphs: string[];
  ruleTips: string[];
  riskTips: string[];
};

export const XIANGQI_FRIEND_MATCH_GUIDE =
  '方法一进入对应棋种（象棋、揭棋、翻翻棋）点击好友对战、选择对局时长、邀请关注棋友或 QQ/微信好友链接；方法二约定棋社号和桌号。';

export const xiangqiFeatureEntries: XiangqiFeatureEntry[] = [
  {
    id: 'rank-certification',
    title: '棋力认证赛',
    description: '通过有效对局认证当前棋力，结果用于后续匹配和头衔展示。',
    group: 'competitive',
    badge: '认证',
  },
  {
    id: 'endgame',
    title: '残局',
    description: '进入残局训练，按解法步骤练习杀法、守和和变招。',
    group: 'practice',
  },
  {
    id: 'skill-evaluation',
    title: '棋力评测',
    description: '结合对局表现、局面胜率和失误质量生成棋力报告。',
    group: 'practice',
    badge: '评测',
  },
  {
    id: 'coin-arena',
    title: '铜钱场',
    description: '使用铜钱参与的匹配场，展示入场条件和结算风险。',
    group: 'competitive',
  },
  {
    id: 'huashan',
    title: '华山论剑',
    description: '赛季挑战入口，按连胜、胜率和有效局争夺排名奖励。',
    group: 'competitive',
    badge: '赛季',
  },
  {
    id: 'ranked-5',
    title: '5分钟场',
    description: '快棋积分场，适合快速完成有效对局并刷新积分。',
    group: 'competitive',
  },
  {
    id: 'ranked-10',
    title: '10分钟场',
    description: '标准积分场，兼顾思考时间、积分和头衔成长。',
    group: 'competitive',
  },
  {
    id: 'ranked-20',
    title: '20分钟场',
    description: '慢棋积分场，适合长考对局和高质量棋力评估。',
    group: 'competitive',
  },
  {
    id: 'friend-match',
    title: '好友对战',
    description: XIANGQI_FRIEND_MATCH_GUIDE,
    group: 'social',
  },
  {
    id: 'ai-match',
    title: '人机对战',
    description: '选择电脑棋力进行练习，可用于熟悉规则和布局。',
    group: 'practice',
  },
  {
    id: 'my-records',
    title: '我的棋谱',
    description: '查看最近对局、收藏棋谱和复盘记录。',
    group: 'profile',
  },
  {
    id: 'tournament',
    title: '象棋赛事入口',
    description: '查看可报名赛事、赛程、轮次和参赛规则。',
    group: 'competitive',
  },
  {
    id: 'daily-benefits',
    title: '每日福利',
    description: '查看签到、任务和可领取奖励，不自动代领或消费。',
    group: 'service',
  },
  {
    id: 'activity-center',
    title: '活动中心',
    description: '查看限时活动说明和参与条件，跳转前先展示规则。',
    group: 'service',
  },
  {
    id: 'ad-time',
    title: '广告时间',
    description: '展示广告奖励规则和观看限制，由宿主确认后再进入广告流程。',
    group: 'service',
  },
  {
    id: 'shop',
    title: '商城',
    description: '展示商品和权益说明；模块只提供引导，不直接触发支付。',
    group: 'service',
  },
];

export const xiangqiFeatureDockItems: XiangqiFeatureDockItem[] = xiangqiFeatureEntries.map(
  ({ id, title, group, badge }) => ({ id, title, group, badge }),
);

const commonCompetitiveTips = [
  '对局需达到有效局条件后才计入积分、棋力或活动进度。',
  '局中逃跑、恶意超时或异常断线可能按负局处理并扣分。',
  '判和、长将长捉提示和强制变招由规则层统一处理。',
];

const evaluationTips = [
  '评测关注开局、中局、残局表现，以及漏着、送子和将杀把握。',
  '系统会结合棋力评测结果给出更合适的对手和训练建议。',
  '强制变招提示会标出重复进攻或违规循环风险，帮助完成有效分析。',
];

const titleTips = [
  '5/10/20 分钟场均为积分场，胜负和有效和局会影响积分。',
  '积分达到段位要求后可更新头衔展示。',
  '匹配成功后退出、逃跑或超时会产生扣分风险。',
];

const actions: Record<XiangqiFeatureEntryId, XiangqiFeatureAction> = {
  'rank-certification': {
    type: 'start-match',
    title: '开始棋力认证赛',
    description: '匹配认证对手，完成有效局后写入棋力档案。',
    cta: '开始认证',
    ruleTips: ['认证赛按有效局结算棋力。', ...commonCompetitiveTips],
    riskTips: ['匹配后中途退出可能导致认证失败并按负局记录。'],
    match: {
      mode: 'rank-certification',
      rated: true,
      titleEligible: true,
      requiresEffectiveGame: true,
    },
  },
  endgame: {
    type: 'open-puzzle',
    title: '进入残局训练',
    description: '打开残局题库，提供提示、复盘和守和训练。',
    cta: '开始练习',
    ruleTips: ['残局会复用象棋规则层校验合法走子、将军、困毙和判和。'],
    riskTips: ['训练不影响积分和头衔。'],
    panelKey: 'endgame-puzzles',
  },
  'skill-evaluation': {
    type: 'show-panel',
    title: '查看棋力评测',
    description: '生成棋力维度面板，解释优势、短板、失误质量和建议训练方向。',
    cta: '查看评测',
    ruleTips: evaluationTips,
    riskTips: ['评测结果仅作为匹配和训练参考，不直接扣分。'],
    panelKey: 'skill-evaluation',
  },
  'coin-arena': {
    type: 'start-match',
    title: '进入铜钱场匹配',
    description: '展示铜钱场入场条件后开始匹配，结算时更新铜钱变化。',
    cta: '进入铜钱场',
    ruleTips: ['铜钱场仍遵循有效局、判和和强制变招规则。', ...commonCompetitiveTips],
    riskTips: ['逃跑、超时或异常退出可能按负局结算铜钱。'],
    match: {
      mode: 'coin-arena',
      rated: false,
      titleEligible: false,
      requiresEffectiveGame: true,
    },
  },
  huashan: {
    type: 'start-match',
    title: '参加华山论剑',
    description: '进入赛季挑战匹配，按有效局、连胜和胜率更新榜单。',
    cta: '挑战华山',
    ruleTips: [
      '华山论剑按赛季规则统计有效局、连胜、胜率和排名。',
      '判和会按赛事规则计入结果，长将长捉会触发强制变招提示。',
      '棋力评测可作为分组和推荐对手的参考。',
    ],
    riskTips: ['匹配成功后逃跑或恶意超时会影响榜单成绩并可能扣分。'],
    match: {
      mode: 'huashan',
      rated: true,
      titleEligible: true,
      requiresEffectiveGame: true,
    },
  },
  'ranked-5': rankedAction(5),
  'ranked-10': rankedAction(10),
  'ranked-20': rankedAction(20),
  'friend-match': {
    type: 'open-guide',
    title: '发起好友对战',
    description: XIANGQI_FRIEND_MATCH_GUIDE,
    cta: '查看邀请方式',
    ruleTips: [
      XIANGQI_FRIEND_MATCH_GUIDE,
      '好友对战可按双方选择的时长创建房间，棋社号和桌号用于线下约局接入。',
    ],
    riskTips: ['好友房默认不直接进入付费或扣分流程，是否计分由宿主房间配置决定。'],
    guideKey: 'friend-match',
    match: {
      mode: 'friend',
      rated: false,
      titleEligible: false,
      requiresEffectiveGame: false,
    },
  },
  'ai-match': {
    type: 'start-match',
    title: '开始人机对战',
    description: '创建本地练习局，使用电脑着法陪练布局和残局。',
    cta: '挑战电脑',
    ruleTips: ['人机对战复用合法走子、将军、将死、困毙和判和规则。'],
    riskTips: ['人机练习不计积分，不影响头衔。'],
    match: {
      mode: 'ai',
      rated: false,
      titleEligible: false,
      requiresEffectiveGame: false,
    },
  },
  'my-records': {
    type: 'show-panel',
    title: '打开我的棋谱',
    description: '展示最近对局、收藏棋谱和复盘入口。',
    cta: '查看棋谱',
    ruleTips: ['棋谱可展示判和、强制变招提示、胜负原因和关键评测节点。'],
    riskTips: ['查看棋谱不会改变积分或账户资产。'],
    panelKey: 'my-records',
  },
  tournament: {
    type: 'open-guide',
    title: '查看象棋赛事',
    description: '打开赛事报名和赛程说明，由赛事系统处理报名状态。',
    cta: '查看赛事',
    ruleTips: ['赛事入口需展示赛制、有效局条件、判和规则和违规处理。'],
    riskTips: ['报名费、退赛或奖励发放规则需由赛事页二次确认。'],
    guideKey: 'tournament',
  },
  'daily-benefits': {
    type: 'open-guide',
    title: '查看每日福利',
    description: '展示签到、任务和奖励说明，不在本模块内自动领取。',
    cta: '查看福利',
    ruleTips: ['任务进度应以有效局、训练完成或活动规则为准。'],
    riskTips: ['涉及资产变动时必须由宿主福利页确认。'],
    guideKey: 'daily-benefits',
  },
  'activity-center': {
    type: 'open-guide',
    title: '打开活动中心',
    description: '展示活动列表、时间和参与条件。',
    cta: '查看活动',
    ruleTips: ['活动对局需明确是否计入有效局、积分和头衔。'],
    riskTips: ['奖励、报名或消耗类活动必须进入活动页确认。'],
    guideKey: 'activity-center',
  },
  'ad-time': {
    type: 'disabled',
    title: '广告时间待宿主接入',
    description: '本模块只返回广告入口说明，不能直接拉起广告或发放奖励。',
    cta: '查看规则',
    ruleTips: ['广告观看次数、冷却时间和奖励发放由宿主广告系统控制。'],
    riskTips: ['不得绕过宿主确认直接触发广告、奖励或资产变化。'],
    guideKey: 'ad-time',
  },
  shop: {
    type: 'disabled',
    title: '商城待宿主接入',
    description: '本模块只展示商城引导信息，不创建订单、不扣费、不拉起支付。',
    cta: '查看说明',
    ruleTips: ['商品价格、权益、库存和支付状态由商城系统提供。'],
    riskTips: ['禁止从象棋模块直接触发支付或消耗资产。'],
    guideKey: 'shop',
  },
};

export function getXiangqiFeatureAction(entryId: XiangqiFeatureEntryId): XiangqiFeatureAction {
  return actions[entryId];
}

export function getXiangqiHelpTopic(entryId: XiangqiFeatureEntryId): XiangqiHelpTopic {
  const entry = getXiangqiFeatureEntry(entryId);
  const action = getXiangqiFeatureAction(entryId);
  return {
    entryId,
    title: action.title || entry.title,
    paragraphs: [entry.description, action.description],
    ruleTips: action.ruleTips,
    riskTips: action.riskTips,
  };
}

export function getXiangqiFeatureEntry(entryId: XiangqiFeatureEntryId): XiangqiFeatureEntry {
  const entry = xiangqiFeatureEntries.find((item) => item.id === entryId);
  if (!entry) throw new Error(`Unknown xiangqi feature entry: ${entryId}`);
  return entry;
}

function rankedAction(minutes: 5 | 10 | 20): XiangqiFeatureAction {
  return {
    type: 'start-match',
    title: `进入${minutes}分钟场`,
    description: `${minutes}分钟积分场会匹配相近棋力玩家，完成有效局后结算积分和头衔进度。`,
    cta: `开始${minutes}分钟场`,
    ruleTips: titleTips,
    riskTips: ['匹配后有效局才计入积分；逃跑、超时或异常退出可能扣分。'],
    match: {
      mode: 'ranked',
      minutes,
      rated: true,
      titleEligible: true,
      requiresEffectiveGame: true,
    },
  };
}
