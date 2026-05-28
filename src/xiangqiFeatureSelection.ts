import {
  defaultCoinArenaWallet,
  getCoinArenaRows,
  getCoinArenaSession,
} from './xiangqiCoinArena.js';
import type {
  XiangqiCoinArenaRowId,
  XiangqiCoinArenaWallet,
} from './xiangqiCoinArena.js';
import {
  getMinuteArenaRows,
} from './xiangqiMinuteArena.js';
import type {
  XiangqiMinuteArenaMode,
} from './xiangqiMinuteArena.js';

export type XiangqiSelectableTarget = 'coin-arena' | 'minute-arena' | 'puzzle';

export type XiangqiCoinArenaSelectionCard = {
  id: XiangqiCoinArenaRowId;
  title: string;
  detail: string;
  baseStakeLabel: string;
  admissionLabel: string;
  onlineLabel: string;
  bonusLabel: string;
  selected: boolean;
  disabled: boolean;
  target: Extract<XiangqiSelectableTarget, 'coin-arena' | 'puzzle'>;
  primaryLabel: string;
  coinBalance: number;
  disabledReason?: 'coin-shortage' | 'above-limit';
  reliefMessage?: string;
};

export type XiangqiCoinArenaSelection = {
  kind: 'coin-arena-selection';
  selectedCardId: XiangqiCoinArenaRowId;
  wallet: XiangqiCoinArenaWallet;
  cards: XiangqiCoinArenaSelectionCard[];
};

export type BuildCoinArenaSelectionOptions = {
  selectedRowId?: XiangqiCoinArenaRowId;
  wallet?: XiangqiCoinArenaWallet;
};

export type XiangqiMinuteArenaSelectionCard = {
  id: XiangqiMinuteArenaMode;
  title: string;
  onlineLabel: string;
  selected: boolean;
  badge?: '已选';
  target: Extract<XiangqiSelectableTarget, 'minute-arena'>;
  primaryLabel: string;
};

export type XiangqiMinuteArenaSelection = {
  kind: 'minute-arena-selection';
  selectedMode: XiangqiMinuteArenaMode;
  cards: XiangqiMinuteArenaSelectionCard[];
};

export type BuildMinuteArenaSelectionOptions = {
  selectedMode?: XiangqiMinuteArenaMode;
};

export function buildCoinArenaSelection(
  options: BuildCoinArenaSelectionOptions = {},
): XiangqiCoinArenaSelection {
  const wallet = options.wallet ?? defaultCoinArenaWallet;
  const selectedCardId = options.selectedRowId ?? 'random';
  const cards = getCoinArenaRows().map((row): XiangqiCoinArenaSelectionCard => {
    const session = getCoinArenaSession(row.id, wallet);
    const target = row.id === 'endgame-coin' ? 'puzzle' : 'coin-arena';

    return {
      id: row.id,
      title: row.title,
      detail: row.detail,
      baseStakeLabel: row.baseStakeLabel,
      admissionLabel: row.admission.label,
      onlineLabel: row.onlineLabel,
      bonusLabel: row.bonus.label,
      selected: row.id === selectedCardId,
      disabled: !session.canEnter,
      target,
      primaryLabel: target === 'puzzle' ? '进入残局' : `进入${row.title}`,
      coinBalance: session.coinBalance,
      disabledReason: session.blockedReason,
      reliefMessage: session.reliefPrompt?.message,
    };
  });

  return {
    kind: 'coin-arena-selection',
    selectedCardId,
    wallet: { ...wallet },
    cards,
  };
}

export function buildMinuteArenaSelection(
  options: BuildMinuteArenaSelectionOptions = {},
): XiangqiMinuteArenaSelection {
  const selectedMode = options.selectedMode ?? 'five-minute';
  const cards = getMinuteArenaRows().map((row): XiangqiMinuteArenaSelectionCard => ({
    id: row.mode,
    title: row.title,
    onlineLabel: row.onlineLabel,
    selected: row.mode === selectedMode,
    badge: row.mode === selectedMode ? '已选' : undefined,
    target: 'minute-arena',
    primaryLabel: `开始${row.title}`,
  }));

  return {
    kind: 'minute-arena-selection',
    selectedMode,
    cards,
  };
}
