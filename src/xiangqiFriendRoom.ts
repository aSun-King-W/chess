import type { GameResult } from './game.js';
import type { XiangqiPlaySession } from './xiangqiPlaySession.js';

export type XiangqiFriendRoomMode = 'five-minute' | 'ten-minute' | 'twenty-minute';
export type XiangqiFriendRoomDuration = 5 | 10 | 20;
export type XiangqiFriendRoomResult = 'red-win' | 'black-win' | 'draw';
export type XiangqiFriendRoomSide = 'red' | 'black';
export type XiangqiFriendRoomArchiveModule = '好友对战';
export type XiangqiFriendRoomArchiveResult = '胜' | '负' | '和';

export type XiangqiFriendRoomTimeControl = {
  totalMinutes: number;
  totalSeconds: number;
  moveSeconds: number;
  regularStepSeconds: number;
  openingStepSeconds: number;
  openingMoveCount: number;
  openingMoveSeconds: number;
  label: string;
  stepLabel: string;
};

export type XiangqiFriendRoomModeConfig = {
  id: XiangqiFriendRoomMode;
  title: string;
  timeControl: XiangqiFriendRoomTimeControl;
};

export type XiangqiFriendRoom = {
  id: string;
  moduleName: '好友对战';
  clubNo: string;
  tableNo: string;
  mode: XiangqiFriendRoomMode;
  duration: XiangqiFriendRoomDuration;
  title: string;
  inviteText: string;
  invite: {
    title: string;
    message: string;
    copyText: string;
    placeholder: string;
  };
  safetyTips: Array<{ id: string; text: string }>;
  timeControl: XiangqiFriendRoomTimeControl;
  settlementType: '非计分';
  settlementLabel: string;
  replayTags: string[];
};

export type XiangqiKifuRecord = {
  id: string;
  title: string;
  moduleName: string;
  arenaTitle: string;
  resultLabel: string;
  opponentName: string;
  opponentRank: string;
  moveCount: number;
  createdAt: string;
  favorite: boolean;
  replayTags: string[];
  result: GameResult | null;
  session: XiangqiPlaySession;
};

export type XiangqiFriendRoomSettlement = {
  result: XiangqiFriendRoomResult;
  winnerLabel: string;
  settlementType: '非计分';
  scoreDelta: 0;
  coinDelta: 0;
  titleDelta: '无变化';
  summary: string;
  rows: Array<{ title: string; detail: string }>;
};

export type XiangqiFriendRoomArchiveInput = {
  room: XiangqiFriendRoom;
  result: XiangqiFriendRoomResult;
  selfSide: XiangqiFriendRoomSide;
  moves: string[];
  startedAt: string;
  endedAt: string;
  opponentName: string;
  note?: string;
};

export type XiangqiFriendRoomArchiveRecord = {
  id: string;
  module: XiangqiFriendRoomArchiveModule;
  title: string;
  result: XiangqiFriendRoomArchiveResult;
  rawResult: XiangqiFriendRoomResult;
  selfSide: XiangqiFriendRoomSide;
  opponentName: string;
  tableNo: string;
  clubNo: string;
  duration: XiangqiFriendRoomDuration;
  startedAt: string;
  endedAt: string;
  moves: string[];
  moveCount: number;
  tags: string[];
  favorite: boolean;
  settlementType: '非计分';
  note?: string;
};

export type XiangqiFriendRoomArchiveFilter = {
  module?: XiangqiFriendRoomArchiveModule | '全部';
  result?: XiangqiFriendRoomArchiveResult | '全部';
  duration?: XiangqiFriendRoomDuration | '全部';
  favoriteOnly?: boolean;
  opponentKeyword?: string;
};

export type XiangqiFriendRoomReviewInfo = {
  recordId: string;
  title: string;
  module: XiangqiFriendRoomArchiveModule;
  tableNo: string;
  clubNo: string;
  selfSide: XiangqiFriendRoomSide;
  opponentName: string;
  result: XiangqiFriendRoomArchiveResult;
  moves: string[];
  tags: string[];
};

export const XIANGQI_FRIEND_ROOM_DURATIONS: XiangqiFriendRoomDuration[] = [5, 10, 20];

export const friendRoomModes: XiangqiFriendRoomModeConfig[] = [
  { id: 'five-minute', title: '5分钟', timeControl: createFriendRoomTimeControl(5) },
  { id: 'ten-minute', title: '10分钟', timeControl: createFriendRoomTimeControl(10) },
  { id: 'twenty-minute', title: '20分钟', timeControl: createFriendRoomTimeControl(20) },
];

export function getFriendRoomMode(mode: XiangqiFriendRoomMode): XiangqiFriendRoomModeConfig {
  const found = friendRoomModes.find((item) => item.id === mode);
  if (!found) throw new Error(`Unknown friend room mode: ${mode}`);
  return { ...found, timeControl: { ...found.timeControl } };
}

export function createFriendRoom(mode: XiangqiFriendRoomMode, seed?: number): XiangqiFriendRoom;
export function createFriendRoom(duration?: XiangqiFriendRoomDuration, seed?: number): XiangqiFriendRoom;
export function createFriendRoom(
  modeOrDuration: XiangqiFriendRoomMode | XiangqiFriendRoomDuration = 'ten-minute',
  seed = 1,
): XiangqiFriendRoom {
  const mode = typeof modeOrDuration === 'number'
    ? durationToMode(modeOrDuration)
    : modeOrDuration;
  const config = getFriendRoomMode(mode);
  const duration = config.timeControl.totalMinutes as XiangqiFriendRoomDuration;
  const tableNo = formatRoomCode('T', seed, duration);
  const clubNo = formatRoomCode('C', seed + 17, duration);

  return {
    id: `friend-room-${mode}-${tableNo}`,
    moduleName: '好友对战',
    clubNo,
    tableNo,
    mode,
    duration,
    title: `${config.title}好友房`,
    inviteText: `邀请好友加入桌号 ${tableNo}，棋社号 ${clubNo}；本地版只展示安全提示。`,
    invite: {
      title: '邀请好友',
      message: `我在好友对战 ${tableNo} 等你，棋社号 ${clubNo}。`,
      copyText: `好友对战｜桌号 ${tableNo}｜棋社号 ${clubNo}｜${duration}分钟`,
      placeholder: '邀请链接占位：主线程接入真实分享能力',
    },
    safetyTips: [
      { id: 'known-friend', text: '仅和认识的好友分享桌号或棋社号。' },
      { id: 'local-only', text: '本地好友房不校验真实账号关系，勿在聊天中透露敏感信息。' },
      { id: 'non-scoring', text: '好友对战为非计分局，不影响积分、棋力分或铜钱。' },
    ],
    timeControl: { ...config.timeControl },
    settlementType: '非计分',
    settlementLabel: '胜负仅生成棋谱记录，不改变积分、棋力分或铜钱。',
    replayTags: ['好友对战', `${duration}分钟`, '非计分'],
  };
}

export function getFriendRoomRows(room: XiangqiFriendRoom): Array<{ title: string; detail: string }> {
  return [
    { title: '棋社号', detail: room.clubNo },
    { title: '桌号', detail: room.tableNo },
    { title: '局时', detail: room.timeControl.label },
    { title: '步时', detail: room.timeControl.stepLabel },
    { title: '邀请', detail: room.inviteText },
    { title: '结算', detail: room.settlementLabel },
  ];
}

export function createFriendRoomSettlement(
  room: XiangqiFriendRoom,
  result: XiangqiFriendRoomResult,
): XiangqiFriendRoomSettlement {
  const winnerLabel = result === 'draw' ? '双方和棋' : result === 'red-win' ? '红方胜' : '黑方胜';

  return {
    result,
    winnerLabel,
    settlementType: '非计分',
    scoreDelta: 0,
    coinDelta: 0,
    titleDelta: '无变化',
    summary: `${winnerLabel}，本局为非计分好友对战。`,
    rows: [
      { title: '模块', detail: room.moduleName },
      { title: '桌号', detail: room.tableNo },
      { title: '棋社号', detail: room.clubNo },
      { title: '局时', detail: room.timeControl.label },
      { title: '结算类型', detail: '非计分' },
      { title: '结算', detail: room.settlementLabel },
    ],
  };
}

export function createKifuRecord(input: {
  result: GameResult | null;
  session: XiangqiPlaySession;
  opponent: { name: string; rank: string };
  favorite?: boolean;
  createdAt?: string;
}): XiangqiKifuRecord {
  const resultLabel = input.result
    ? `${input.result.winner === 'red' ? '我方胜' : '对方胜'} · ${input.result.reason}`
    : '未完成';
  const createdAt = input.createdAt ?? new Date().toISOString();

  return {
    id: `${input.session.id}-${createdAt}`,
    title: `${input.session.label}棋谱`,
    moduleName: input.session.moduleName,
    arenaTitle: input.session.arenaTitle,
    resultLabel,
    opponentName: input.opponent.name,
    opponentRank: input.opponent.rank,
    moveCount: input.result?.moves.length ?? 0,
    createdAt,
    favorite: input.favorite ?? false,
    replayTags: input.session.replayTags,
    result: input.result,
    session: input.session,
  };
}

export function filterKifuRecords(records: XiangqiKifuRecord[], moduleName: string | 'all'): XiangqiKifuRecord[] {
  if (moduleName === 'all') return records;
  return records.filter((record) => record.moduleName === moduleName);
}

export function toggleKifuFavorite(records: XiangqiKifuRecord[], recordId: string): XiangqiKifuRecord[] {
  return records.map((record) => (
    record.id === recordId ? { ...record, favorite: !record.favorite } : record
  ));
}

export function createFriendRoomArchiveRecord(
  input: XiangqiFriendRoomArchiveInput,
): XiangqiFriendRoomArchiveRecord {
  const result = toArchiveResult(input.result, input.selfSide);

  return {
    id: [
      'friend',
      input.room.tableNo,
      input.startedAt.replace(/[^0-9A-Za-z]/g, ''),
    ].join('-'),
    module: '好友对战',
    title: `${input.room.timeControl.label} 好友对战 vs ${input.opponentName}`,
    result,
    rawResult: input.result,
    selfSide: input.selfSide,
    opponentName: input.opponentName,
    tableNo: input.room.tableNo,
    clubNo: input.room.clubNo,
    duration: input.room.duration,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    moves: [...input.moves],
    moveCount: input.moves.length,
    tags: [...input.room.replayTags, result],
    favorite: false,
    settlementType: '非计分',
    note: input.note,
  };
}

export function filterFriendRoomArchiveRecords(
  records: XiangqiFriendRoomArchiveRecord[],
  filter: XiangqiFriendRoomArchiveFilter = {},
): XiangqiFriendRoomArchiveRecord[] {
  const keyword = filter.opponentKeyword?.trim().toLowerCase();

  return records.filter((record) => {
    if (filter.module && filter.module !== '全部' && record.module !== filter.module) return false;
    if (filter.result && filter.result !== '全部' && record.result !== filter.result) return false;
    if (filter.duration && filter.duration !== '全部' && record.duration !== filter.duration) return false;
    if (filter.favoriteOnly && !record.favorite) return false;
    if (keyword && !record.opponentName.toLowerCase().includes(keyword)) return false;
    return true;
  });
}

export function setFriendRoomArchiveFavorite(
  records: XiangqiFriendRoomArchiveRecord[],
  recordId: string,
  favorite: boolean,
): XiangqiFriendRoomArchiveRecord[] {
  return records.map((record) => (
    record.id === recordId ? { ...record, favorite } : record
  ));
}

export function toggleFriendRoomArchiveFavorite(
  records: XiangqiFriendRoomArchiveRecord[],
  recordId: string,
): XiangqiFriendRoomArchiveRecord[] {
  return records.map((record) => (
    record.id === recordId ? { ...record, favorite: !record.favorite } : record
  ));
}

export function getFriendRoomReviewInfo(
  record: XiangqiFriendRoomArchiveRecord,
): XiangqiFriendRoomReviewInfo {
  return {
    recordId: record.id,
    title: record.title,
    module: record.module,
    tableNo: record.tableNo,
    clubNo: record.clubNo,
    selfSide: record.selfSide,
    opponentName: record.opponentName,
    result: record.result,
    moves: [...record.moves],
    tags: [...record.tags],
  };
}

function createFriendRoomTimeControl(duration: XiangqiFriendRoomDuration): XiangqiFriendRoomTimeControl {
  return {
    totalMinutes: duration,
    totalSeconds: duration * 60,
    moveSeconds: 60,
    regularStepSeconds: 60,
    openingStepSeconds: 30,
    openingMoveCount: 3,
    openingMoveSeconds: 30,
    label: `${duration}分钟`,
    stepLabel: '前3步30秒，之后60秒',
  };
}

function durationToMode(duration: number): XiangqiFriendRoomMode {
  if (duration === 5) return 'five-minute';
  if (duration === 10) return 'ten-minute';
  if (duration === 20) return 'twenty-minute';
  throw new Error('好友房仅支持5/10/20分钟。');
}

function formatRoomCode(prefix: 'T' | 'C', seed: number, duration: XiangqiFriendRoomDuration): string {
  const normalizedSeed = Math.abs(Math.trunc(seed));
  const code = ((normalizedSeed * 97) + (duration * 131)) % 100000;
  return `${prefix}${String(code).padStart(5, '0')}`;
}

function toArchiveResult(
  result: XiangqiFriendRoomResult,
  selfSide: XiangqiFriendRoomSide,
): XiangqiFriendRoomArchiveResult {
  if (result === 'draw') return '和';
  const selfWon = (result === 'red-win' && selfSide === 'red') || (result === 'black-win' && selfSide === 'black');
  return selfWon ? '胜' : '负';
}
