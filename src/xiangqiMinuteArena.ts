export type XiangqiMinuteArenaMode = 'five-minute' | 'ten-minute' | 'twenty-minute';

export type XiangqiMinuteArenaActionId = 'switch-table' | 'start';

export type XiangqiMinuteArenaTimeControl = {
  totalMinutes: 5 | 10 | 20;
  moveSeconds: 60;
  openingMoveCount: 3;
  openingMoveSeconds: 30;
  label: string;
};

export type XiangqiMinuteArenaTicket = {
  amount: 2500;
  currency: '铜钱';
  label: string;
};

export type XiangqiMinuteArenaAction = {
  id: XiangqiMinuteArenaActionId;
  label: string;
};

export type XiangqiMinuteArenaRow = {
  mode: XiangqiMinuteArenaMode;
  title: string;
  online: number;
  onlineLabel: string;
};

export type XiangqiMinuteArenaSession = {
  mode: XiangqiMinuteArenaMode;
  entryTitle: typeof XIANGQI_MINUTE_ARENA_TITLE;
  title: string;
  description: string;
  timeControl: XiangqiMinuteArenaTimeControl;
  ticket: XiangqiMinuteArenaTicket;
  actions: readonly XiangqiMinuteArenaAction[];
  scoringTips: readonly string[];
};

export type XiangqiMinuteArena = XiangqiMinuteArenaRow & XiangqiMinuteArenaSession;

export const XIANGQI_MINUTE_ARENA_TITLE = '积分场';

export const XIANGQI_MINUTE_ARENA_TICKET: XiangqiMinuteArenaTicket = {
  amount: 2500,
  currency: '铜钱',
  label: '门票 2500 铜钱',
};

export const XIANGQI_MINUTE_ARENA_ACTIONS: readonly XiangqiMinuteArenaAction[] = [
  { id: 'switch-table', label: '换桌' },
  { id: 'start', label: '开始' },
];

export const XIANGQI_MINUTE_ARENA_SCORING_TIPS: readonly string[] = [
  '胜负会影响积分，并同步影响头衔成长或回落。',
  '匹配成功后逃跑或超时按违规处理并扣分。',
  '和局时先手方扣分，后手方按积分规则结算。',
];

const minuteArenaConfigs: readonly XiangqiMinuteArena[] = [
  makeMinuteArena({
    mode: 'five-minute',
    title: '五分钟',
    totalMinutes: 5,
    online: 18934,
    description: '五分钟积分场节奏紧凑，适合快速匹配并完成有效局。',
  }),
  makeMinuteArena({
    mode: 'ten-minute',
    title: '十分钟',
    totalMinutes: 10,
    online: 12680,
    description: '十分钟积分场兼顾思考和速度，适合作为标准积分对局。',
  }),
  makeMinuteArena({
    mode: 'twenty-minute',
    title: '二十分钟',
    totalMinutes: 20,
    online: 4362,
    description: '二十分钟积分场适合长考慢棋，完整检验布局、中局和残局。',
  }),
];

export function getMinuteArenaRows(): XiangqiMinuteArenaRow[] {
  return minuteArenaConfigs.map(({ mode, title, online, onlineLabel }) => ({
    mode,
    title,
    online,
    onlineLabel,
  }));
}

export function getMinuteArenaSession(mode: XiangqiMinuteArenaMode): XiangqiMinuteArenaSession {
  const arena = getMinuteArenaByMode(mode);
  return {
    mode: arena.mode,
    entryTitle: arena.entryTitle,
    title: arena.title,
    description: arena.description,
    timeControl: arena.timeControl,
    ticket: arena.ticket,
    actions: arena.actions,
    scoringTips: arena.scoringTips,
  };
}

export function getMinuteArenaByMode(mode: XiangqiMinuteArenaMode): XiangqiMinuteArena {
  const arena = minuteArenaConfigs.find((item) => item.mode === mode);
  if (!arena) throw new Error(`Unknown minute arena mode: ${mode}`);
  return arena;
}

function makeMinuteArena(config: {
  mode: XiangqiMinuteArenaMode;
  title: string;
  totalMinutes: 5 | 10 | 20;
  online: number;
  description: string;
}): XiangqiMinuteArena {
  const timeControl: XiangqiMinuteArenaTimeControl = {
    totalMinutes: config.totalMinutes,
    moveSeconds: 60,
    openingMoveCount: 3,
    openingMoveSeconds: 30,
    label: `局时 ${config.totalMinutes} 分钟 / 步时 1 分钟 / 前 3 步 30 秒`,
  };

  return {
    mode: config.mode,
    entryTitle: XIANGQI_MINUTE_ARENA_TITLE,
    title: config.title,
    online: config.online,
    onlineLabel: `${config.online} 人在线`,
    description: `${config.description} ${timeControl.label}，${XIANGQI_MINUTE_ARENA_TICKET.label}。`,
    timeControl,
    ticket: XIANGQI_MINUTE_ARENA_TICKET,
    actions: XIANGQI_MINUTE_ARENA_ACTIONS,
    scoringTips: XIANGQI_MINUTE_ARENA_SCORING_TIPS,
  };
}
