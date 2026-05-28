export type XiangqiCoinArenaResourceId = 'gold' | 'silver';

export type XiangqiCoinArenaRowId =
  | 'random'
  | 'five-primary'
  | 'five-middle'
  | 'five-advanced'
  | 'ten-primary'
  | 'twenty-primary'
  | 'endgame-coin';

export type XiangqiCoinArenaBonus = {
  rate: number;
  label: string;
};

export type XiangqiCoinArenaAdmission = {
  min: number;
  max?: number;
  label: string;
};

export type XiangqiCoinArenaResource = {
  id: XiangqiCoinArenaResourceId;
  label: string;
  amount: number;
  tone: XiangqiCoinArenaResourceId;
};

export type XiangqiCoinArenaRandomOpening = {
  description: string;
  ticket: number;
  winLoss: number;
  totalMinutes: 8;
  moveSeconds: 60;
  openingMoveSeconds: 90;
  openingMoveCount: 3;
  timeControlLabel: string;
};

export type XiangqiCoinArenaRow = {
  id: XiangqiCoinArenaRowId;
  title: string;
  baseStake: number;
  baseStakeLabel: string;
  admission: XiangqiCoinArenaAdmission;
  onlineCount: number;
  onlineLabel: string;
  bonus: XiangqiCoinArenaBonus;
  detail: string;
  randomOpening?: XiangqiCoinArenaRandomOpening;
};

export type XiangqiCoinArenaWallet = {
  gold: number;
  silver: number;
};

export type XiangqiCoinArenaReliefPrompt = {
  type: 'coin-relief';
  title: string;
  message: string;
  actions: Array<{
    id: 'relief' | 'recharge-guide';
    label: string;
    opensPayment: false;
  }>;
  opensPayment: false;
};

export type XiangqiCoinArenaSession = {
  row: XiangqiCoinArenaRow;
  resources: XiangqiCoinArenaResource[];
  coinBalance: number;
  canEnter: boolean;
  paymentRequired: false;
  opensPayment: false;
  blockedReason?: 'coin-shortage' | 'above-limit';
  reliefPrompt?: XiangqiCoinArenaReliefPrompt;
};

export const defaultCoinArenaWallet: XiangqiCoinArenaWallet = {
  gold: 0,
  silver: 8330,
};

export const coinArenaRandomOpening: XiangqiCoinArenaRandomOpening = {
  description: '系统随机开局直接对弈',
  ticket: 1000,
  winLoss: 5000,
  totalMinutes: 8,
  moveSeconds: 60,
  openingMoveSeconds: 90,
  openingMoveCount: 3,
  timeControlLabel: '8分钟 / 60秒步时 / 前3步90秒',
};

const coinArenaRows: XiangqiCoinArenaRow[] = [
  {
    id: 'random',
    title: '随机场',
    baseStake: 5000,
    baseStakeLabel: '5000',
    admission: { min: 6000, label: '6000以上' },
    onlineCount: 18934,
    onlineLabel: '18934',
    bonus: { rate: 0, label: '无加成' },
    detail: '底注5000(6000以上)',
    randomOpening: coinArenaRandomOpening,
  },
  {
    id: 'five-primary',
    title: '5分钟-初级',
    baseStake: 4500,
    baseStakeLabel: '4500',
    admission: { min: 6000, max: 200000, label: '6000--20万' },
    onlineCount: 12480,
    onlineLabel: '12480',
    bonus: { rate: 0, label: '无加成' },
    detail: '底注4500(6000--20万)',
  },
  {
    id: 'five-middle',
    title: '5分钟-中级',
    baseStake: 20000,
    baseStakeLabel: '2万',
    admission: { min: 25000, max: 800000, label: '2.5万--80万' },
    onlineCount: 3216,
    onlineLabel: '3216',
    bonus: { rate: 15, label: '+15%' },
    detail: '底注2万(2.5万--80万)',
  },
  {
    id: 'five-advanced',
    title: '5分钟-高级',
    baseStake: 50000,
    baseStakeLabel: '5万',
    admission: { min: 60000, label: '6万以上' },
    onlineCount: 788,
    onlineLabel: '788',
    bonus: { rate: 30, label: '+30%' },
    detail: '底注5万(6万以上)',
  },
  {
    id: 'ten-primary',
    title: '10分钟-初级',
    baseStake: 4500,
    baseStakeLabel: '4500',
    admission: { min: 6000, label: '6000以上' },
    onlineCount: 5624,
    onlineLabel: '5624',
    bonus: { rate: 0, label: '无加成' },
    detail: '底注4500(6000以上)',
  },
  {
    id: 'twenty-primary',
    title: '20分钟-初级',
    baseStake: 4000,
    baseStakeLabel: '4000',
    admission: { min: 6000, label: '6000以上' },
    onlineCount: 1367,
    onlineLabel: '1367',
    bonus: { rate: 0, label: '无加成' },
    detail: '底注4000(6000以上)',
  },
  {
    id: 'endgame-coin',
    title: '残局-铜钱场',
    baseStake: 0,
    baseStakeLabel: '按题目',
    admission: { min: 6000, label: '6000以上' },
    onlineCount: 1907,
    onlineLabel: '1907',
    bonus: { rate: 0, label: '无加成' },
    detail: '解残局，赢铜钱!',
  },
];

export function getCoinArenaResources(
  wallet: XiangqiCoinArenaWallet = defaultCoinArenaWallet,
): XiangqiCoinArenaResource[] {
  return [
    { id: 'gold', label: '金色资源', amount: wallet.gold, tone: 'gold' },
    { id: 'silver', label: '银色资源', amount: wallet.silver, tone: 'silver' },
  ];
}

export function getCoinArenaRows(): XiangqiCoinArenaRow[] {
  return coinArenaRows.map(cloneCoinArenaRow);
}

export function getCoinArenaRow(rowId: XiangqiCoinArenaRowId): XiangqiCoinArenaRow {
  const row = coinArenaRows.find((item) => item.id === rowId);
  if (!row) throw new Error(`Unknown xiangqi coin arena row: ${rowId}`);
  return cloneCoinArenaRow(row);
}

export function getCoinArenaSession(
  rowId: XiangqiCoinArenaRowId = 'random',
  wallet: XiangqiCoinArenaWallet = defaultCoinArenaWallet,
): XiangqiCoinArenaSession {
  const row = getCoinArenaRow(rowId);
  const coinBalance = wallet.silver;
  const isShort = coinBalance < row.admission.min;
  const isAboveLimit = row.admission.max !== undefined && coinBalance > row.admission.max;

  return {
    row,
    resources: getCoinArenaResources(wallet),
    coinBalance,
    canEnter: !isShort && !isAboveLimit,
    paymentRequired: false,
    opensPayment: false,
    blockedReason: isShort ? 'coin-shortage' : isAboveLimit ? 'above-limit' : undefined,
    reliefPrompt: isShort ? createCoinReliefPrompt(row, coinBalance) : undefined,
  };
}

export function needsCoinRelief(
  coinBalanceOrWallet: number | XiangqiCoinArenaWallet,
  rowId: XiangqiCoinArenaRowId = 'random',
): boolean {
  const coinBalance =
    typeof coinBalanceOrWallet === 'number' ? coinBalanceOrWallet : coinBalanceOrWallet.silver;
  return coinBalance < getCoinArenaRow(rowId).admission.min;
}

function createCoinReliefPrompt(
  row: XiangqiCoinArenaRow,
  coinBalance: number,
): XiangqiCoinArenaReliefPrompt {
  return {
    type: 'coin-relief',
    title: '铜钱不足',
    message: `当前铜钱${coinBalance}，${row.title}准入需要${row.admission.label}。可先领取救济或查看充值提示，本地模块不会拉起支付。`,
    actions: [
      { id: 'relief', label: '领取救济', opensPayment: false },
      { id: 'recharge-guide', label: '充值提示', opensPayment: false },
    ],
    opensPayment: false,
  };
}

function cloneCoinArenaRow(row: XiangqiCoinArenaRow): XiangqiCoinArenaRow {
  return {
    ...row,
    admission: { ...row.admission },
    bonus: { ...row.bonus },
    randomOpening: row.randomOpening ? { ...row.randomOpening } : undefined,
  };
}
