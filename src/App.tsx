import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import {
  Bot,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coins,
  Compass,
  Eye,
  Flag,
  Flame,
  Gem,
  GraduationCap,
  Gift,
  HelpCircle,
  Home,
  House,
  LayoutGrid,
  Lightbulb,
  Medal,
  MessageCircle,
  Pause,
  PenLine,
  Play,
  RefreshCcw,
  RotateCcw,
  ScrollText,
  Settings,
  Share2,
  ShoppingBasket,
  SkipBack,
  SkipForward,
  Star,
  Swords,
  Trophy,
  UserRound,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  INITIAL_STEP_SECONDS,
  applyMove,
  buildReplayPieces,
  canUndoRound,
  chooseGobangMove,
  createGobangBoard,
  createInitialGame,
  findPiece,
  finishGame,
  getDefeatReason,
  getLegalMoves,
  getPieceAt,
  gobangSize,
  hasGobangWin,
  hasPoint,
  inBounds,
  isInCheck,
  opposite,
  placeStone,
  selectPiece,
  startingPieces,
  stepSecondsForMove,
  undoLastRound,
} from './game';
import type { EndReason, GameResult, GameState, Move, Piece, PieceKind, Position, Side } from './game';
import type { GobangDifficulty } from './game';
import { chooseComputerMove } from './xiangqiEngine';
import type { XiangqiAiDifficulty } from './xiangqiEngine';
import {
  chooseJieqiComputerMove,
  getJieqiLegalMoves,
  getJieqiPieceAt,
  toDisplayJieqiPieces,
} from './jieqi';
import type { JieqiPiece } from './jieqi';
import {
  applyPuzzleMove,
  createPuzzleSession,
  dailyPuzzle,
  getCampaignPuzzle,
  getPuzzleLegalMoves,
  getPuzzleById,
  resetPuzzleSession,
  revealPuzzleHint,
  tickPuzzleSession,
} from './puzzle';
import type { Puzzle, PuzzleSessionStatus } from './puzzle';
import {
  addXiangqiPuzzleComment,
  applyXiangqiPuzzleAttemptMove,
  buildXiangqiPuzzleSettlement,
  calculatePuzzleScore,
  createXiangqiPuzzleAttempt,
  createXiangqiPuzzleCommentPanel,
  getXiangqiPuzzleModuleStats,
  getXiangqiPuzzleIntroRows,
  getXiangqiPuzzleMenuActions,
  restartXiangqiPuzzleAttempt,
  revealXiangqiPuzzleHint,
  tickXiangqiPuzzleAttempt,
  undoXiangqiPuzzleAttemptStep,
} from './xiangqiPuzzle';
import type { XiangqiPuzzleAttempt, XiangqiPuzzleAttemptStatus } from './xiangqiPuzzle';
import {
  getPuzzleDashboardStats,
  getPuzzleFeatureAction,
  puzzleFeatureEntries,
  recordPuzzleAttempt,
  createPuzzleProgress,
} from './puzzleLobby';
import type { PuzzleFeatureEntry, PuzzleProgress } from './puzzleLobby';
import {
  getJieqiFeatureAction,
  getJieqiFeatureEntry,
  getJieqiRuleCallouts,
  jieqiFeatureDockItems,
} from './jieqiLobby';
import type { JieqiFeatureEntryId } from './jieqiLobby';
import {
  applyJieqiStateMove,
  createJieqiBoardState,
  getJieqiAdmission,
  getJieqiCaptureStats,
  getJieqiEntryRows,
  getJieqiPlaceholder,
  settleJieqiRating,
} from './xiangqiJieqi';
import type { JieqiBoardState, JieqiSettlement } from './xiangqiJieqi';
import {
  getXiangqiFeatureAction,
  xiangqiFeatureDockItems,
} from './xiangqiLobby';
import type { XiangqiFeatureEntryId, XiangqiFeatureAction } from './xiangqiLobby';
import {
  getCertificationHistoryBestNodes,
  getCertificationRuleSummary,
  getCertificationSessionRows,
  xiangqiCertificationConfig,
} from './xiangqiCertification';
import {
  coinArenaRandomOpening,
  defaultCoinArenaWallet,
  getCoinArenaResources,
  getCoinArenaSession,
} from './xiangqiCoinArena';
import type { XiangqiCoinArenaRowId } from './xiangqiCoinArena';
import { getMinuteArenaSession } from './xiangqiMinuteArena';
import type { XiangqiMinuteArenaMode } from './xiangqiMinuteArena';
import {
  createCertificationPlaySession,
  createCoinPlaySession,
  createFriendPlaySession,
  createGenericPlaySession,
  createHuashanPlaySession,
  createMinutePlaySession,
  createRatingPlaySession,
  getPlaySessionReplayRows,
  getPlaySessionResultSummary,
} from './xiangqiPlaySession';
import type { XiangqiPlaySession } from './xiangqiPlaySession';
import {
  buildCoinArenaSelection,
  buildMinuteArenaSelection,
} from './xiangqiFeatureSelection';
import {
  getRatingEntryRows,
  getRatingResult,
  getRatingSessionRows,
  xiangqiRatingConfig,
} from './xiangqiRating';
import {
  getHuashanEventRows,
  getHuashanModes,
  getHuashanSafePlaceholder,
  xiangqiHuashanConfig,
} from './xiangqiHuashan';
import type { XiangqiHuashanMode } from './xiangqiHuashan';
import {
  createFriendRoom,
  createKifuRecord,
  filterKifuRecords,
  friendRoomModes,
  getFriendRoomRows,
  toggleKifuFavorite,
} from './xiangqiFriendRoom';
import type { XiangqiFriendRoomMode, XiangqiKifuRecord } from './xiangqiFriendRoom';
import {
  canFlipChessPieceCapture,
  captureFlipChessPiece,
  chooseFlipChessOpening,
  createFlipChessGame,
  createFlipChessSettlement,
  flipFlipChessPiece,
  getFlipChessArenaRows,
  getFlipChessReplayRows,
  getFlipChessSafePlaceholder,
  getFlipChessTrophySidebar,
  moveFlipChessPiece,
  previewFlipChessOpening,
} from './xiangqiFlipChess';
import type {
  XiangqiFlipChessGameState,
  XiangqiFlipChessPiece,
  XiangqiFlipChessPieceKind,
  XiangqiFlipChessSide,
  XiangqiFlipChessSettlement,
} from './xiangqiFlipChess';
import comingSoonPoster from './assets/more-games/coming-soon.png';
import flipChessPoster from './assets/more-games/flip-chess.png';
import flipRulesGuide from './assets/more-games/flip-rules-guide.png';
import gobangPoster from './assets/more-games/gobang.png';
import jieqiIcon from './assets/mode-icons/jieqi.png';
import moreIcon from './assets/mode-icons/more.png';
import puzzleIcon from './assets/mode-icons/puzzle.png';
import rankedIcon from './assets/mode-icons/ranked.png';
import recentIcon from './assets/mode-icons/recent.png';
import xiangqiIcon from './assets/mode-icons/xiangqi.png';
import bronzeRankEmblem from './assets/ranked/rank-emblem-bronze.png';
import blackChePiece from './assets/pieces/generated/black-che.png';
import blackJiangPiece from './assets/pieces/generated/black-jiang.png';
import blackMaPiece from './assets/pieces/generated/black-ma.png';
import blackPaoPiece from './assets/pieces/generated/black-pao.png';
import blackShiPiece from './assets/pieces/generated/black-shi.png';
import blackXiangPiece from './assets/pieces/generated/black-xiang.png';
import blackZuPiece from './assets/pieces/generated/black-zu.png';
import jieqiBackPiece from './assets/pieces/generated/jieqi-back.png';
import redBingPiece from './assets/pieces/generated/red-bing.png';
import redChePiece from './assets/pieces/generated/red-che.png';
import redMaPiece from './assets/pieces/generated/red-ma.png';
import redPaoPiece from './assets/pieces/generated/red-pao.png';
import redShiPiece from './assets/pieces/generated/red-shi.png';
import redShuaiPiece from './assets/pieces/generated/red-shuai.png';
import redXiangPiece from './assets/pieces/generated/red-xiang.png';

type Route = 'home' | 'lobby' | 'jieqi' | 'puzzle' | 'more-game' | 'game' | 'result' | 'replay' | 'profile';
type Mode = 'xiangqi' | 'jieqi' | 'puzzle' | 'more' | 'ranked';
type BottomTab = 'play' | 'learn' | 'world' | 'discover' | 'me';
type MatchMode = 'certification' | 'rating' | 'training' | 'huashan' | 'coinRandom' | 'fast5' | 'standard10' | 'slow20' | 'friend';
type MoreGameKind = 'gobang' | 'flip';
type FlipOpeningStage = 'shining' | 'choice';
type RecentPlayRoute = Extract<Route, 'home' | 'lobby' | 'jieqi' | 'puzzle' | 'more-game'>;
type RecentPlay = {
  title: string;
  count: string;
  playedAt: string;
  mode: Mode;
  route: RecentPlayRoute;
  moreGame?: MoreGameKind;
  puzzleView?: PuzzleView;
};
type RecentPlayInput = Omit<RecentPlay, 'playedAt'>;
type GobangSnapshot = {
  board: number[][];
  status: string;
  lastMove: Position | null;
};
type FlipCaptureReveal = {
  id: number;
  attackerLabel: string;
  side: XiangqiFlipChessSide;
  label: string;
};
type FlipRivalAction = {
  state: XiangqiFlipChessGameState;
  reveal: FlipCaptureReveal | null;
};
type ConfirmAction = 'resign' | 'exit';
type PuzzleState = PuzzleSessionStatus | XiangqiPuzzleAttemptStatus;
type PuzzleView = 'campaign-map' | 'play';
type CampaignResultKind = 'success' | 'failure' | null;
type ChatTab = 'emoji' | 'log';
type SettingKey =
  | 'moveHints'
  | 'coordinates'
  | 'captureAnimation'
  | 'backgroundMusic'
  | 'sound'
  | 'messages'
  | 'autoVoice'
  | 'localVoice'
  | 'boardMarks';
type GameSettings = Record<SettingKey, boolean>;

const gobangDifficultyOptions: Array<{ id: GobangDifficulty; label: string; detail: string; rival: string }> = [
  { id: 'easy', label: '入门', detail: '会主动连子，但防守偶尔漏招。', rival: '白子 · 入门人机' },
  { id: 'normal', label: '标准', detail: '会找胜招、挡四，并重视活三活四。', rival: '白子 · 标准人机' },
  { id: 'hard', label: '高手', detail: '会额外预判你的下一手威胁。', rival: '白子 · 高手人机' },
];

const xiangqiAiDifficultyOptions: Array<{
  id: XiangqiAiDifficulty;
  label: string;
  detail: string;
  rival: string;
  badge: string;
}> = [
  { id: 'beginner', label: '入门', detail: '轻量本地 AI，适合刚熟悉走法和吃子价值。', rival: '入门人机', badge: '练手' },
  { id: 'advanced', label: '进阶', detail: '短时引擎思考，会处理常见将军和兑子。', rival: '进阶人机', badge: '推荐' },
  { id: 'expert', label: '高手', detail: '更长引擎思考，优先防送子和战术漏招。', rival: '高手人机', badge: '强引擎' },
];

function cloneGobangBoard(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

const recentPlayStorageKey = 'tiantian-xiangqi-recent-play';

function formatRecentPlayDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function defaultRecentPlay(): RecentPlay {
  return {
    title: '象棋-棋力认证',
    count: '190720',
    playedAt: formatRecentPlayDate(),
    mode: 'xiangqi',
    route: 'lobby',
  };
}

function isRecentPlay(value: unknown): value is RecentPlay {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<RecentPlay>;
  const modes: Mode[] = ['xiangqi', 'jieqi', 'puzzle', 'more', 'ranked'];
  const routes: RecentPlayRoute[] = ['home', 'lobby', 'jieqi', 'puzzle', 'more-game'];
  return (
    typeof item.title === 'string' &&
    typeof item.count === 'string' &&
    typeof item.playedAt === 'string' &&
    modes.includes(item.mode as Mode) &&
    routes.includes(item.route as RecentPlayRoute)
  );
}

function readRecentPlay(): RecentPlay {
  if (typeof window === 'undefined') return defaultRecentPlay();
  try {
    const stored = window.localStorage.getItem(recentPlayStorageKey);
    const parsed = stored ? JSON.parse(stored) : null;
    return isRecentPlay(parsed) ? parsed : defaultRecentPlay();
  } catch {
    return defaultRecentPlay();
  }
}
type ToastKind = 'info' | 'success' | 'warning';
type RankedMenu = 'game' | 'arena' | null;
type RulesDialogKind = 'xiangqi' | 'jieqi' | 'ranked';
type RuleSection = { title: string; items: string[] };
type FeatureDialogState =
  | { kind: 'xiangqi'; entryId: XiangqiFeatureEntryId }
  | { kind: 'jieqi'; entryId: JieqiFeatureEntryId }
  | { kind: 'puzzle'; entryId: string };
type RankedRankRow = {
  rank: string;
  score: string;
  seasonCarry: string;
  crossSeasonCarry: string;
};
type ToastState = {
  id: number;
  message: string;
  kind: ToastKind;
};
type PosterCardStyle = CSSProperties & { '--poster-image': string };
type IconComponent = typeof Home;
type MatchingState = {
  mode: MatchMode;
  label: string;
  session: XiangqiPlaySession;
};
type PieceImageMap = Record<Side, Record<PieceKind, string>>;
type LobbyMode = {
  id: MatchMode;
  label: string;
  tag: string;
  detail: string;
  timeLabel: string;
  stepLabel: string;
  cost: string;
  reward: string;
  entryNote: string;
  enabled: boolean;
  totalSeconds: number;
  regularStepSeconds?: number;
  openingStepSeconds?: number;
  openingMoveCount?: number;
  toast?: string;
};
type LobbyEntry = {
  id: string;
  title: string;
  count?: string;
  detail?: string;
  icon: IconComponent;
  tone: string;
  mode?: MatchMode;
  bonus?: string;
  toast?: string;
};
type RankedGameOption = {
  id: RankedGameId;
  label: string;
  baseScore: string;
  players: string;
};
type RankedArenaOption = {
  id: RankedArenaId;
  label: string;
  stake: string;
  players: string;
  bonus?: string;
};
type RankedGameId = 'xiangqi' | 'jieqi';
type RankedArenaId = 'fast5-basic' | 'fast5-mid' | 'fast5-high' | 'standard10-basic' | 'slow20-basic';
type RankedStartSelection = {
  game: RankedGameOption;
  arena: RankedArenaOption;
};
const BOARD_PADDING_PERCENT = 7;
const generatedPieceImages: PieceImageMap = {
  black: {
    rook: blackChePiece,
    horse: blackMaPiece,
    elephant: blackXiangPiece,
    advisor: blackShiPiece,
    king: blackJiangPiece,
    cannon: blackPaoPiece,
    pawn: blackZuPiece,
  },
  red: {
    rook: redChePiece,
    horse: redMaPiece,
    elephant: redXiangPiece,
    advisor: redShiPiece,
    king: redShuaiPiece,
    cannon: redPaoPiece,
    pawn: redBingPiece,
  },
};
const flipPieceKindMap: Record<XiangqiFlipChessPieceKind, PieceKind> = {
  general: 'king',
  advisor: 'advisor',
  elephant: 'elephant',
  horse: 'horse',
  rook: 'rook',
  cannon: 'cannon',
  pawn: 'pawn',
};

function chooseFlipOpeningPreviewCells(state: XiangqiFlipChessGameState, count = 4): string[] {
  const candidates = state.pieces.filter((piece) => !piece.captured).map((piece) => piece.cellId);
  const shuffled = [...candidates];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

function formatFlipSide(side: XiangqiFlipChessSide): string {
  return side === 'red' ? '红方' : '黑方';
}

function getOppositeFlipSide(side: XiangqiFlipChessSide): XiangqiFlipChessSide {
  return side === 'red' ? 'black' : 'red';
}

function getFlipAdjacentCells(state: XiangqiFlipChessGameState, cellId: string): string[] {
  const match = /^f(\d+)-(\d+)$/.exec(cellId);
  if (!match) return [];
  const row = Number(match[1]);
  const col = Number(match[2]);
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ]
    .filter(([nextRow, nextCol]) => (
      nextRow >= 0 && nextRow < state.board.rows && nextCol >= 0 && nextCol < state.board.cols
    ))
    .map(([nextRow, nextCol]) => `f${nextRow}-${nextCol}`);
}

function chooseFlipRivalAction(state: XiangqiFlipChessGameState): FlipRivalAction | null {
  if (state.phase !== 'playing' || !state.turnSide) return null;
  const activePieces = state.pieces.filter((piece) => !piece.captured);
  const ownPieces = activePieces.filter((piece) => piece.side === state.turnSide && !piece.hidden);
  const captures = ownPieces
    .flatMap((attacker) => (
      activePieces
        .filter((target) => target.id !== attacker.id && canFlipChessPieceCapture(state, attacker, target))
        .map((target) => ({ attacker, target }))
    ))
    .sort((a, b) => {
      if (a.target.side !== b.target.side) return a.target.side === state.turnSide ? 1 : -1;
      return b.target.damage - a.target.damage;
    });

  if (captures[0]) {
    const { attacker, target } = captures[0];
    return {
      state: captureFlipChessPiece(state, attacker.id, target.cellId),
      reveal: target.hidden
        ? { id: Date.now(), attackerLabel: attacker.label, side: target.side, label: target.label }
        : null,
    };
  }

  const hiddenPieces = activePieces.filter((piece) => piece.hidden);
  if (hiddenPieces[0]) {
    const target = hiddenPieces[Math.floor(Math.random() * hiddenPieces.length)];
    return { state: flipFlipChessPiece(state, target.cellId), reveal: null };
  }

  for (const piece of ownPieces) {
    const emptyTarget = getFlipAdjacentCells(state, piece.cellId)
      .find((cellId) => !activePieces.some((item) => item.cellId === cellId));
    if (emptyTarget) return { state: moveFlipChessPiece(state, piece.id, emptyTarget), reveal: null };
  }

  return null;
}

function formatFlipActionError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : '';
  if (!message) return fallback;
  if (message.includes('不能吃')) return message;
  if (message.includes('Hidden pieces')) return '暗子需要先翻开';
  if (message.includes('already revealed')) return '这枚棋子已经翻开';
  if (message.includes('It is')) return '还没轮到这个阵营';
  if (message.includes('occupied')) return '目标位置已有棋子';
  if (message.includes('Only adjacent')) return '只能移动到相邻空位';
  if (message.includes('No target')) return '目标位置没有棋子';
  if (message.includes('Unknown')) return '没有找到这枚棋子';
  return fallback;
}
const xiangqiRulesSections: RuleSection[] = [
  {
    title: '天天象棋棋规',
    items: [
      '简明易懂的亚洲规则，结合网络对局有所改进，以判和及提示强制变招两大原则。',
    ],
  },
  {
    title: '一、判和',
    items: [
      '双方无进攻子力自动判和。进攻子力指车、马、炮、卒。',
      '非将、非应将、非捉、非应捉时，局面重复 5 次自动判和。',
      '双方互相长将 6 次判和。',
      '双方互相长捉对方一子 6 次判和。',
      '双方无吃子着数达到 120 步（60 回合）自动判和。双方各自最多只累计 10 次将军；若一方最后一步形成绝杀或困毙局面，不判和。',
      '总步数达到 400 步（200 回合）自动判和；若一方最后一步形成绝杀或困毙局面，不判和。',
    ],
  },
  {
    title: '二、提示强制变招',
    items: [
      '一方一子或多子长捉一子只允许 6 回合。',
      '一方长将，一方长捉，长将方禁招。',
      '一方一子长将只允许 6 回合，两子只允许 12 回合，三子及以上只允许 18 回合；当将军过程中任何一方吃子后重新计算。',
      '一方一子连续将或捉交替进行只允许 12 回合，一子以上连续将或捉交替进行只允许 18 回合。',
    ],
  },
  {
    title: '棋力评测',
    items: [
      '国家公认的评测系统，每次会匹配水平接近的人对局。',
      '初始分为 -160。同等级胜 +10、平 +0、负 -10；低一等级胜 +15、平 +0、负 -5。',
      '等级路径：学1 → 学3 → 业1 → 业9。',
    ],
  },
  {
    title: '5/10/20 分钟场积分与头衔',
    items: [
      '不同积分对应相应等级称号，获得更多积分可以升到更高等级。点开个人资料可以查看积分和等级称号对应关系。',
      '积分采用 ELO 计算：积分低者赢积分高者时获得更多分数。',
      '出现和局时，先手玩家被扣分。',
      '匹配成功后，该棋局视为有效对局，逃跑会被扣除相应积分。',
    ],
  },
  {
    title: '华山论剑',
    items: [
      '华山论剑分为过关赛和山顶赛。过关赛通过 20 关的玩家，才有资格参与每晚 8 点的山顶赛。',
      '山顶赛开赛前 5 分钟上华山者即可参赛；开赛前 5 分钟之后上华山者安排第二天比赛。',
      '比赛结束后，所有获得参赛资格的玩家统一降到第 15 关。',
      '点开华山论剑顶部的“去观赛”按钮可查看详细规程及奖励。',
    ],
  },
  {
    title: '棋社',
    items: [
      '创建棋社成为社长，邀请好友加入棋社，一起下棋或组织线上比赛。',
      '也可以加入其他棋社，和广大棋友一起切磋棋艺。',
      '关于用棋社开展线上比赛的功能，可以进入棋社私人房的“棋社动态”查看。',
    ],
  },
  {
    title: '好友对战',
    items: [
      '方法一：进入对应的棋种（象棋、揭棋、翻翻棋），点击“好友对战”，选择对局时长，点击邀请好友，可以看到您关注的棋友，可向 ta 发起约战邀请。也可点击下方“QQ 好友或微信好友”按钮，发送 QQ 好友或微信好友链接，对方收到信息即可加入对局。',
      '方法二：可以和好友约定在某一个棋社，告诉他棋社号和桌号即可进入棋社开战。',
    ],
  },
];

const jieqiRulesSections: RuleSection[] = [
  {
    title: '一、明子暗子说明',
    items: ['反盖棋子不见字体的是暗子；揭开后可见字体的是明子。'],
  },
  {
    title: '二、摆子规则',
    items: ['红黑双方各 15 个暗子随机摆放在自己一边，将、帅放在原点。'],
  },
  {
    title: '三、暗子走子规则',
    items: [
      '对局时红方首先走子，暗子按其所在位置照中国象棋规则走出第一步。例如在兵位置上的第一步只能向前走一步。',
      '如果行动范围内有对方棋子，可以吃掉对方棋子，走子后的暗子会自动翻开为明子。',
      '己方暗子被吃后，自己不能看到暗子是什么棋；明子被吃则可见。',
    ],
  },
  {
    title: '四、明子走子规则',
    items: [
      '明子照中国象棋规则走子。',
      '揭开后的士、象可以过河。',
    ],
  },
  {
    title: '五、棋规',
    items: [
      '长捉：不能连续捉对方同一棋子超过 6 回合，6 回合后禁着。',
      '长将：同一棋子不能连续捉对方帅、将超过 6 回合，6 回合后禁着。',
      '空步判和：双方无吃子步数达到 40 回合，判和。',
      '局面累计重复 5 次自动判和。',
    ],
  },
  {
    title: '六、胜负判断',
    items: [
      '被绝杀或者困毙判负。',
      '超时、强退、认输判负。',
    ],
  },
  {
    title: '七、其他规则',
    items: ['认输、求和：7 回合后轮到自己下棋时才能操作。'],
  },
];

const rankedRulesSections: RuleSection[] = [
  {
    title: '一、玩法规则',
    items: [
      '排位赛玩法包括象棋铜钱场和揭棋铜钱场，每场对局结算铜钱与段位积分。',
      '段位积分结算 = 底分 + 胜局场次加成。底分：象棋场和揭棋场均为 100 分。',
      '胜局场次加成：高倍场胜局额外加成的积分比例越高。',
      '特殊规则：若对局双方存在段位等级差，则在段位积分结算基础上，低段位获胜多加 5 分，高段位获胜少加 5 分。',
    ],
  },
  {
    title: '二、赛季规则',
    items: [
      '赛季周期：每个赛季持续 2 个月，结束后自动开启新赛季。',
      '赛季升级：每场对局进行段位积分结算，累计段位积分可提升段位星数和等级。',
      '赛季奖励：赛季结束时，将按照本赛季达到过的最高段位发放奖励至邮件。',
      '赛季继承：每赛季开始时将继承上赛季的部分段位及星数，具体见段位表。',
    ],
  },
];

const rankedRankRows: RankedRankRow[] = [
  { rank: '青铜1星', score: '100', seasonCarry: '青铜1星', crossSeasonCarry: '青铜1星' },
  { rank: '青铜2星', score: '200', seasonCarry: '青铜2星', crossSeasonCarry: '青铜2星' },
  { rank: '青铜3星', score: '300', seasonCarry: '青铜3星', crossSeasonCarry: '青铜3星' },
  { rank: '白银1星', score: '500', seasonCarry: '白银1星', crossSeasonCarry: '白银1星' },
  { rank: '白银2星', score: '700', seasonCarry: '白银1星', crossSeasonCarry: '白银1星' },
  { rank: '白银3星', score: '1000', seasonCarry: '白银2星', crossSeasonCarry: '白银1星' },
  { rank: '黄金1星', score: '1400', seasonCarry: '白银2星', crossSeasonCarry: '白银1星' },
  { rank: '黄金2星', score: '1800', seasonCarry: '白银3星', crossSeasonCarry: '白银1星' },
  { rank: '黄金3星', score: '2200', seasonCarry: '黄金1星', crossSeasonCarry: '白银1星' },
  { rank: '黄金4星', score: '2600', seasonCarry: '黄金2星', crossSeasonCarry: '白银2星' },
  { rank: '铂金1星', score: '3000', seasonCarry: '黄金3星', crossSeasonCarry: '白银2星' },
  { rank: '铂金2星', score: '3500', seasonCarry: '黄金3星', crossSeasonCarry: '白银2星' },
  { rank: '铂金3星', score: '4000', seasonCarry: '黄金4星', crossSeasonCarry: '白银3星' },
  { rank: '铂金4星', score: '4500', seasonCarry: '黄金4星', crossSeasonCarry: '白银3星' },
  { rank: '钻石1星', score: '5000', seasonCarry: '铂金1星', crossSeasonCarry: '黄金1星' },
  { rank: '钻石2星', score: '6000', seasonCarry: '铂金1星', crossSeasonCarry: '黄金1星' },
  { rank: '钻石3星', score: '7000', seasonCarry: '铂金2星', crossSeasonCarry: '黄金1星' },
  { rank: '钻石4星', score: '8000', seasonCarry: '铂金3星', crossSeasonCarry: '黄金2星' },
  { rank: '钻石5星', score: '9000', seasonCarry: '铂金4星', crossSeasonCarry: '黄金2星' },
  { rank: '荣耀1星', score: '10000', seasonCarry: '钻石1星', crossSeasonCarry: '黄金2星' },
  { rank: '荣耀2星', score: '12000', seasonCarry: '钻石1星', crossSeasonCarry: '黄金3星' },
  { rank: '荣耀3星', score: '14000', seasonCarry: '钻石1星', crossSeasonCarry: '黄金3星' },
  { rank: '荣耀4星', score: '16000', seasonCarry: '钻石2星', crossSeasonCarry: '黄金3星' },
  { rank: '荣耀5星', score: '20000', seasonCarry: '钻石2星', crossSeasonCarry: '黄金3星' },
  { rank: '大师1星', score: '25000', seasonCarry: '钻石3星', crossSeasonCarry: '黄金4星' },
  { rank: '大师2星', score: '30000', seasonCarry: '钻石3星', crossSeasonCarry: '黄金4星' },
  { rank: '大师3星', score: '35000', seasonCarry: '钻石3星', crossSeasonCarry: '铂金1星' },
  { rank: '大师4星', score: '40000', seasonCarry: '钻石4星', crossSeasonCarry: '铂金1星' },
  { rank: '大师5星', score: '45000', seasonCarry: '钻石4星', crossSeasonCarry: '铂金1星' },
  { rank: '棋王1星', score: '55000', seasonCarry: '钻石5星', crossSeasonCarry: '铂金2星' },
  { rank: '棋王2星', score: '65000', seasonCarry: '钻石5星', crossSeasonCarry: '铂金2星' },
  { rank: '棋王3星', score: '75000', seasonCarry: '钻石5星', crossSeasonCarry: '铂金2星' },
  { rank: '棋王4星', score: '85000', seasonCarry: '钻石5星', crossSeasonCarry: '铂金2星' },
  { rank: '棋王5星', score: '100000', seasonCarry: '钻石5星', crossSeasonCarry: '铂金2星' },
  { rank: '棋王6星', score: '120000', seasonCarry: '钻石5星', crossSeasonCarry: '铂金2星' },
  { rank: '棋王7星', score: '140000', seasonCarry: '钻石5星', crossSeasonCarry: '铂金2星' },
  { rank: '棋王8星', score: '160000', seasonCarry: '钻石5星', crossSeasonCarry: '铂金2星' },
  { rank: '棋王9星', score: '180000', seasonCarry: '钻石5星', crossSeasonCarry: '铂金2星' },
  { rank: '棋王10星', score: '200000', seasonCarry: '钻石5星', crossSeasonCarry: '铂金2星' },
];
const modeItems: Array<{ id: Mode; label: string; hint: string; count: string; token: string; icon: string }> = [
  { id: 'xiangqi', label: '象棋', hint: '评测 对局 训练', count: '190720', token: '象', icon: xiangqiIcon },
  { id: 'jieqi', label: '揭棋', hint: '暗子翻开更刺激', count: '18987', token: '揭', icon: jieqiIcon },
  { id: 'puzzle', label: '残局', hint: '每日挑战', count: '8031', token: '闯', icon: puzzleIcon },
  { id: 'more', label: '更多玩法', hint: '翻翻棋 五子棋', count: '4488', token: '玩', icon: moreIcon },
  { id: 'ranked', label: '排位赛', hint: '赛季冲段', count: '33659', token: '排', icon: rankedIcon },
];

const rankedGameOptions: RankedGameOption[] = [
  { id: 'xiangqi', label: '象棋', baseScore: '段位底分: 100', players: '玩法人数: 19620' },
  { id: 'jieqi', label: '揭棋', baseScore: '段位底分: 100', players: '玩法人数: 13551' },
];

const rankedArenaOptions: RankedArenaOption[] = [
  { id: 'fast5-basic', label: '5分钟-初级', stake: '底注4500(6000--20万)', players: '11630' },
  { id: 'fast5-mid', label: '5分钟-中级', stake: '底注2万(2.5万--80万)', players: '472', bonus: '+15%' },
  { id: 'fast5-high', label: '5分钟-高级', stake: '底注5万(6万以上)', players: '79', bonus: '+30%' },
  { id: 'standard10-basic', label: '10分钟-初级', stake: '底注4500(6000以上)', players: '4376' },
  { id: 'slow20-basic', label: '20分钟-初级', stake: '底注4000(6000以上)', players: '1577' },
];

const bottomTabs: Array<{ id: BottomTab; label: string; icon: typeof Home }> = [
  { id: 'play', label: '下棋', icon: Home },
  { id: 'learn', label: '学棋', icon: GraduationCap },
  { id: 'world', label: '棋界', icon: Trophy },
  { id: 'discover', label: '发现', icon: Compass },
  { id: 'me', label: '我', icon: UserRound },
];

const matchModes: LobbyMode[] = [
  {
    id: 'certification',
    label: xiangqiCertificationConfig.title,
    tag: '积分',
    detail: '输赢仅计算棋力分',
    timeLabel: `${xiangqiCertificationConfig.timeControl.totalMinutes}分钟`,
    stepLabel: `前${xiangqiCertificationConfig.timeControl.openingMoveCount}步${xiangqiCertificationConfig.timeControl.openingStepSeconds}秒，之后${xiangqiCertificationConfig.timeControl.stepSeconds}秒`,
    cost: xiangqiCertificationConfig.entryResource,
    reward: '胜负结算棋力分',
    entryNote: '立即匹配',
    enabled: true,
    totalSeconds: xiangqiCertificationConfig.timeControl.totalMinutes * 60,
    regularStepSeconds: xiangqiCertificationConfig.timeControl.stepSeconds,
    openingStepSeconds: xiangqiCertificationConfig.timeControl.openingStepSeconds,
    openingMoveCount: xiangqiCertificationConfig.timeControl.openingMoveCount,
  },
  {
    id: 'rating',
    label: '棋力评测',
    tag: '评测',
    detail: '15分钟局时 · 前3回合30秒 · 后续90秒',
    timeLabel: '15分钟',
    stepLabel: '前3回合30秒，之后90秒',
    cost: '免费',
    reward: '胜利积分+10',
    entryNote: '进入评测',
    enabled: true,
    totalSeconds: 15 * 60,
  },
  {
    id: 'training',
    label: '训练场',
    tag: '人机',
    detail: '本地人机练习 · 不影响积分',
    timeLabel: '10分钟',
    stepLabel: '前3回合30秒，之后90秒',
    cost: '免费',
    reward: '熟练度+1',
    entryNote: '开始训练',
    enabled: true,
    totalSeconds: 10 * 60,
  },
  {
    id: 'huashan',
    label: '华山论剑',
    tag: '活动',
    detail: '活动场入口 · 每日限时开放',
    timeLabel: '活动局时',
    stepLabel: '按活动规则',
    cost: '本地活动券',
    reward: '赛季排名、连胜和胜率变化',
    entryNote: '挑战华山',
    enabled: true,
    totalSeconds: 15 * 60,
    toast: '活动暂未开放',
  },
  {
    id: 'coinRandom',
    label: '铜钱场-随机场',
    tag: '铜钱',
    detail: coinArenaRandomOpening.description,
    timeLabel: `${coinArenaRandomOpening.totalMinutes}分钟`,
    stepLabel: `前${coinArenaRandomOpening.openingMoveCount}步${coinArenaRandomOpening.openingMoveSeconds}秒，之后${coinArenaRandomOpening.moveSeconds}秒`,
    cost: `门票${coinArenaRandomOpening.ticket}铜钱`,
    reward: `单局输赢${coinArenaRandomOpening.winLoss}`,
    entryNote: '随机开局',
    enabled: true,
    totalSeconds: coinArenaRandomOpening.totalMinutes * 60,
    regularStepSeconds: coinArenaRandomOpening.moveSeconds,
    openingStepSeconds: coinArenaRandomOpening.openingMoveSeconds,
    openingMoveCount: coinArenaRandomOpening.openingMoveCount,
  },
  {
    id: 'fast5',
    label: '5分钟场',
    tag: '快棋',
    detail: '短局快攻 · 适合碎片练手',
    timeLabel: '5分钟',
    stepLabel: '前3步30秒，之后60秒',
    cost: '2500铜钱',
    reward: '胜负影响积分与头衔',
    entryNote: '快速开局',
    enabled: true,
    totalSeconds: 5 * 60,
    regularStepSeconds: 60,
    openingStepSeconds: 30,
    openingMoveCount: 3,
  },
  {
    id: 'standard10',
    label: '10分钟场',
    tag: '标准',
    detail: '标准局时 · 排位入口复用此场',
    timeLabel: '10分钟',
    stepLabel: '前3步30秒，之后60秒',
    cost: '2500铜钱',
    reward: '胜负影响积分与头衔',
    entryNote: '标准匹配',
    enabled: true,
    totalSeconds: 10 * 60,
    regularStepSeconds: 60,
    openingStepSeconds: 30,
    openingMoveCount: 3,
  },
  {
    id: 'slow20',
    label: '20分钟场',
    tag: '慢棋',
    detail: '长考慢棋 · 更接近正式对局',
    timeLabel: '20分钟',
    stepLabel: '前3步30秒，之后60秒',
    cost: '2500铜钱',
    reward: '胜负影响积分与头衔',
    entryNote: '进入慢棋',
    enabled: true,
    totalSeconds: 20 * 60,
    regularStepSeconds: 60,
    openingStepSeconds: 30,
    openingMoveCount: 3,
  },
  {
    id: 'friend',
    label: '好友对战',
    tag: '房间',
    detail: '房间制对局 · 邀请好友后续接入',
    timeLabel: '自定义',
    stepLabel: '房主设置',
    cost: '免费',
    reward: '非计分棋谱',
    entryNote: '创建房间',
    enabled: true,
    totalSeconds: 15 * 60,
    toast: '好友房间后续开放',
  },
];

const opponents = [
  { name: '青竹居士', rank: '业余2级' },
  { name: '云台小将', rank: '业余3级' },
  { name: '楚河行者', rank: '业余4级' },
];

const xiangqiLobbyEntries: LobbyEntry[] = [
  { id: 'certification', title: '棋力认证第4届', count: '9410', icon: Medal, tone: 'violet', mode: 'certification' },
  { id: 'puzzle', title: '残局', count: '8048', icon: LayoutGrid, tone: 'sand', toast: '残局请从左侧入口进入' },
  { id: 'rating', title: '棋力评测', count: '125329', icon: ScrollText, tone: 'copper', mode: 'rating' },
  { id: 'coin', title: '铜钱场', count: '18934', icon: Coins, tone: 'blue', mode: 'standard10' },
  { id: 'huashan', title: '华山论剑', count: '10012', icon: Trophy, tone: 'red', mode: 'huashan' },
  { id: 'fast', title: '5/10/20分钟场', count: '23475', icon: Compass, tone: 'gold', mode: 'fast5' },
  { id: 'friend', title: '好友对战', count: '5536', icon: MessageCircle, tone: 'rose', mode: 'friend' },
  { id: 'bot', title: '人机对战', count: '8050', icon: Bot, tone: 'dark', mode: 'training' },
];

const xiangqiSecondaryEntries: LobbyEntry[] = [
  { id: 'records', title: '我的棋谱', detail: '我的棋谱，海量赛事棋谱', icon: ScrollText, tone: 'book' },
  { id: 'events', title: '象棋赛事入口', detail: '专题赛事等你来闯', icon: Trophy, tone: 'cup' },
];

const jieqiLobbyEntries: LobbyEntry[] = [
  { id: 'rating', title: '揭棋评测', count: '6394', icon: Medal, tone: 'sand', mode: 'rating' },
  { id: 'normal', title: '普通场', detail: '底注4500(6000--20万)', count: '12109', icon: Swords, tone: 'blue', mode: 'standard10' },
  { id: 'middle', title: '中级场', detail: '底注1.5万(2万--80万)', count: '779', icon: Trophy, tone: 'copper', bonus: '+15%', mode: 'standard10' },
  { id: 'expert', title: '高手场', detail: '底注5万(6万以上)', count: '130', icon: Flag, tone: 'blue', bonus: '+30%', mode: 'standard10' },
  { id: 'elite', title: '精英场', detail: '底注30万(35万以上)', count: '0', icon: Medal, tone: 'blue', bonus: '+30%', mode: 'standard10' },
];

const jieqiSecondaryEntries: LobbyEntry[] = [
  { id: 'friend', title: '好友对战', count: '650', icon: MessageCircle, tone: 'rose', mode: 'friend' },
  { id: 'records', title: '我的棋谱', detail: '最近对局、我的收藏以及顶级高手棋谱', icon: ScrollText, tone: 'book' },
];

const puzzleLobbyEntries: LobbyEntry[] = [
  { id: 'pass', title: '残局-闯关', count: '3084', icon: Swords, tone: 'sand', bonus: '0/720关' },
  { id: 'score', title: '残局-评分', detail: '通过海量残局鉴定实力', icon: Medal, tone: 'sand', bonus: '300分' },
  { id: 'challenge', title: '残局-挑战', detail: '限时挑战残局玩法', icon: Flag, tone: 'sand' },
  { id: 'learn', title: '残局-学习', detail: '精准分类残局，快速提升', icon: PenLine, tone: 'sand' },
  { id: 'coin', title: '残局-铜钱场', detail: '解残局，赢铜钱!', icon: Gem, tone: 'sand' },
  { id: 'hot', title: '残局-热门', detail: '网络主播推荐', icon: Flame, tone: 'sand', bonus: '0/282关' },
];

const puzzlePanelEntryIds = ['campaign', 'scored', 'challenge', 'study', 'coin', 'hot'];

const xiangqiDockItems: Array<{ label: string; icon: IconComponent; badge?: string }> = [
  { label: '每日福利', icon: Gift, badge: '2' },
  { label: '活动中心', icon: Gem },
  { label: '广告时间', icon: Video },
  { label: '商城', icon: ShoppingBasket },
];

function getMatchMode(mode: MatchMode): LobbyMode {
  return matchModes.find((item) => item.id === mode) ?? matchModes[0];
}

function getXiangqiAiDifficultyOption(difficulty: XiangqiAiDifficulty) {
  return xiangqiAiDifficultyOptions.find((option) => option.id === difficulty) ?? xiangqiAiDifficultyOptions[1];
}

function createAiTrainingPlaySession(difficulty: XiangqiAiDifficulty, tableSeed: number): XiangqiPlaySession {
  const option = getXiangqiAiDifficultyOption(difficulty);
  const base = createGenericPlaySession('training', `人机对战-${option.label}`, 10 * 60, '前3步30秒，之后90秒');
  return {
    ...base,
    id: `generic-training-${difficulty}`,
    label: `人机对战-${option.label}`,
    arenaTitle: `${option.label}人机`,
    tableLabel: `本地桌 ${tableSeed}`,
    detail: option.detail,
    rewardLabel: '不计积分练习局',
    replayTags: ['本地练习', `${option.label}人机`, '难度可选'],
    notes: [
      `当前难度：${option.label}`,
      option.detail,
      '可从人机对战入口重新选择难度后再开局。',
    ],
  };
}

function mapXiangqiMatchMode(action: XiangqiFeatureAction): MatchMode {
  if (action.match?.mode === 'rank-certification') return 'certification';
  if (action.match?.mode === 'coin-arena') return 'coinRandom';
  if (action.match?.mode === 'huashan') return 'huashan';
  if (action.match?.mode === 'ai') return 'training';
  if (action.match?.mode === 'friend') return 'friend';
  if (action.match?.mode === 'ranked') {
    if (action.match.minutes === 5) return 'fast5';
    if (action.match.minutes === 20) return 'slow20';
    return 'standard10';
  }
  return 'standard10';
}

function minuteModeFromRankedArena(arenaId: RankedArenaId): XiangqiMinuteArenaMode {
  if (arenaId.startsWith('fast5')) return 'five-minute';
  if (arenaId.startsWith('slow20')) return 'twenty-minute';
  return 'ten-minute';
}

function tableLabelForSession(session: XiangqiPlaySession, tableSeed: number): string {
  if (session.kind === 'certification') return `认证席 ${tableSeed}`;
  if (session.kind === 'coin') return `铜钱桌 ${tableSeed}`;
  if (session.kind === 'minute') return `积分桌 ${tableSeed}`;
  if (session.kind === 'rating') return `评测桌 ${tableSeed}`;
  if (session.kind === 'huashan') return `华山台 ${tableSeed}`;
  if (session.kind === 'friend') {
    const room = createFriendRoom(friendModeFromSession(session), tableSeed);
    return `${room.clubNo} · ${room.tableNo}`;
  }
  return `本地桌 ${tableSeed}`;
}

function friendModeFromSession(session: XiangqiPlaySession): XiangqiFriendRoomMode {
  if (session.totalSeconds === 5 * 60) return 'five-minute';
  if (session.totalSeconds === 20 * 60) return 'twenty-minute';
  return 'ten-minute';
}

function huashanModeFromSession(session: XiangqiPlaySession): XiangqiHuashanMode {
  return session.id.includes('summit') ? 'summit' : 'pass';
}

function retableSession(session: XiangqiPlaySession, tableSeed: number): XiangqiPlaySession {
  if (session.kind === 'friend') return createFriendPlaySession(friendModeFromSession(session), tableSeed);
  if (session.kind === 'huashan') return createHuashanPlaySession(huashanModeFromSession(session), tableSeed);
  if (session.kind === 'rating') return createRatingPlaySession(tableSeed);
  return { ...session, tableLabel: tableLabelForSession(session, tableSeed) };
}

export default function App() {
  const [route, setRoute] = useState<Route>('home');
  const [activeMode, setActiveMode] = useState<Mode>('xiangqi');
  const [bottomTab, setBottomTab] = useState<BottomTab>('play');
  const [game, setGame] = useState<GameState>(() => createInitialGame());
  const [replayStep, setReplayStep] = useState(0);
  const [matchMode, setMatchMode] = useState<MatchMode>('certification');
  const [sessionLabel, setSessionLabel] = useState(xiangqiCertificationConfig.title);
  const [playSession, setPlaySession] = useState<XiangqiPlaySession>(() => createCertificationPlaySession());
  const [matchingMode, setMatchingMode] = useState<MatchingState | null>(null);
  const [opponentIndex, setOpponentIndex] = useState(1);
  const [tableSeed, setTableSeed] = useState(1);
  const [selectedCoinRowId, setSelectedCoinRowId] = useState<XiangqiCoinArenaRowId>('random');
  const [selectedMinuteMode, setSelectedMinuteMode] = useState<XiangqiMinuteArenaMode>('five-minute');
  const [selectedRankedJieqiMode, setSelectedRankedJieqiMode] = useState<XiangqiMinuteArenaMode>('ten-minute');
  const [selectedHuashanMode, setSelectedHuashanMode] = useState<XiangqiHuashanMode>('pass');
  const [selectedFriendMode, setSelectedFriendMode] = useState<XiangqiFriendRoomMode>('ten-minute');
  const [selectedXiangqiDifficulty, setSelectedXiangqiDifficulty] = useState<XiangqiAiDifficulty>('advanced');
  const [kifuRecords, setKifuRecords] = useState<XiangqiKifuRecord[]>([]);
  const [selectedKifuId, setSelectedKifuId] = useState<string | null>(null);
  const [recentPlay, setRecentPlay] = useState<RecentPlay>(() => readRecentPlay());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [puzzleAttempt, setPuzzleAttempt] = useState<XiangqiPuzzleAttempt>(() => (
    createXiangqiPuzzleAttempt('daily')
  ));
  const [puzzleSelected, setPuzzleSelected] = useState<string | null>(null);
  const [puzzleLegalMoves, setPuzzleLegalMoves] = useState<Position[]>([]);
  const [puzzleView, setPuzzleView] = useState<PuzzleView>('campaign-map');
  const [campaignLevel, setCampaignLevel] = useState(1);
  const [campaignAttemptLevel, setCampaignAttemptLevel] = useState(1);
  const [campaignStamina, setCampaignStamina] = useState(8);
  const [campaignResultKind, setCampaignResultKind] = useState<CampaignResultKind>(null);
  const [campaignRankOpen, setCampaignRankOpen] = useState(false);
  const [puzzleCommentsOpen, setPuzzleCommentsOpen] = useState(false);
  const [puzzleSettlementOpen, setPuzzleSettlementOpen] = useState(false);
  const [puzzleCommentText, setPuzzleCommentText] = useState('');
  const [gobangBoard, setGobangBoard] = useState<number[][]>(() => createGobangBoard());
  const [gobangStatus, setGobangStatus] = useState('黑先手');
  const [gobangLastMove, setGobangLastMove] = useState<Position | null>(null);
  const [gobangDifficulty, setGobangDifficulty] = useState<GobangDifficulty>('normal');
  const [gobangDifficultyOpen, setGobangDifficultyOpen] = useState(false);
  const [gobangHistory, setGobangHistory] = useState<GobangSnapshot[]>([]);
  const [gobangUndoLeft, setGobangUndoLeft] = useState(3);
  const [gobangDrawOffersLeft, setGobangDrawOffersLeft] = useState(3);
  const [activeMoreGame, setActiveMoreGame] = useState<MoreGameKind>('gobang');
  const [gameIntroOpen, setGameIntroOpen] = useState(false);
  const [gameMenuOpen, setGameMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState<ChatTab>('emoji');
  const [chatText, setChatText] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>(['系统提示：欢迎来到天天象棋!']);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [drawOffersLeft, setDrawOffersLeft] = useState(3);
  const [undoLeft, setUndoLeft] = useState(3);
  const [puzzleProgress, setPuzzleProgress] = useState<PuzzleProgress>(() => createPuzzleProgress());
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    moveHints: true,
    coordinates: true,
    captureAnimation: true,
    backgroundMusic: false,
    sound: true,
    messages: true,
    autoVoice: false,
    localVoice: true,
    boardMarks: false,
  });
  const [toast, setToast] = useState<ToastState | null>(null);
  const [rulesDialog, setRulesDialog] = useState<RulesDialogKind | null>(null);
  const [featureDialog, setFeatureDialog] = useState<FeatureDialogState | null>(null);
  const contentFrameRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef(game);
  const puzzleAiRequestRef = useRef(0);
  const puzzleSession = puzzleAttempt.session;
  const puzzleBoard = puzzleSession.pieces;
  const puzzleStatus = puzzleAttempt.status;
  const puzzleMoves = puzzleSession.steps;
  const puzzleSeconds = puzzleSession.elapsedSeconds;
  const puzzleHintTarget = puzzleSession.revealedHint?.target ?? null;
  const puzzleHintVisible = Boolean(puzzleHintTarget);
  const activePuzzle = getPuzzleById(puzzleAttempt.puzzleId) ?? dailyPuzzle;
  const isLobbyTitle =
    route === 'lobby' ||
    (route === 'home' && bottomTab === 'play' && (activeMode === 'jieqi' || activeMode === 'puzzle' || activeMode === 'more'));

  const pageTitle = useMemo(() => {
    if (route === 'lobby') return '象棋';
    if (route === 'jieqi') return '揭棋评测';
    if (route === 'puzzle') return puzzleView === 'campaign-map' || puzzleAttempt.entryId === 'campaign' ? '残局闯关' : '每日残局';
    if (route === 'more-game') return activeMoreGame === 'gobang' ? '欢乐五子棋' : '翻翻棋';
    if (route === 'game') return `${sessionLabel}对局`;
    if (route === 'result') return `${sessionLabel}结算`;
    if (route === 'replay') return `${sessionLabel}复盘`;
    if (route === 'profile') return '我的';
    if (bottomTab !== 'play') return bottomTabs.find((item) => item.id === bottomTab)?.label ?? '下棋';
    if (activeMode === 'xiangqi') return '首页';
    if (activeMode === 'puzzle') return '残局挑战';
    return modeItems.find((item) => item.id === activeMode)?.label ?? '下棋';
  }, [activeMode, activeMoreGame, bottomTab, puzzleAttempt.entryId, puzzleView, route, sessionLabel]);

  const selectedXiangqiDifficultyOption = getXiangqiAiDifficultyOption(selectedXiangqiDifficulty);
  const currentOpponent = matchMode === 'training'
    ? { name: '小天', rank: selectedXiangqiDifficultyOption.rival }
    : opponents[opponentIndex % opponents.length];

  useEffect(() => {
    if (route !== 'game' || game.phase !== 'playing' || game.paused) return;

    const timer = window.setInterval(() => {
      setGame((current) => {
        if (current.phase !== 'playing' || current.paused) return current;
        const redTotal = current.turn === 'red' ? current.redTotal - 1 : current.redTotal;
        const blackTotal = current.turn === 'black' ? current.blackTotal - 1 : current.blackTotal;
        const stepLeft = current.stepLeft - 1;
        if (redTotal <= 0 || blackTotal <= 0 || stepLeft <= 0) {
          return finishGame(current, opposite(current.turn), 'timeout');
        }
        return { ...current, redTotal, blackTotal, stepLeft };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [game.phase, game.paused, route]);

  useEffect(() => {
    const puzzleVisible = (route === 'home' && activeMode === 'puzzle' && bottomTab === 'play') || (route === 'puzzle' && puzzleView === 'play');
    if (!puzzleVisible || puzzleStatus === 'solved' || puzzleStatus === 'impossible' || puzzleStatus === 'abandoned') return;
    const timer = window.setInterval(() => setPuzzleAttempt((current) => tickXiangqiPuzzleAttempt(current)), 1000);
    return () => window.clearInterval(timer);
  }, [activeMode, bottomTab, puzzleStatus, puzzleView, route]);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    if (route !== 'game' || game.phase !== 'playing' || game.turn !== 'black' || game.paused) return;

    let cancelled = false;
    const aiDelay = window.setTimeout(() => {
      const requested = gameRef.current;
      const requestedMoveCount = requested.moveHistory.length;
      void chooseComputerMove(requested.pieces, 'black', {
        turnIndex: requestedMoveCount,
        difficulty: selectedXiangqiDifficulty,
      }).then((move) => {
        if (cancelled) return;
        setGame((current) => {
          if (
            current.phase !== 'playing' ||
            current.turn !== 'black' ||
            current.paused ||
            current.pieces !== requested.pieces ||
            current.moveHistory.length !== requestedMoveCount
          ) {
            return current;
          }
          if (!move) return finishGame(current, 'red', getDefeatReason(current.pieces, 'black') ?? 'stalemate');
          return applyMove(current, move.pieceId, move.to);
        });
      });
    }, 650);

    return () => {
      cancelled = true;
      window.clearTimeout(aiDelay);
    };
  }, [game.moveHistory.length, game.paused, game.phase, game.turn, route, selectedXiangqiDifficulty]);

  useEffect(() => {
    if (game.result && route === 'game') {
      const record = createKifuRecord({
        result: game.result,
        session: playSession,
        opponent: currentOpponent,
        createdAt: game.result.endedAt,
      });
      setKifuRecords((current) => (
        current.some((item) => item.id === record.id) ? current : [record, ...current].slice(0, 20)
      ));
      setSelectedKifuId(record.id);
      setReplayStep(game.result.moves.length);
      const routeDelay = window.setTimeout(() => setRoute('result'), 600);
      return () => window.clearTimeout(routeDelay);
    }
  }, [currentOpponent, game.result, playSession, route]);

  useEffect(() => {
    if (!matchingMode) return;
    const matchDelay = window.setTimeout(() => {
      setOpponentIndex((index) => (index + 1) % opponents.length);
      startGame(matchingMode.mode, matchingMode.label, matchingMode.session);
      setMatchingMode(null);
    }, 1200);
    return () => window.clearTimeout(matchDelay);
  }, [matchingMode]);

  useEffect(() => {
    if (route !== 'replay' || !replayPlaying) return;
    const movesLength = game.result?.moves.length ?? 0;
    if (replayStep >= movesLength) {
      setReplayPlaying(false);
      return;
    }
    const playDelay = window.setTimeout(() => setReplayStep((step) => Math.min(step + 1, movesLength)), 780);
    return () => window.clearTimeout(playDelay);
  }, [game.result, replayPlaying, replayStep, route]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    contentFrameRef.current?.scrollTo({ top: 0, left: 0 });
  }, [activeMode, bottomTab, route]);

  useEffect(() => {
    if (!toast) return;
    const toastDelay = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(toastDelay);
  }, [toast]);

  useEffect(() => {
    try {
      window.localStorage.setItem(recentPlayStorageKey, JSON.stringify(recentPlay));
    } catch {
      // Local storage can be unavailable in private browsing; the in-memory state still updates.
    }
  }, [recentPlay]);

  function showToast(message: string, kind: ToastKind = 'info') {
    setToast({ id: Date.now(), message, kind });
  }

  function recordRecentPlay(input: RecentPlayInput) {
    setRecentPlay({ ...input, playedAt: formatRecentPlayDate() });
  }

  function recordRecentSession(session: XiangqiPlaySession) {
    if (activeMode === 'ranked') {
      recordRecentPlay({
        title: `排位赛-${session.label}`,
        count: modeItems.find((item) => item.id === 'ranked')?.count ?? '0',
        mode: 'ranked',
        route: 'home',
      });
      return;
    }
    recordRecentPlay({
      title: `象棋-${session.label}`,
      count: modeItems.find((item) => item.id === 'xiangqi')?.count ?? '0',
      mode: 'xiangqi',
      route: 'lobby',
    });
  }

  function openRecentPlay() {
    setActiveMode(recentPlay.mode);
    setBottomTab('play');
    if (recentPlay.moreGame) setActiveMoreGame(recentPlay.moreGame);
    if (recentPlay.puzzleView) setPuzzleView(recentPlay.puzzleView);
    setRoute(recentPlay.route);
  }

  function openModeHelp() {
    if (route === 'lobby' || activeMode === 'xiangqi') {
      setRulesDialog('xiangqi');
      return;
    }
    if (activeMode === 'jieqi') {
      setRulesDialog('jieqi');
      return;
    }
    if (activeMode === 'ranked') {
      setRulesDialog('ranked');
      return;
    }
    showToast(`${pageTitle}玩法帮助后续开放`, 'info');
  }

  function openXiangqiFeature(entryId: XiangqiFeatureEntryId) {
    if (entryId === 'endgame') {
      openMode('puzzle');
      return;
    }
    setFeatureDialog({ kind: 'xiangqi', entryId });
  }

  function openJieqiFeature(entryId: JieqiFeatureEntryId) {
    setFeatureDialog({ kind: 'jieqi', entryId });
  }

  function openPuzzleFeature(entryId: string) {
    setFeatureDialog({ kind: 'puzzle', entryId });
  }

  function openDailyPuzzle() {
    puzzleAiRequestRef.current += 1;
    recordRecentPlay({
      title: '残局-每日残局',
      count: modeItems.find((item) => item.id === 'puzzle')?.count ?? '0',
      mode: 'puzzle',
      route: 'puzzle',
      puzzleView: 'play',
    });
    setPuzzleAttempt(createXiangqiPuzzleAttempt('daily'));
    setPuzzleSelected(null);
    setPuzzleLegalMoves([]);
    setPuzzleSettlementOpen(false);
    setCampaignResultKind(null);
    setCampaignRankOpen(false);
    setPuzzleView('play');
    setActiveMode('puzzle');
    setBottomTab('play');
    setRoute('puzzle');
  }

  function openCampaignMap() {
    puzzleAiRequestRef.current += 1;
    setPuzzleSelected(null);
    setPuzzleLegalMoves([]);
    setPuzzleSettlementOpen(false);
    setCampaignResultKind(null);
    setCampaignRankOpen(false);
    setPuzzleView('campaign-map');
    setActiveMode('puzzle');
    setBottomTab('play');
    setRoute('puzzle');
  }

  function startCampaignLevel(level = campaignLevel, force = false) {
    if (!force && level > campaignLevel) {
      showToast('先通过前一关再挑战这里', 'warning');
      return;
    }
    puzzleAiRequestRef.current += 1;
    recordRecentPlay({
      title: `残局-第${level}关`,
      count: modeItems.find((item) => item.id === 'puzzle')?.count ?? '0',
      mode: 'puzzle',
      route: 'puzzle',
      puzzleView: 'play',
    });
    const nextStamina = Math.max(0, campaignStamina - 1);
    setCampaignAttemptLevel(level);
    setCampaignStamina(nextStamina);
    setPuzzleAttempt(createXiangqiPuzzleAttempt('campaign', {
      puzzle: getCampaignPuzzle(level),
      resources: { stamina: nextStamina, hintCards: 2 },
    }));
    setPuzzleSelected(null);
    setPuzzleLegalMoves([]);
    setPuzzleSettlementOpen(false);
    setCampaignResultKind(null);
    setCampaignRankOpen(false);
    setPuzzleView('play');
    setActiveMode('puzzle');
    setBottomTab('play');
    setRoute('puzzle');
  }

  function nextCampaignLevel() {
    const nextLevel = Math.min(720, campaignAttemptLevel + 1);
    setCampaignLevel((level) => Math.max(level, nextLevel));
    startCampaignLevel(nextLevel, true);
  }

  function runFeaturePrimaryAction() {
    if (!featureDialog) return;

    if (featureDialog.kind === 'xiangqi') {
      if (featureDialog.entryId === 'rank-certification') {
        setFeatureDialog(null);
        startPlaySession(createCertificationPlaySession(tableSeed));
        return;
      }
      if (featureDialog.entryId === 'skill-evaluation') {
        setFeatureDialog(null);
        startPlaySession(createRatingPlaySession(tableSeed));
        return;
      }
      if (featureDialog.entryId === 'huashan') {
        setFeatureDialog(null);
        startPlaySession(createHuashanPlaySession(selectedHuashanMode, tableSeed));
        return;
      }
      if (featureDialog.entryId === 'friend-match') {
        setFeatureDialog(null);
        startPlaySession(createFriendPlaySession(selectedFriendMode, tableSeed));
        return;
      }
      if (featureDialog.entryId === 'my-records') {
        const selected = selectedKifuId ? kifuRecords.find((record) => record.id === selectedKifuId) : kifuRecords[0];
        if (!selected?.result?.moves.length) {
          showToast(selected ? '该棋谱暂无可复盘走子' : '暂无本地棋谱，完成一局后会自动保存', 'warning');
          return;
        }
        setFeatureDialog(null);
        setPlaySession(selected.session);
        setSessionLabel(selected.session.label);
        setGame({
          ...createInitialGame(
            selected.session.totalSeconds,
            selected.session.regularStepSeconds,
            selected.session.openingStepSeconds,
            selected.session.openingMoveCount,
          ),
          pieces: selected.result.pieces,
          moveHistory: selected.result.moves,
          phase: 'ended',
          result: selected.result,
          paused: true,
        });
        setReplayStep(selected.result.moves.length);
        setReplayPlaying(false);
        setRoute('replay');
        return;
      }
      if (featureDialog.entryId === 'coin-arena') {
        if (selectedCoinRowId === 'endgame-coin') {
          setFeatureDialog(null);
          setActiveMode('puzzle');
          setBottomTab('play');
          setRoute('puzzle');
          showToast('已进入残局-铜钱场本地练习', 'info');
          return;
        }
        const arenaSession = getCoinArenaSession(selectedCoinRowId, defaultCoinArenaWallet);
        if (!arenaSession.canEnter) {
          showToast(arenaSession.reliefPrompt?.message ?? '当前铜钱不满足该场准入条件', 'warning');
          return;
        }
        setFeatureDialog(null);
        startPlaySession(createCoinPlaySession(selectedCoinRowId, defaultCoinArenaWallet, tableSeed));
        return;
      }
      if (featureDialog.entryId === 'ranked-5' || featureDialog.entryId === 'ranked-10' || featureDialog.entryId === 'ranked-20') {
        setFeatureDialog(null);
        startPlaySession(createMinutePlaySession(selectedMinuteMode, tableSeed));
        return;
      }
      const action = getXiangqiFeatureAction(featureDialog.entryId);
      if (action.type === 'start-match' && action.match) {
        setFeatureDialog(null);
        const mode = mapXiangqiMatchMode(action);
        const session = mode === 'training' ? createAiTrainingPlaySession(selectedXiangqiDifficulty, tableSeed) : undefined;
        startMatching(mode, session?.label, session);
        return;
      }
      if (action.type === 'open-puzzle') {
        setFeatureDialog(null);
        openMode('puzzle');
        return;
      }
      showToast(`${action.title}已在面板中展示`, 'info');
      return;
    }

    if (featureDialog.kind === 'jieqi') {
      const action = getJieqiFeatureAction(featureDialog.entryId);
      if (action.type === 'start-jieqi') {
        setFeatureDialog(null);
        recordRecentPlay({
          title: '揭棋-揭棋评测',
          count: modeItems.find((item) => item.id === 'jieqi')?.count ?? '0',
          mode: 'jieqi',
          route: 'jieqi',
        });
        setActiveMode('jieqi');
        setBottomTab('play');
        setRoute('jieqi');
        return;
      }
      showToast(`${action.title}已在面板中展示`, 'info');
      return;
    }

    const action = getPuzzleFeatureAction(featureDialog.entryId, puzzleProgress);
    if (action.type === 'open-daily') {
      setFeatureDialog(null);
      openDailyPuzzle();
      return;
    }
    if (featureDialog.entryId === 'campaign') {
      setFeatureDialog(null);
      openCampaignMap();
      return;
    }
    if (action.type === 'open-set' || action.type === 'open-review') {
      setFeatureDialog(null);
      openCampaignMap();
      return;
    }
    if (action.type === 'open-comments') {
      setFeatureDialog(null);
      setPuzzleCommentsOpen(true);
      return;
    }
    if (action.type === 'show-panel' && action.panel === 'analysis') {
      showPuzzleHint();
      return;
    }
    if (action.type === 'show-panel' && action.panel === 'restart') {
      resetPuzzle();
      showToast('残局已重置', 'success');
      return;
    }
    showToast(action.label, 'info');
  }

  function runFeatureSecondaryAction() {
    if (featureDialog?.kind === 'xiangqi' && featureDialog.entryId === 'my-records') {
      const selected = selectedKifuId ? kifuRecords.find((record) => record.id === selectedKifuId) : kifuRecords[0];
      if (!selected) {
        showToast('暂无可收藏棋谱', 'warning');
        return;
      }
      setKifuRecords((current) => toggleKifuFavorite(current, selected.id));
      showToast(selected.favorite ? '已取消收藏' : '已收藏棋谱', 'success');
      return;
    }
    switchTable();
  }

  function selectFeatureCard(cardId: string) {
    if (!featureDialog || featureDialog.kind !== 'xiangqi') return;
    if (featureDialog.entryId === 'coin-arena') {
      setSelectedCoinRowId(cardId as XiangqiCoinArenaRowId);
      return;
    }
    if (featureDialog.entryId === 'ranked-5' || featureDialog.entryId === 'ranked-10' || featureDialog.entryId === 'ranked-20') {
      setSelectedMinuteMode(cardId as XiangqiMinuteArenaMode);
      return;
    }
    if (featureDialog.entryId === 'huashan') {
      setSelectedHuashanMode(cardId as XiangqiHuashanMode);
      return;
    }
    if (featureDialog.entryId === 'friend-match') {
      setSelectedFriendMode(cardId as XiangqiFriendRoomMode);
      return;
    }
    if (featureDialog.entryId === 'ai-match') {
      setSelectedXiangqiDifficulty(cardId as XiangqiAiDifficulty);
      return;
    }
    if (featureDialog.entryId === 'my-records') {
      setSelectedKifuId(cardId);
    }
  }

  function switchTable() {
    setTableSeed((current) => {
      const next = current + 1;
      setPlaySession((session) => retableSession(session, next));
      return next;
    });
    setOpponentIndex((index) => (index + 1) % opponents.length);
    showToast('已换桌并刷新对手', 'success');
  }

  function restartWithCurrentSession() {
    startPlaySession(playSession);
  }

  function switchOpponentAndRestart() {
    const nextTable = tableSeed + 1;
    const nextSession = retableSession(playSession, nextTable);
    setTableSeed(nextTable);
    setOpponentIndex((index) => (index + 1) % opponents.length);
    startPlaySession(nextSession);
  }

  function openMode(mode: Mode) {
    setActiveMode(mode);
    setBottomTab('play');
    setRoute(mode === 'xiangqi' ? 'lobby' : 'home');
  }

  function openBottomTab(tab: BottomTab) {
    setBottomTab(tab);
    setRoute(tab === 'me' ? 'profile' : 'home');
  }

  function returnHomeLanding() {
    setActiveMode('xiangqi');
    setBottomTab('play');
    setRoute('home');
  }

  function openJieqiGame() {
    recordRecentPlay({
      title: '揭棋-揭棋评测',
      count: modeItems.find((item) => item.id === 'jieqi')?.count ?? '0',
      mode: 'jieqi',
      route: 'jieqi',
    });
    setActiveMode('jieqi');
    setBottomTab('play');
    setRoute('jieqi');
  }

  function createDefaultPlaySession(mode: MatchMode, label = getMatchMode(mode).label): XiangqiPlaySession {
    if (mode === 'certification') return createCertificationPlaySession(tableSeed);
    if (mode === 'rating') return createRatingPlaySession(tableSeed);
    if (mode === 'huashan') return createHuashanPlaySession(selectedHuashanMode, tableSeed);
    if (mode === 'friend') return createFriendPlaySession(selectedFriendMode, tableSeed);
    if (mode === 'coinRandom') return createCoinPlaySession('random', defaultCoinArenaWallet, tableSeed);
    if (mode === 'fast5') return createMinutePlaySession('five-minute', tableSeed);
    if (mode === 'slow20') return createMinutePlaySession('twenty-minute', tableSeed);
    if (mode === 'standard10') return createMinutePlaySession('ten-minute', tableSeed);
    if (mode === 'training') return createAiTrainingPlaySession(selectedXiangqiDifficulty, tableSeed);
    const modeInfo = getMatchMode(mode);
    return createGenericPlaySession(mode, label, modeInfo.totalSeconds, modeInfo.stepLabel);
  }

  function startPlaySession(session: XiangqiPlaySession) {
    startMatching(session.matchMode as MatchMode, session.label, session);
  }

  function startRankedSelection(selection: RankedStartSelection) {
    const minuteMode = minuteModeFromRankedArena(selection.arena.id);
    if (selection.game.id === 'jieqi') {
      setSelectedRankedJieqiMode(minuteMode);
      setMatchingMode(null);
      recordRecentPlay({
        title: `揭棋排位-${selection.arena.label}`,
        count: modeItems.find((item) => item.id === 'jieqi')?.count ?? '0',
        mode: 'jieqi',
        route: 'jieqi',
      });
      setActiveMode('jieqi');
      setBottomTab('play');
      setRoute('jieqi');
      showToast(`已进入揭棋排位：${selection.arena.label}`, 'success');
      return;
    }
    startPlaySession(createMinutePlaySession(minuteMode, tableSeed));
  }

  function startMatching(mode: MatchMode, label = getMatchMode(mode).label, session = createDefaultPlaySession(mode, label)) {
    const modeInfo = getMatchMode(mode);
    setMatchMode(mode);
    if (!modeInfo.enabled) {
      showToast(modeInfo.toast ?? '入口暂未开放', 'info');
      return;
    }
    setSessionLabel(label);
    setPlaySession(session);
    setReplayPlaying(false);
    setMatchingMode({ mode, label, session });
  }

  function startGame(mode = matchMode, label = sessionLabel, session = playSession) {
    setMatchMode(mode);
    setSessionLabel(label);
    setPlaySession(session);
    recordRecentSession(session);
    setGame({
      ...createInitialGame(
        session.totalSeconds,
        session.regularStepSeconds,
        session.openingStepSeconds,
        session.openingMoveCount,
      ),
      paused: true,
    });
    setReplayStep(0);
    setReplayPlaying(false);
    setConfirmAction(null);
    setSettingsOpen(false);
    setChatOpen(false);
    setAnalysisOpen(false);
    setGameMenuOpen(false);
    setDrawOffersLeft(3);
    setUndoLeft(3);
    setGameIntroOpen(true);
    setRoute('game');
  }

  function selectPoint(point: Position) {
    if (game.phase !== 'playing' || game.turn !== 'red' || game.paused) return;
    setGame((current) => {
      const selected = current.selectedPieceId ? findPiece(current.pieces, current.selectedPieceId) : undefined;
      const pointPiece = getPieceAt(current.pieces, point);
      if (selected && hasPoint(current.legalMoves, point)) {
        return applyMove(current, selected.id, point);
      }
      if (pointPiece?.side === 'red') {
        return selectPiece(current, pointPiece.id);
      }
      return { ...current, selectedPieceId: null, legalMoves: [] };
    });
  }

  function resign() {
    setGame((current) => finishGame(current, 'black', 'resign'));
  }

  function requestResign() {
    setConfirmAction('resign');
    setSettingsOpen(false);
    setChatOpen(false);
    setAnalysisOpen(false);
    setGameMenuOpen(false);
    setGame((current) => ({ ...current, paused: true }));
  }

  function requestHome() {
    if (route === 'game' && game.phase === 'playing') {
      setConfirmAction('exit');
      setGameMenuOpen(false);
      setGame((current) => ({ ...current, paused: true }));
      return;
    }
    setRoute('home');
  }

  function requestExit() {
    setConfirmAction('exit');
    setSettingsOpen(false);
    setChatOpen(false);
    setGameMenuOpen(false);
    setGame((current) => ({ ...current, paused: true }));
  }

  function confirmGameAction() {
    if (confirmAction === 'resign' || confirmAction === 'exit') resign();
    setConfirmAction(null);
  }

  function cancelGameAction() {
    setConfirmAction(null);
    setGame((current) => ({ ...current, paused: false }));
  }

  function togglePause() {
    setGame((current) => ({ ...current, paused: !current.paused }));
  }

  function beginGameAfterIntro() {
    setGameIntroOpen(false);
    setGame((current) => ({ ...current, paused: false }));
  }

  function leaveGameBeforeIntro() {
    setGameIntroOpen(false);
    setGameMenuOpen(false);
    setConfirmAction(null);
    setSettingsOpen(false);
    setChatOpen(false);
    setAnalysisOpen(false);
    setRoute('home');
    setActiveMode('xiangqi');
    setBottomTab('play');
  }

  function openSettings() {
    setGameMenuOpen(false);
    setChatOpen(false);
    setAnalysisOpen(false);
    setSettingsOpen(true);
    setGame((current) => ({ ...current, paused: true }));
  }

  function closeSettings() {
    setSettingsOpen(false);
    setGame((current) => ({ ...current, paused: false }));
  }

  function toggleSetting(key: SettingKey) {
    setGameSettings((current) => ({ ...current, [key]: !current[key] }));
  }

  function offerDraw() {
    setGameMenuOpen(false);
    showToast('本地人机暂不支持提和', 'info');
  }

  function undoRound() {
    if (undoLeft <= 0) {
      showToast('悔棋次数已用完', 'warning');
      return;
    }
    if (!canUndoRound(game)) {
      showToast('暂无可悔棋步数', 'warning');
      return;
    }
    setGame((current) => {
      if (!canUndoRound(current)) return current;
      return undoLastRound(current);
    });
    setUndoLeft((current) => Math.max(0, current - 1));
    setGameMenuOpen(false);
    showToast('已悔棋一轮', 'success');
  }

  function inviteSpectator() {
    showToast('本地版暂不支持旁观', 'info');
  }

  function openAnalysis() {
    setGameMenuOpen(false);
    setChatOpen(false);
    setSettingsOpen(false);
    setAnalysisOpen(true);
    setGame((current) => ({ ...current, paused: true }));
  }

  function closeAnalysis() {
    setAnalysisOpen(false);
    setGame((current) => ({ ...current, paused: false }));
  }

  function sendChatMessage() {
    const message = chatText.trim();
    if (!message) return;
    setChatMessages((current) => [...current, `我方：${message}`]);
    setChatText('');
    setChatTab('log');
  }

  function selectPuzzlePoint(point: Position) {
    if (puzzleStatus === 'solved' || puzzleStatus === 'impossible' || puzzleStatus === 'abandoned') return;
    if (activePuzzle.mode === 'free-mate' && puzzleSession.turn !== activePuzzle.sideToMove) return;
    const selected = puzzleSelected ? findPiece(puzzleBoard, puzzleSelected) : undefined;
    const pointPiece = getPieceAt(puzzleBoard, point);
    if (selected && hasPoint(puzzleLegalMoves, point)) {
      const useEngineReply = activePuzzle.mode === 'free-mate';
      const result = applyXiangqiPuzzleAttemptMove(activePuzzle, puzzleAttempt, { pieceId: selected.id, to: point }, undefined, {
        autoReply: !useEngineReply,
      });
      setPuzzleAttempt(result.attempt);
      setPuzzleSelected(null);
      setPuzzleLegalMoves([]);
      if (result.attempt.status === 'solved' || result.attempt.status === 'impossible') {
        setPuzzleProgress((current) =>
          recordPuzzleAttempt(current, {
            puzzleId: activePuzzle.id,
            outcome: result.attempt.status === 'solved' ? 'solved' : 'failed',
            elapsedSeconds: result.attempt.session.elapsedSeconds,
            hintsUsed: result.attempt.session.hintsUsed,
            moves: result.attempt.session.steps,
            session: result.attempt.session,
          }),
        );
      }
      if (result.verdict === 'success') {
        setPuzzleSettlementOpen(true);
        if (puzzleAttempt.entryId === 'campaign') {
          setCampaignResultKind('success');
          setCampaignLevel((level) => Math.max(level, Math.min(720, campaignAttemptLevel + 1)));
          if (campaignAttemptLevel % 5 === 0) setCampaignStamina((current) => Math.min(10, current + 2));
        }
        showToast('残局挑战成功，已生成成绩卡', 'success');
      }
      if (result.verdict === 'incorrect' || result.verdict === 'failure') {
        if (puzzleAttempt.entryId === 'campaign' && result.attempt.status === 'impossible') {
          setCampaignResultKind('failure');
          setPuzzleSettlementOpen(true);
        }
        showToast(result.message, 'warning');
      }
      if (
        useEngineReply &&
        result.verdict === 'correct' &&
        result.attempt.status === 'playing' &&
        result.attempt.session.turn !== activePuzzle.sideToMove
      ) {
        const requestId = puzzleAiRequestRef.current + 1;
        puzzleAiRequestRef.current = requestId;
        void chooseComputerMove(result.attempt.session.pieces, result.attempt.session.turn, {
          turnIndex: result.attempt.session.steps,
          difficulty: 'expert',
          movetimeMs: 600,
          timeoutMs: 1800,
        }).then((reply) => {
          if (puzzleAiRequestRef.current !== requestId) return;
          if (!reply) return;
          const replyResult = applyXiangqiPuzzleAttemptMove(activePuzzle, result.attempt, reply, undefined, {
            autoReply: false,
          });
          setPuzzleAttempt(replyResult.attempt);
          if (replyResult.attempt.status === 'solved' || replyResult.attempt.status === 'impossible') {
            setPuzzleProgress((current) =>
              recordPuzzleAttempt(current, {
                puzzleId: activePuzzle.id,
                outcome: replyResult.attempt.status === 'solved' ? 'solved' : 'failed',
                elapsedSeconds: replyResult.attempt.session.elapsedSeconds,
                hintsUsed: replyResult.attempt.session.hintsUsed,
                moves: replyResult.attempt.session.steps,
                session: replyResult.attempt.session,
              }),
            );
          }
          if (replyResult.attempt.status === 'impossible') {
            if (puzzleAttempt.entryId === 'campaign') {
              setCampaignResultKind('failure');
              setPuzzleSettlementOpen(true);
            }
            showToast(replyResult.message, 'warning');
          }
        });
      }
      return;
    }
    if (pointPiece?.side === puzzleSession.turn) {
      setPuzzleSelected(pointPiece.id);
      setPuzzleLegalMoves(getPuzzleLegalMoves(puzzleSession, pointPiece.id));
    } else {
      setPuzzleSelected(null);
      setPuzzleLegalMoves([]);
    }
  }

  function resetPuzzle() {
    puzzleAiRequestRef.current += 1;
    setPuzzleAttempt((current) => {
      const puzzle = getPuzzleById(current.puzzleId) ?? activePuzzle;
      return restartXiangqiPuzzleAttempt(puzzle, current);
    });
    setPuzzleSelected(null);
    setPuzzleLegalMoves([]);
    setPuzzleSettlementOpen(false);
    setCampaignResultKind(null);
  }

  function undoPuzzleMove() {
    puzzleAiRequestRef.current += 1;
    let undone = false;
    setPuzzleAttempt((current) => {
      const puzzle = getPuzzleById(current.puzzleId) ?? activePuzzle;
      const next = undoXiangqiPuzzleAttemptStep(puzzle, current);
      undone = next.session.moveHistory.length < current.session.moveHistory.length;
      return next;
    });
    setPuzzleSelected(null);
    setPuzzleLegalMoves([]);
    setPuzzleSettlementOpen(false);
    setCampaignResultKind(null);
    showToast(undone ? '已悔棋一轮' : '暂无可悔棋步数', undone ? 'success' : 'warning');
  }

  function showPuzzleHint() {
    setPuzzleAttempt((current) => {
      const puzzle = getPuzzleById(current.puzzleId) ?? activePuzzle;
      return revealXiangqiPuzzleHint(puzzle, current).attempt;
    });
  }

  function playGobang(x: number, y: number) {
    if (gobangBoard[y][x] !== 0 || /胜|满|和棋/.test(gobangStatus)) return;
    const snapshot: GobangSnapshot = {
      board: cloneGobangBoard(gobangBoard),
      status: gobangStatus,
      lastMove: gobangLastMove,
    };
    const afterPlayer = placeStone(gobangBoard, x, y, 1);
    if (hasGobangWin(afterPlayer, 1)) {
      setGobangBoard(afterPlayer);
      setGobangStatus('黑方胜');
      setGobangLastMove({ x, y });
      setGobangHistory((history) => [...history, snapshot]);
      return;
    }
    const aiMove = chooseGobangMove(afterPlayer, x, y, gobangDifficulty);
    if (!aiMove) {
      setGobangBoard(afterPlayer);
      setGobangStatus('棋盘已满');
      setGobangLastMove({ x, y });
      setGobangHistory((history) => [...history, snapshot]);
      return;
    }
    const afterAi = placeStone(afterPlayer, aiMove.x, aiMove.y, 2);
    setGobangBoard(afterAi);
    setGobangStatus(hasGobangWin(afterAi, 2) ? '白方胜' : '黑方落子');
    setGobangLastMove(aiMove);
    setGobangHistory((history) => [...history, snapshot]);
  }

  function resetGobang() {
    setGobangBoard(createGobangBoard());
    setGobangStatus('黑先手');
    setGobangLastMove(null);
    setGobangHistory([]);
    setGobangUndoLeft(3);
    setGobangDrawOffersLeft(3);
  }

  function startGobangWithDifficulty(difficulty: GobangDifficulty) {
    const difficultyOption = gobangDifficultyOptions.find((option) => option.id === difficulty) ?? gobangDifficultyOptions[1];
    recordRecentPlay({
      title: `欢乐五子棋-${difficultyOption.label}`,
      count: '1404',
      mode: 'more',
      route: 'more-game',
      moreGame: 'gobang',
    });
    setGobangDifficulty(difficulty);
    setGobangDifficultyOpen(false);
    resetGobang();
    setActiveMoreGame('gobang');
    setActiveMode('more');
    setBottomTab('play');
    setRoute('more-game');
  }

  function undoGobangRound() {
    if (gobangUndoLeft <= 0) {
      showToast('悔棋次数已用完', 'warning');
      return;
    }
    const snapshot = gobangHistory[gobangHistory.length - 1];
    if (!snapshot) {
      showToast('现在还不能悔棋', 'warning');
      return;
    }
    setGobangBoard(cloneGobangBoard(snapshot.board));
    setGobangStatus(snapshot.status);
    setGobangLastMove(snapshot.lastMove);
    setGobangHistory((history) => history.slice(0, -1));
    setGobangUndoLeft((left) => left - 1);
    showToast(`已悔棋，还剩 ${gobangUndoLeft - 1} 次`, 'success');
  }

  function offerGobangDraw() {
    if (/胜|满|和棋/.test(gobangStatus)) {
      showToast('本局已经结束', 'info');
      return;
    }
    if (gobangDrawOffersLeft <= 0) {
      showToast('求和次数已用完', 'warning');
      return;
    }
    setGobangDrawOffersLeft((left) => left - 1);
    setGobangStatus('双方和棋');
    showToast(`求和成功，还剩 ${gobangDrawOffersLeft - 1} 次`, 'success');
  }

  function openMoreGame(gameKind: MoreGameKind) {
    if (gameKind === 'gobang') {
      setGobangDifficultyOpen(true);
      setActiveMode('more');
      setBottomTab('play');
      return;
    }
    recordRecentPlay({
      title: '翻翻棋-新手训练场',
      count: '2269',
      mode: 'more',
      route: 'more-game',
      moreGame: 'flip',
    });
    setActiveMoreGame(gameKind);
    setActiveMode('more');
    setBottomTab('play');
    setRoute('more-game');
  }

  const result = game.result;
  const isPlaySurface = route === 'game' || route === 'jieqi' || route === 'more-game' || (route === 'puzzle' && puzzleView === 'play');

  return (
    <main className={`app-shell ${isPlaySurface ? 'is-play-surface' : ''}`}>
      {!isPlaySurface && (
        <aside className="mode-rail" aria-label="玩法导航">
          <div className="rail-heading">
            <h2>象棋</h2>
          </div>
          <nav className="mode-list">
            {modeItems.map((item) => {
              const isModeActive =
                bottomTab === 'play' &&
                activeMode === item.id &&
                (route !== 'home' || activeMode !== 'xiangqi');
              return (
                <button
                  className={`mode-button ${isModeActive ? 'is-active' : ''}`}
                  key={item.id}
                  onClick={() => openMode(item.id)}
                >
                  <span className={`mode-token token-${item.id} is-image-token`} aria-hidden="true">
                    <img className="mode-token-image" src={item.icon} alt="" />
                  </span>
                  <span className="mode-copy">
                    <strong>{item.label}</strong>
                    <small>{item.hint}</small>
                    <em>{item.count}</em>
                  </span>
                  <ChevronRight size={24} aria-hidden="true" />
                </button>
              );
            })}
          </nav>
          <section className="recent-play" aria-label="最近玩过">
            <p>最近玩过</p>
            <button onClick={openRecentPlay}>
              <span className="recent-token is-image-token" aria-hidden="true">
                <img className="mode-token-image" src={recentIcon} alt="" />
              </span>
              <span>
                <strong>{recentPlay.title}</strong>
                <small>{recentPlay.count}</small>
              </span>
              <em>{recentPlay.playedAt}玩过</em>
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </section>
          <nav className="rail-tabs" aria-label="主导航">
            {bottomTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={bottomTab === tab.id ? 'is-active' : ''}
                  onClick={() => openBottomTab(tab.id)}
                >
                  <Icon size={24} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>
      )}

      <section className={`phone-stage ${isPlaySurface ? 'is-play-surface' : ''}`}>
        <header className={`top-bar ${isLobbyTitle ? 'is-game-lobby-title' : ''}`}>
          {isLobbyTitle ? (
            <div className="title-actions" aria-label="玩法页面操作">
              <button className="round-button" aria-label="返回首页" onClick={returnHomeLanding}>
                <ChevronLeft size={24} />
              </button>
              {activeMode !== 'puzzle' && activeMode !== 'more' && (
                <button className="round-button" aria-label="帮助" onClick={openModeHelp}>
                  <HelpCircle size={22} />
                </button>
              )}
            </div>
          ) : (
            <button className="round-button" aria-label="返回首页" onClick={requestHome}>
              <House size={18} />
            </button>
          )}
          <div className="top-title">
            <h1>{pageTitle}</h1>
          </div>
          <div className="top-bar-spacer" aria-hidden="true" />
        </header>

        <div className="content-frame" ref={contentFrameRef}>
          {route === 'home' && (
            <HomeScreen
              activeMode={activeMode}
              bottomTab={bottomTab}
              puzzleBoard={puzzleBoard}
              puzzleSelected={puzzleSelected}
              puzzleLegalMoves={puzzleLegalMoves}
              puzzleStatus={puzzleStatus}
              puzzleMoves={puzzleMoves}
              puzzleSeconds={puzzleSeconds}
              puzzleHintVisible={puzzleHintVisible}
              puzzleProgress={puzzleProgress}
              gobangBoard={gobangBoard}
              gobangStatus={gobangStatus}
              onStart={() => setRoute('lobby')}
              onStartRanked={startRankedSelection}
              onStartJieqi={openJieqiGame}
              onStartPuzzle={openDailyPuzzle}
              onOpenCampaign={openCampaignMap}
              onStartMoreGame={openMoreGame}
              onPuzzlePoint={selectPuzzlePoint}
              onPuzzleReset={resetPuzzle}
              onPuzzleHint={showPuzzleHint}
              onPuzzleComments={() => setPuzzleCommentsOpen(true)}
              onGobangPoint={playGobang}
              onGobangReset={resetGobang}
              onUnavailable={showToast}
              onRankedHelp={() => setRulesDialog('ranked')}
              onXiangqiFeature={openXiangqiFeature}
              onJieqiFeature={openJieqiFeature}
              onPuzzleFeature={openPuzzleFeature}
              onReturnHome={returnHomeLanding}
            />
          )}
          {route === 'lobby' && <LobbyScreen onFeature={openXiangqiFeature} />}
          {route === 'jieqi' && (
            <JieqiScreen
              rankedMode={selectedRankedJieqiMode}
              onBack={() => {
                setRoute('home');
                setActiveMode('jieqi');
                setBottomTab('play');
              }}
            />
          )}
          {route === 'puzzle' && puzzleView === 'campaign-map' && (
            <PuzzleCampaignMap
              currentLevel={campaignLevel}
              stamina={campaignStamina}
              onOpenRank={() => setCampaignRankOpen(true)}
              onStartLevel={startCampaignLevel}
            />
          )}
          {route === 'puzzle' && puzzleView === 'play' && (
            <PuzzleScreen
              attempt={puzzleAttempt}
              pieces={puzzleBoard}
              selectedPiece={puzzleSelected}
              legalMoves={puzzleLegalMoves}
              status={puzzleStatus}
              moves={puzzleMoves}
              seconds={puzzleSeconds}
              hintVisible={puzzleHintVisible}
              hintTarget={puzzleHintTarget}
              puzzle={activePuzzle}
              onSelectPoint={selectPuzzlePoint}
              onReset={undoPuzzleMove}
              onRestart={resetPuzzle}
              onHint={showPuzzleHint}
              onComments={() => setPuzzleCommentsOpen(true)}
              campaignLevel={campaignAttemptLevel}
              campaignStamina={campaignStamina}
              onBackCampaign={puzzleAttempt.entryId === 'campaign'
                ? openCampaignMap
                : () => {
                  setRoute('home');
                  setActiveMode('puzzle');
                  setBottomTab('play');
                }}
            />
          )}
          {route === 'more-game' && activeMoreGame === 'gobang' && (
            <GobangScreen
              board={gobangBoard}
              status={gobangStatus}
              lastMove={gobangLastMove}
              difficulty={gobangDifficulty}
              drawOffersLeft={gobangDrawOffersLeft}
              undoLeft={gobangUndoLeft}
              onBack={() => {
                setRoute('home');
                setActiveMode('more');
                setBottomTab('play');
              }}
              onDraw={offerGobangDraw}
              onPoint={playGobang}
              onReset={resetGobang}
              onUndo={undoGobangRound}
            />
          )}
          {route === 'more-game' && activeMoreGame === 'flip' && (
            <FlipChessScreen
              onBack={() => {
                setRoute('home');
                setActiveMode('more');
                setBottomTab('play');
              }}
            />
          )}
          {route === 'game' && (
            <GameScreen
              game={game}
              opponent={currentOpponent}
              moveHints={gameSettings.moveHints}
              suppressPausePanel={Boolean(confirmAction || gameIntroOpen || settingsOpen || analysisOpen)}
              analysisOpen={analysisOpen}
              menuOpen={gameMenuOpen}
              drawOffersLeft={drawOffersLeft}
              undoLeft={undoLeft}
              onSelectPoint={selectPoint}
              onResign={requestResign}
              onRequestExit={requestExit}
              onOpenChat={() => {
                setGameMenuOpen(false);
                setChatOpen(true);
              }}
              onOpenSettings={openSettings}
              onOpenAnalysis={openAnalysis}
              onCloseAnalysis={closeAnalysis}
              onTogglePause={togglePause}
              onToggleMenu={() => setGameMenuOpen((open) => !open)}
              onOfferDraw={offerDraw}
              onUndoRound={undoRound}
              onInviteSpectator={inviteSpectator}
            />
          )}
          {route === 'result' && (
            <ResultScreen
              result={result}
              opponent={currentOpponent}
              matchMode={matchMode}
              sessionLabel={sessionLabel}
              playSession={playSession}
              onReplay={() => {
                if (!result?.moves.length) {
                  showToast('暂无可复盘棋谱', 'warning');
                  return;
                }
                setReplayPlaying(false);
                setRoute('replay');
              }}
              onAgain={restartWithCurrentSession}
              onSwitchOpponent={switchOpponentAndRestart}
              onShare={() => showToast('分享功能为本地占位', 'info')}
            />
          )}
          {route === 'replay' && (
            <ReplayScreen
              result={result}
              opponent={currentOpponent}
              playSession={playSession}
              replayStep={replayStep}
              playing={replayPlaying}
              onStep={setReplayStep}
              onTogglePlay={() => {
                if (!result?.moves.length) {
                  showToast('暂无可复盘棋谱', 'warning');
                  return;
                }
                setReplayPlaying((playing) => !playing);
              }}
              onBack={() => setRoute('result')}
              onToast={showToast}
            />
          )}
          {route === 'profile' && <ProfileScreen />}
        </div>
        {matchingMode && <MatchingOverlay session={matchingMode.session} onCancel={() => setMatchingMode(null)} />}
        {confirmAction && (
          <ConfirmDialog
            action={confirmAction}
            onCancel={cancelGameAction}
            onConfirm={confirmGameAction}
          />
        )}
        {route === 'game' && gameIntroOpen && (
          <GameIntroDialog
            playSession={playSession}
            onLeave={leaveGameBeforeIntro}
            onStart={beginGameAfterIntro}
            onSwitchTable={switchTable}
          />
        )}
        {route === 'game' && settingsOpen && (
          <SettingsDialog settings={gameSettings} onClose={closeSettings} onToggle={toggleSetting} />
        )}
        {route === 'game' && chatOpen && (
          <ChatDrawer
            messages={chatMessages}
            tab={chatTab}
            text={chatText}
            onClose={() => setChatOpen(false)}
            onSend={sendChatMessage}
            onTab={setChatTab}
            onText={setChatText}
          />
        )}
        {((route === 'home' && activeMode === 'puzzle') || route === 'puzzle') && puzzleCommentsOpen && (
          <PuzzleCommentDialog
            attempt={puzzleAttempt}
            commentText={puzzleCommentText}
            onClose={() => setPuzzleCommentsOpen(false)}
            onCommentText={setPuzzleCommentText}
            onSend={() => {
              setPuzzleAttempt((current) => addXiangqiPuzzleComment(current, puzzleCommentText));
              setPuzzleCommentText('');
              showToast('评论已写入本地记录', 'success');
            }}
          />
        )}
        {((route === 'home' && activeMode === 'puzzle') || (route === 'puzzle' && puzzleView === 'play')) && puzzleAttempt.entryId !== 'campaign' && puzzleAttempt.status === 'impossible' && (
          <PuzzleImpossibleDialog
            message={puzzleAttempt.impossiblePrompt ?? '当前已无法过关，是否重来'}
            onCancel={() => showToast('可从菜单选择重来', 'info')}
            onRestart={resetPuzzle}
          />
        )}
        {route === 'puzzle' && puzzleView === 'play' && puzzleAttempt.entryId === 'campaign' && puzzleSettlementOpen && campaignResultKind && (
          <PuzzleCampaignResultDialog
            attempt={puzzleAttempt}
            level={campaignAttemptLevel}
            resultKind={campaignResultKind}
            onHelp={() => showToast('求助好友为本地安全占位', 'info')}
            onRestart={resetPuzzle}
            onShowOff={() => showToast('炫耀入口为本地安全占位', 'info')}
            onNext={nextCampaignLevel}
          />
        )}
        {((route === 'home' && activeMode === 'puzzle') || (route === 'puzzle' && puzzleView === 'play')) && puzzleAttempt.entryId !== 'campaign' && puzzleSettlementOpen && puzzleAttempt.status === 'solved' && (
          <PuzzleSettlementDialog
            attempt={puzzleAttempt}
            onClose={() => setPuzzleSettlementOpen(false)}
            onShowOff={() => showToast('炫耀入口为本地安全占位', 'info')}
          />
        )}
        {route === 'puzzle' && campaignRankOpen && (
          <PuzzleCampaignRankDialog
            currentLevel={campaignLevel}
            onClose={() => setCampaignRankOpen(false)}
          />
        )}
        {featureDialog && (
          <FeatureActionDialog
            state={featureDialog}
            puzzleProgress={puzzleProgress}
            selectedCoinRowId={selectedCoinRowId}
            selectedMinuteMode={selectedMinuteMode}
            selectedHuashanMode={selectedHuashanMode}
            selectedFriendMode={selectedFriendMode}
            selectedXiangqiDifficulty={selectedXiangqiDifficulty}
            kifuRecords={kifuRecords}
            selectedKifuId={selectedKifuId}
            onClose={() => setFeatureDialog(null)}
            onPrimary={runFeaturePrimaryAction}
            onSelectCard={selectFeatureCard}
            onSecondary={runFeatureSecondaryAction}
          />
        )}
        {gobangDifficultyOpen && (
          <GobangDifficultyDialog
            selected={gobangDifficulty}
            onClose={() => setGobangDifficultyOpen(false)}
            onSelect={startGobangWithDifficulty}
          />
        )}
        {rulesDialog && <RulesDialog kind={rulesDialog} onClose={() => setRulesDialog(null)} />}
        {toast && <Toast key={toast.id} toast={toast} />}

        <nav className="bottom-tabs" aria-label="主导航">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={bottomTab === tab.id ? 'is-active' : ''}
                onClick={() => openBottomTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </section>
    </main>
  );
}

function HomeScreen({
  activeMode,
  bottomTab,
  puzzleBoard,
  puzzleSelected,
  puzzleLegalMoves,
  puzzleStatus,
  puzzleMoves,
  puzzleSeconds,
  puzzleHintVisible,
  puzzleProgress,
  gobangBoard,
  gobangStatus,
  onStart,
  onStartRanked,
  onStartJieqi,
  onStartPuzzle,
  onOpenCampaign,
  onStartMoreGame,
  onPuzzlePoint,
  onPuzzleReset,
  onPuzzleHint,
  onPuzzleComments,
  onGobangPoint,
  onGobangReset,
  onUnavailable,
  onRankedHelp,
  onXiangqiFeature,
  onJieqiFeature,
  onPuzzleFeature,
  onReturnHome,
}: {
  activeMode: Mode;
  bottomTab: BottomTab;
  puzzleBoard: Piece[];
  puzzleSelected: string | null;
  puzzleLegalMoves: Position[];
  puzzleStatus: PuzzleState;
  puzzleMoves: number;
  puzzleSeconds: number;
  puzzleHintVisible: boolean;
  puzzleProgress: PuzzleProgress;
  gobangBoard: number[][];
  gobangStatus: string;
  onStart: () => void;
  onStartRanked: (selection: RankedStartSelection) => void;
  onStartJieqi: () => void;
  onStartPuzzle: () => void;
  onOpenCampaign: () => void;
  onStartMoreGame: (gameKind: MoreGameKind) => void;
  onPuzzlePoint: (point: Position) => void;
  onPuzzleReset: () => void;
  onPuzzleHint: () => void;
  onPuzzleComments: () => void;
  onGobangPoint: (x: number, y: number) => void;
  onGobangReset: () => void;
  onUnavailable: (message: string, kind?: ToastKind) => void;
  onRankedHelp: () => void;
  onXiangqiFeature: (entryId: XiangqiFeatureEntryId) => void;
  onJieqiFeature: (entryId: JieqiFeatureEntryId) => void;
  onPuzzleFeature: (entryId: string) => void;
  onReturnHome: () => void;
}) {
  if (bottomTab !== 'play') {
    return <TabShell tab={bottomTab} />;
  }

  if (activeMode === 'puzzle') {
    return (
      <PuzzleLobbyScreen
        progress={puzzleProgress}
        onOpenDaily={onStartPuzzle}
        onOpenCampaign={onOpenCampaign}
        onFeature={onPuzzleFeature}
      />
    );
  }

  if (activeMode === 'jieqi') return <JieqiLobbyScreen onFeature={onJieqiFeature} />;
  if (activeMode === 'more') return <MoreGamesLobbyScreen onOpenGame={onStartMoreGame} onUnavailable={onUnavailable} />;
  if (activeMode === 'ranked') return <RankedScreen onStart={onStartRanked} onBack={onReturnHome} onHelp={onRankedHelp} />;

  return (
    <section className="home-layout">
      <button className="home-hero-banner" onClick={() => onUnavailable('活动入口后续开放', 'info')}>
        <span className="hero-copy">
          <small>玩恭喜发财 · 爆活费</small>
          <strong>新版本福利倒计时</strong>
          <em>前往参与</em>
        </span>
        <span className="hero-date-chip" aria-hidden="true">
          6.1
          <small>新版</small>
        </span>
        <span className="fortune-badge" aria-hidden="true">
          <Coins size={42} />
        </span>
      </button>

      <div className="home-feed">
        <article className="home-card certification-card">
          <span className="feed-icon" aria-hidden="true">
            <Medal size={36} />
          </span>
          <div className="home-card-copy">
            <h2>棋力认证第4届</h2>
            <p>参与拿实体证书!</p>
            <small>今日 9410 位棋友已入场</small>
          </div>
          <button className="pill-action" onClick={onStart}>
            立即参与
          </button>
        </article>

        <article className="home-card friend-card">
          <span className="avatar-placeholder" aria-hidden="true" />
          <div className="home-card-copy">
            <h2>暂无好友</h2>
            <p>看看附近棋友</p>
            <small>同城切磋 · 好友房邀请</small>
          </div>
          <button className="pill-action" onClick={() => onUnavailable('好友邀请后续开放', 'info')}>
            前往
          </button>
        </article>

        <article className="home-card news-card">
          <div className="news-heading">
            <span className="piece-stamp" aria-hidden="true">将</span>
            <div>
              <h2>6月1日10点新版本上线!</h2>
              <p>登录领身份卡，免费福利拿到手软&gt;&gt;</p>
              <small>身份卡、限时任务和新版活动同步开放</small>
            </div>
            <strong>
              <b>6天</b>
              <span>新版倒计时</span>
            </strong>
          </div>
          <button className="update-strip" onClick={() => onUnavailable('版本福利后续开放', 'info')}>
            6.1重大版本更新
            <span>抢先预览&gt;&gt;</span>
          </button>
        </article>

        <article className="home-card challenge-card">
          <span className="feed-icon orange" aria-hidden="true">
            <Flag size={34} />
          </span>
          <div className="home-card-copy">
            <h2>残局挑战</h2>
            <p>北京市北京市仅11839人能破</p>
            <strong>【残局挑战】490期,5月25日</strong>
            <small>1分钟内 · 已阅999 · 评论326</small>
          </div>
          <button className="pill-action secondary" onClick={onStartPuzzle}>
            去挑战
          </button>
        </article>
      </div>

      <div className="home-side-preview">
        <ActivityWidget />
      </div>
    </section>
  );
}

function ActivityWidget() {
  return (
    <div className="activity-widget" aria-label="棋局预览">
      <div className="mini-board">
        <ChessBoard pieces={startingPieces.slice(0, 16)} marks={[{ x: 1, y: 2 }, { x: 7, y: 2 }]} compact />
      </div>
      <div className="activity-widget-copy">
        <p className="eyebrow">正在热战</p>
        <strong>楚河快棋局</strong>
        <span>12 人围观 · 本地预览</span>
      </div>
    </div>
  );
}

function getPuzzleFeatureIcon(entry: PuzzleFeatureEntry): IconComponent {
  if (entry.kind === 'scored') return Medal;
  if (entry.kind === 'challenge') return Flag;
  if (entry.kind === 'study') return PenLine;
  if (entry.kind === 'coin') return Gem;
  if (entry.kind === 'hot') return Flame;
  if (entry.kind === 'training') return PenLine;
  if (entry.kind === 'theme') return Flame;
  if (entry.kind === 'mistakes') return RotateCcw;
  if (entry.kind === 'favorites') return Star;
  if (entry.kind === 'ranking') return Trophy;
  if (entry.kind === 'comments') return MessageCircle;
  if (entry.kind === 'analysis') return Lightbulb;
  if (entry.kind === 'restart') return RotateCcw;
  return Swords;
}

function getPuzzleEntryMeta(
  entry: PuzzleFeatureEntry,
  action: ReturnType<typeof getPuzzleFeatureAction>,
  progress: PuzzleProgress,
): string {
  if (entry.kind === 'mistakes') return `${progress.mistakePuzzleIds.length}题`;
  if (entry.kind === 'favorites') return `${progress.favoritePuzzleIds.length}题`;
  if (entry.kind === 'ranking') return `${progress.bestStreak}连胜`;
  if (entry.kind === 'comments') return `${dailyPuzzle.stats.commentCount}条`;
  if (entry.kind === 'campaign') return '1/720关';
  if (entry.kind === 'scored') return '0分';
  if (entry.kind === 'challenge' || entry.kind === 'study' || entry.kind === 'coin') return '';
  if (entry.kind === 'hot') return '0/282关';
  if (action.set) {
    const setProgress = progress.trainingSetProgress[action.set.id];
    return setProgress ? `${setProgress.completed}/${setProgress.total}` : `${action.set.estimatedMinutes}分钟`;
  }
  return entry.badge ?? '';
}

function PuzzleLobbyScreen({
  progress,
  onOpenDaily,
  onOpenCampaign,
  onFeature,
}: {
  progress: PuzzleProgress;
  onOpenDaily: () => void;
  onOpenCampaign: () => void;
  onFeature: (entryId: string) => void;
}) {
  const stats = getPuzzleDashboardStats(progress);
  const moduleStats = getXiangqiPuzzleModuleStats();
  const puzzleEntries = puzzlePanelEntryIds
    .map((entryId) => puzzleFeatureEntries.find((entry) => entry.id === entryId))
    .filter((entry): entry is PuzzleFeatureEntry => Boolean(entry));

  return (
    <section className="puzzle-lobby" aria-label="残局挑战入口">
      <div className="puzzle-resources" aria-label="残局资源">
        <span>
          <Gem size={17} />
          3583
        </span>
        <span>
          <Zap size={17} />
          8
        </span>
        <span>
          <Lightbulb size={17} />
          0
        </span>
      </div>

      <div className="puzzle-panel">
        <button className="daily-puzzle-card" onClick={onOpenDaily}>
          <span className="daily-board" aria-hidden="true">
            <ChessBoard pieces={dailyPuzzle.pieces} compact thumbnail />
          </span>
          <span className="daily-copy">
            <strong>每日残局</strong>
            <small>2026年05月28日</small>
            <span>累计<b>{moduleStats.challengeCount}</b>人挑战,<b>{Math.round(moduleStats.passRate * 100)}%</b>过关</span>
            <span>{moduleStats.regionLabel}仅<b>{moduleStats.regionPassed}</b>人能破</span>
          </span>
        </button>

        <div className="puzzle-entry-list">
          {puzzleEntries.map((entry, index) => {
            const Icon = getPuzzleFeatureIcon(entry);
            const action = getPuzzleFeatureAction(entry.id, progress);
            const standalone = index === 1 || entry.kind === 'coin';
            return (
              <Fragment key={entry.id}>
                {standalone && index > 0 && <div className="puzzle-entry-gap" />}
                <button
                  className="puzzle-entry"
                  onClick={() => {
                    if (entry.id === 'campaign') {
                      onOpenCampaign();
                      return;
                    }
                    onFeature(entry.id);
                  }}
                >
                  <span className="puzzle-entry-icon" aria-hidden="true">
                    <Icon size={26} />
                  </span>
                  <span className="puzzle-entry-copy">
                    <strong>{entry.title}</strong>
                    <small>{entry.subtitle}</small>
                  </span>
                  <span className="puzzle-entry-meta">{getPuzzleEntryMeta(entry, action, progress)}</span>
                  <ChevronRight size={22} aria-hidden="true" />
                </button>
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type CampaignNodeKind = 'flag' | 'battle' | 'camp' | 'tower' | 'city' | 'fort' | 'gate' | 'treasure';
type CampaignGateArt = 1 | 2 | 3 | 4;
type CampaignNode = {
  level: number;
  x: number;
  y: number;
  landmark: string;
  kind: CampaignNodeKind;
  gate: CampaignGateArt;
  treasure?: boolean;
};

const campaignNodeLayout: CampaignNode[] = [
  { level: 1, x: 38, y: 94, landmark: '营门', kind: 'camp', gate: 1 },
  { level: 2, x: 60, y: 87, landmark: '前哨', kind: 'camp', gate: 1 },
  { level: 3, x: 43, y: 79, landmark: '战', kind: 'battle', gate: 1 },
  { level: 4, x: 67, y: 71, landmark: '营', kind: 'camp', gate: 1 },
  { level: 5, x: 52, y: 62, landmark: '揭竿而起', kind: 'treasure', gate: 2, treasure: true },
  { level: 6, x: 31, y: 55, landmark: '战', kind: 'battle', gate: 2 },
  { level: 7, x: 55, y: 48, landmark: '塔', kind: 'tower', gate: 2 },
  { level: 8, x: 78, y: 41, landmark: '台', kind: 'camp', gate: 2 },
  { level: 9, x: 59, y: 34, landmark: '城', kind: 'city', gate: 3 },
  { level: 10, x: 36, y: 27, landmark: '破釜沉舟', kind: 'treasure', gate: 3, treasure: true },
  { level: 11, x: 66, y: 21, landmark: '垒', kind: 'fort', gate: 3 },
  { level: 12, x: 84, y: 15, landmark: '亭', kind: 'tower', gate: 3 },
  { level: 13, x: 60, y: 11, landmark: '营', kind: 'camp', gate: 4 },
  { level: 14, x: 38, y: 8, landmark: '塔', kind: 'tower', gate: 4 },
  { level: 15, x: 18, y: 5, landmark: '巨鹿之战', kind: 'treasure', gate: 4, treasure: true },
  { level: 16, x: 70, y: 3, landmark: '关', kind: 'gate', gate: 4 },
];

function PuzzleCampaignMap({
  currentLevel,
  stamina,
  onOpenRank,
  onStartLevel,
}: {
  currentLevel: number;
  stamina: number;
  onOpenRank: () => void;
  onStartLevel: (level?: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    scroll.scrollTop = scroll.scrollHeight - scroll.clientHeight;
  }, [currentLevel]);

  const routeLinks = campaignNodeLayout.slice(1).map((node, index) => {
    const from = campaignNodeLayout[index];
    const dx = node.x - from.x;
    const dy = node.y - from.y;
    return {
      key: `${from.level}-${node.level}`,
      active: node.level <= currentLevel,
      unlocking: node.level === currentLevel && currentLevel > 1,
      style: {
        left: `${from.x}%`,
        top: `${from.y}%`,
        width: `${Math.hypot(dx, dy)}%`,
        transform: `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`,
      } as CSSProperties,
    };
  });

  return (
    <section className="campaign-map" aria-label="残局闯关地图">
      <div className="campaign-map-top">
        <span>
          <Zap size={17} />
          {stamina}/10
        </span>
      </div>
      <div className="campaign-scroll" ref={scrollRef}>
        <div className="campaign-map-canvas">
          <div className="campaign-path" aria-hidden="true" />
          {routeLinks.map((link) => (
            <span
              aria-hidden="true"
              className={`campaign-link ${link.active ? 'is-active' : ''} ${link.unlocking ? 'is-unlocking' : ''}`}
              key={link.key}
              style={link.style}
            />
          ))}
          {campaignNodeLayout.map((node) => {
            const completed = node.level < currentLevel;
            const current = node.level === currentLevel;
            const locked = node.level > currentLevel;
            const isFlag = node.kind === 'flag';
            const title = node.level % 5 === 0 ? node.landmark : `第${node.level}关`;
            return (
              <button
                className={`campaign-node campaign-node-${node.kind} ${completed ? 'is-completed' : ''} ${current ? 'is-current' : ''} ${locked ? 'is-locked' : ''}`}
                disabled={locked}
                key={node.level}
                onClick={() => onStartLevel(node.level)}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <span className="campaign-node-landmark">
                  {isFlag ? (
                    <span className="campaign-war-flag" aria-hidden="true">
                      <i />
                      <b>{node.landmark}</b>
                    </span>
                  ) : (
                    <span className={`campaign-gate-art is-gate-${node.gate} ${node.treasure ? 'is-boss' : ''}`} aria-hidden="true">
                      <i>{node.treasure ? <Gift size={16} /> : node.level}</i>
                    </span>
                  )}
                </span>
                <em>{title}</em>
              </button>
            );
          })}
        </div>
      </div>
      <div className="campaign-map-actions">
        <button onClick={onOpenRank}>排行榜</button>
        <button className="primary-action" onClick={() => onStartLevel(currentLevel)}>
          快速开始
        </button>
        <button>更多关卡</button>
      </div>
    </section>
  );
}

function PuzzleScreen({
  attempt,
  pieces,
  selectedPiece,
  legalMoves,
  status,
  moves,
  seconds,
  hintVisible,
  hintTarget,
  puzzle,
  onSelectPoint,
  onReset,
  onRestart,
  onHint,
  onComments,
  campaignLevel,
  campaignStamina,
  onBackCampaign,
}: {
  attempt: XiangqiPuzzleAttempt;
  pieces: Piece[];
  selectedPiece: string | null;
  legalMoves: Position[];
  status: PuzzleState;
  moves: number;
  seconds: number;
  hintVisible: boolean;
  hintTarget: Position | null;
  puzzle: Puzzle;
  onSelectPoint: (point: Position) => void;
  onReset: () => void;
  onRestart: () => void;
  onHint: () => void;
  onComments: () => void;
  campaignLevel: number;
  campaignStamina: number;
  onBackCampaign: () => void;
}) {
  const isCampaign = attempt.entryId === 'campaign';
  const isImmersivePuzzle = isCampaign || attempt.entryId === 'daily';
  const statusText = status === 'solved'
    ? '挑战成功'
    : status === 'impossible' || status === 'failed'
      ? '当前已无法过关'
      : puzzle.mode === 'free-mate'
        ? attempt.session.turn === puzzle.sideToMove
          ? '红方将死过关'
          : '黑方引擎应手'
        : `${attempt.session.turn === 'red' ? '红' : '黑'}方按最优路线`;
  const hintArrow = hintVisible ? attempt.session.revealedHint?.arrow : undefined;
  const hintDetail = hintVisible && attempt.session.revealedHint
    ? `${attempt.session.revealedHint.title}${attempt.session.revealedHint.detail ? `：${attempt.session.revealedHint.detail}` : ''}`
    : puzzle.mode === 'free-mate' ? '提示会给出当前推荐杀法方向' : '提示会按当前正解进度解释下一手';
  const marks = hintVisible && hintTarget ? [...legalMoves, hintTarget] : legalMoves;
  const introRows = getXiangqiPuzzleIntroRows(attempt.entryId);
  const menuActions = getXiangqiPuzzleMenuActions(attempt);

  if (isImmersivePuzzle) {
    return (
      <section className="campaign-play" aria-label={isCampaign ? '残局闯关棋局' : '每日残局棋局'}>
        <aside className="campaign-player-card">
          <div className="campaign-avatar" aria-hidden="true">
            {isCampaign ? campaignLevel >= 5 ? <Flag size={26} /> : <Swords size={26} /> : <Medal size={26} />}
          </div>
          <strong>{isCampaign ? `第${campaignLevel}关` : '每日残局'}</strong>
          <span>{puzzle.title}</span>
        </aside>
        <div className="campaign-board-wrap">
          <ChessBoard
            pieces={pieces}
            selectedPiece={selectedPiece ?? undefined}
            marks={marks}
            hintArrow={hintArrow}
            onSelectPoint={onSelectPoint}
            compact
          />
        </div>
        <aside className="campaign-rival-card">
          <span className="campaign-stamina">
            <Zap size={17} />
            {isCampaign ? campaignStamina : attempt.resources.stamina}/10
          </span>
          <div className="campaign-avatar is-rival" aria-hidden="true">
            <UserRound size={25} />
          </div>
          <strong>{moves}步</strong>
        </aside>
        <nav className="campaign-tool-bar" aria-label={isCampaign ? '残局闯关局内工具' : '每日残局局内工具'}>
          <button onClick={onBackCampaign}>
            <Home size={21} />
            <span>菜单</span>
          </button>
          <button onClick={onReset}>
            <RotateCcw size={21} />
            <span>悔棋</span>
            <em>{Math.max(0, 2 - attempt.undos)}</em>
          </button>
          <button onClick={onHint}>
            <Lightbulb size={21} />
            <span>提示</span>
            <em>{attempt.resources.hintCards}</em>
          </button>
          <button onClick={onRestart}>
            <RefreshCcw size={21} />
            <span>重开</span>
          </button>
          <button onClick={() => onComments()}>
            <Share2 size={21} />
            <span>分享</span>
          </button>
        </nav>
      </section>
    );
  }

  return (
    <section className="mode-shell">
      <div className="section-title">
        <p className="eyebrow">{isCampaign ? '残局闯关' : '每日残局'}</p>
        <h2>{puzzle.title}</h2>
      </div>
      <div className="feature-grid">
        <ModeCard title="评分" value={`${calculatePuzzleScore(attempt)}分`} />
        <ModeCard title="步数" value={`${moves}步`} />
        <ModeCard title="计时" value={formatClock(seconds)} />
        <ModeCard title="状态" value={statusText} />
      </div>
      <div className="mode-play-grid">
        <ChessBoard pieces={pieces} selectedPiece={selectedPiece ?? undefined} marks={marks} hintArrow={hintArrow} onSelectPoint={onSelectPoint} compact />
        <div className="feed-list">
          {introRows.slice(2).map((row) => (
            <InfoRow title={row.title} detail={row.detail} key={row.title} />
          ))}
          <InfoRow title="题源" detail={puzzle.source ?? '本地精选残局'} />
          <InfoRow title="杀法" detail={puzzle.motif ?? puzzle.goal.description} />
          <InfoRow title="局内菜单" detail={menuActions.join(' / ')} />
          <InfoRow title="推荐" detail={hintDetail} />
          <button className="full-width" onClick={onHint}>
            <Medal size={18} />
            提示
          </button>
          <button className="full-width" onClick={onComments}>
            <MessageCircle size={18} />
            评论
          </button>
          <button className="primary-action full-width" onClick={onRestart}>
            <RotateCcw size={18} />
            重来
          </button>
        </div>
      </div>
    </section>
  );
}

function PuzzleCommentDialog({
  attempt,
  commentText,
  onClose,
  onCommentText,
  onSend,
}: {
  attempt: XiangqiPuzzleAttempt;
  commentText: string;
  onClose: () => void;
  onCommentText: (text: string) => void;
  onSend: () => void;
}) {
  const panel = createXiangqiPuzzleCommentPanel(attempt);
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="confirm-card puzzle-comment-card">
        <button className="round-button" aria-label="关闭评论" onClick={onClose}>
          <X size={18} />
        </button>
        <p className="eyebrow">{panel.title}</p>
        <h2>{panel.topic} · {attempt.title}</h2>
        <div className="intro-rules">
          <InfoRow title="参与人数" detail={panel.challengeText} />
          <InfoRow title="过关率" detail={panel.passRateText} />
          <InfoRow title="已阅" detail={panel.readAvatars.join('、')} />
          {panel.comments.slice(0, 3).map((comment) => (
            <InfoRow title={comment.author} detail={comment.content} key={comment.id} />
          ))}
        </div>
        <div className="chat-input-row">
          <input
            maxLength={45}
            onChange={(event) => onCommentText(event.target.value)}
            placeholder={panel.inputPlaceholder}
            value={commentText}
          />
          <button className="primary-action" onClick={onSend}>发送</button>
        </div>
      </div>
    </div>
  );
}

function PuzzleImpossibleDialog({
  message,
  onCancel,
  onRestart,
}: {
  message: string;
  onCancel: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="confirm-card">
        <p className="eyebrow">残局判题</p>
        <h2>{message}</h2>
        <span>这一路线已偏离最优解，重来会保留提示与重来次数记录。</span>
        <div className="result-actions">
          <button onClick={onCancel}>取消</button>
          <button className="primary-action" onClick={onRestart}>
            <RotateCcw size={18} />
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

function PuzzleSettlementDialog({
  attempt,
  onClose,
  onShowOff,
}: {
  attempt: XiangqiPuzzleAttempt;
  onClose: () => void;
  onShowOff: () => void;
}) {
  const settlement = buildXiangqiPuzzleSettlement(attempt);
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="confirm-card puzzle-comment-card">
        <p className="eyebrow">{settlement.statusLabel}</p>
        <h2>{settlement.timeLabel}</h2>
        <span>{settlement.regionRankText}，{settlement.nationalPercentText}</span>
        <div className="intro-rules">
          <InfoRow title="好友" detail={settlement.friendText} />
          <InfoRow title="奖励" detail={settlement.rewardText} />
          {settlement.rows.map((row) => (
            <InfoRow title={row.title} detail={row.detail} key={row.title} />
          ))}
        </div>
        <div className="result-actions">
          <button onClick={onClose}>{settlement.buttons[0]}</button>
          <button className="primary-action" onClick={onShowOff}>
            <Share2 size={18} />
            {settlement.buttons[1]}
          </button>
        </div>
      </div>
    </div>
  );
}

function PuzzleCampaignResultDialog({
  attempt,
  level,
  resultKind,
  onHelp,
  onRestart,
  onShowOff,
  onNext,
}: {
  attempt: XiangqiPuzzleAttempt;
  level: number;
  resultKind: Exclude<CampaignResultKind, null>;
  onHelp: () => void;
  onRestart: () => void;
  onShowOff: () => void;
  onNext: () => void;
}) {
  const solved = resultKind === 'success';
  const chapterNode = campaignNodeLayout.find((node) => node.level === level);
  const chapter = chapterNode?.treasure ? `${level}${chapterNode.landmark}` : `第${level}关`;
  const puzzle = getPuzzleById(attempt.puzzleId) ?? dailyPuzzle;
  const stepText = `${Math.max(1, attempt.session.steps || puzzle.goal.maxMoves || 1)}步绝杀`;
  return (
    <div className="campaign-result-layer" role="dialog" aria-modal="true">
      <div className="campaign-result-card">
        <div className={`campaign-result-ribbon ${solved ? 'is-success' : 'is-failure'}`}>
          {solved ? '闯关成功' : '闯关失败'}
        </div>
        <p>楚汉争霸-{chapter},{stepText}</p>
        <div className="campaign-result-board">
          <ChessBoard pieces={attempt.session.pieces} compact />
        </div>
        {solved ? (
          <div className="campaign-reward-row">
            <strong>已获得过关奖励</strong>
            <span>
              <Zap size={18} />
              体力卡x{level % 5 === 0 ? 2 : 1}
            </span>
            <button onClick={onShowOff}>
              <Video size={17} />
              双倍领取
            </button>
          </div>
        ) : (
          <div className="campaign-reward-row">
            <strong>别灰心，送你道具助力通过</strong>
            <span>
              <Lightbulb size={18} />
              提示卡x1
            </span>
            <span>
              <RotateCcw size={18} />
              悔棋卡x1
            </span>
          </div>
        )}
        <div className="campaign-result-actions">
          <button onClick={solved ? onShowOff : onHelp}>{solved ? '炫耀一下' : '求助好友'}</button>
          <button className="primary-action" onClick={solved ? onNext : onRestart}>
            {solved ? '下一关' : '重新挑战'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PuzzleCampaignRankDialog({
  currentLevel,
  onClose,
}: {
  currentLevel: number;
  onClose: () => void;
}) {
  const rows = [
    { rank: 1, name: 'Meteor', detail: `第${currentLevel}关,${Math.max(1, currentLevel - 2)}步` },
    { rank: 2, name: '冬日暖阳', detail: '第720关,15步' },
    { rank: 3, name: '陈胜', detail: '第720关,21步' },
    { rank: 4, name: '匿名玩家', detail: '第720关,21步' },
    { rank: 5, name: '开半', detail: '第720关,21步' },
  ];
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="campaign-rank-card">
        <button className="round-button" aria-label="关闭闯关榜" onClick={onClose}>
          <X size={18} />
        </button>
        <p className="eyebrow">闯关榜</p>
        <div className="campaign-rank-tabs">
          <button className="is-active">好友</button>
          <button>区域</button>
        </div>
        <div className="campaign-rank-list">
          {rows.map((row) => (
            <div className="campaign-rank-row" key={row.rank}>
              <span>{row.rank}</span>
              <UserRound size={26} />
              <strong>{row.name}</strong>
              <em>{row.detail}</em>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JieqiScreen({
  rankedMode = 'ten-minute',
  onBack,
}: {
  rankedMode?: XiangqiMinuteArenaMode;
  onBack: () => void;
}) {
  const [jieqiState, setJieqiState] = useState<JieqiBoardState>(() => createJieqiBoardState());
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [status, setStatus] = useState('红方先行，暗子移动后揭示');
  const [settlement, setSettlement] = useState<JieqiSettlement | null>(null);
  const [jieqiMenuOpen, setJieqiMenuOpen] = useState(false);
  const [jieqiIntroOpen, setJieqiIntroOpen] = useState(true);
  const [jieqiUndoLeft, setJieqiUndoLeft] = useState(3);
  const [jieqiUndoStack, setJieqiUndoStack] = useState<Array<{
    state: JieqiBoardState;
    selectedPiece: string | null;
    legalMoves: Position[];
    status: string;
    settlement: JieqiSettlement | null;
    moveCount: number;
  }>>([]);
  const [moveCount, setMoveCount] = useState(0);
  const jieqiAiRequestRef = useRef(0);
  const pieces = jieqiState.pieces;
  const displayPieces = toDisplayJieqiPieces(pieces, '');
  const captureStats = getJieqiCaptureStats(jieqiState);
  const admission = getJieqiAdmission('rating', { gold: 0, silver: 3830 });
  const rankedSession = getMinuteArenaSession(rankedMode);
  const rankedTime = rankedSession.timeControl;
  const rankedTotalClock = formatClock(rankedTime.totalMinutes * 60);
  const rankedSelfClock = formatClock(rankedTime.totalMinutes * 60 - 2);
  const rankedStepClock = formatClock(rankedTime.openingMoveSeconds);
  const rankedSelfStepClock = formatClock(Math.max(0, rankedTime.openingMoveSeconds - 2));
  const rankedTimeLabel = `${rankedTime.totalMinutes}分钟,步时${rankedTime.moveSeconds}秒(前${rankedTime.openingMoveCount}步=${rankedTime.openingMoveSeconds}秒)`;
  const hiddenCount = Object.values(jieqiState.lifecycles).filter((item) => item.state === 'hidden').length;
  const recentJieqiMove = jieqiState.moves[jieqiState.moves.length - 1] ?? null;

  useEffect(() => () => {
    jieqiAiRequestRef.current += 1;
  }, []);

  function selectJieqiPoint(point: Position) {
    if (jieqiIntroOpen) return;
    if (/胜|结束|思考/.test(status) || settlement) return;
    const selected = selectedPiece ? pieces.find((piece) => piece.id === selectedPiece) : undefined;
    const pointPiece = getJieqiPieceAt(pieces, point);
    if (selected && hasPoint(legalMoves, point)) {
      setJieqiUndoStack((stack) => ([
        ...stack,
        {
          state: jieqiState,
          selectedPiece,
          legalMoves: [...legalMoves],
          status,
          settlement,
          moveCount,
        },
      ].slice(-3)));
      const afterPlayer = applyJieqiStateMove(jieqiState, selected.id, point);
      const playerResult = afterPlayer.moves[afterPlayer.moves.length - 1];
      if (!playerResult) return;
      setSelectedPiece(null);
      setLegalMoves([]);
      setMoveCount(afterPlayer.moveCount);
      if (playerResult.captured?.kind === 'king') {
        setJieqiState(afterPlayer);
        setStatus('揭棋评测 · 我方胜');
        setSettlement(settleJieqiRating('win', afterPlayer));
        return;
      }
      setJieqiState(afterPlayer);
      setStatus('AI 正在思考');
      const requestId = jieqiAiRequestRef.current + 1;
      jieqiAiRequestRef.current = requestId;
      window.setTimeout(() => {
        if (jieqiAiRequestRef.current !== requestId) return;
        void chooseJieqiComputerMove(afterPlayer.pieces, 'black', { turnIndex: afterPlayer.moveCount }).then((aiMove) => {
          if (jieqiAiRequestRef.current !== requestId) return;
          if (!aiMove) {
            setStatus('揭棋评测 · 我方胜');
            setSettlement(settleJieqiRating('win', afterPlayer));
            return;
          }
          const afterAi = applyJieqiStateMove(afterPlayer, aiMove.pieceId, aiMove.to);
          const aiResult = afterAi.moves[afterAi.moves.length - 1];
          if (!aiResult || afterAi.moveCount === afterPlayer.moveCount) {
            setStatus('揭棋评测 · 我方胜');
            setSettlement(settleJieqiRating('win', afterPlayer));
            return;
          }
          setJieqiState(afterAi);
          setMoveCount(afterAi.moveCount);
          if (aiResult.captured?.kind === 'king') {
            setStatus('揭棋评测 · 对方胜');
            setSettlement(settleJieqiRating('loss', afterAi));
          } else {
            setStatus('AI 已应手，红方继续');
          }
        });
      }, 450);
      return;
    }
    if (pointPiece?.side === 'red') {
      setSelectedPiece(pointPiece.id);
      setLegalMoves(getJieqiLegalMoves(pieces, pointPiece.id));
      setStatus(pointPiece.hidden ? '暗子按所在位置走法生成落点' : `${pointPiece.label}可走`);
      return;
    }
    setSelectedPiece(null);
    setLegalMoves([]);
  }

  function resetJieqi() {
    jieqiAiRequestRef.current += 1;
    setJieqiState(createJieqiBoardState());
    setSelectedPiece(null);
    setLegalMoves([]);
    setStatus('红方先行，暗子移动后揭示');
    setSettlement(null);
    setJieqiMenuOpen(false);
    setJieqiIntroOpen(true);
    setJieqiUndoLeft(3);
    setJieqiUndoStack([]);
    setMoveCount(0);
  }

  function undoJieqiRound() {
    jieqiAiRequestRef.current += 1;
    if (jieqiUndoLeft <= 0) {
      setStatus('悔棋次数已用完');
      setJieqiMenuOpen(false);
      return;
    }
    const snapshot = jieqiUndoStack[jieqiUndoStack.length - 1];
    if (!snapshot) {
      setStatus('暂无可悔棋步数');
      setJieqiMenuOpen(false);
      return;
    }
    setJieqiState(snapshot.state);
    setSelectedPiece(snapshot.selectedPiece);
    setLegalMoves(snapshot.legalMoves);
    setStatus('已悔棋，红方继续');
    setSettlement(snapshot.settlement);
    setMoveCount(snapshot.moveCount);
    setJieqiUndoLeft((left) => Math.max(0, left - 1));
    setJieqiUndoStack((stack) => stack.slice(0, -1));
    setJieqiMenuOpen(false);
  }

  return (
    <section className="jieqi-table" aria-label="揭棋对局">
      <button className="jieqi-spectator-button" onClick={() => setStatus(getJieqiPlaceholder('invite-spectator').detail)} type="button">
        邀请旁观
      </button>

      <aside className="jieqi-player-card is-rival">
        <span className="jieqi-avatar is-rival" aria-hidden="true">
          <UserRound size={34} />
        </span>
        <strong>陈俊池</strong>
        <span>[揭1-1]</span>
        <div className="jieqi-clock-stack" aria-label="对方计时">
          <b><Clock3 size={16} />{rankedTotalClock}</b>
          <b><Clock3 size={16} />{rankedStepClock}</b>
        </div>
      </aside>

      <div className="jieqi-board-stage">
        <ChessBoard
          pieces={displayPieces}
          selectedPiece={selectedPiece ?? undefined}
          marks={legalMoves}
          recentMove={recentJieqiMove}
          onSelectPoint={selectJieqiPoint}
        />
        <div className="jieqi-status-line" role="status">
          <span>{settlement?.resultTitle ?? status}</span>
          <span>{jieqiState.moveCount}手 · {hiddenCount}暗 · 我方吃{captureStats.red.total} · 对方吃{captureStats.black.total}</span>
        </div>
      </div>

      <aside className="jieqi-player-card is-self">
        <span className="jieqi-avatar is-self" aria-hidden="true">
          <UserRound size={34} />
        </span>
        <strong>Meteor</strong>
        <span>[揭1-1]</span>
        <div className="jieqi-clock-stack" aria-label="我方计时">
          <b><Clock3 size={16} />{rankedSelfClock}</b>
          <b><Clock3 size={16} />{rankedSelfStepClock}</b>
        </div>
      </aside>

      <nav className="jieqi-bottom-actions" aria-label="揭棋局内操作">
        <button className="round-button" aria-label="打开揭棋菜单" onClick={() => setJieqiMenuOpen(true)} type="button">
          <House size={24} />
        </button>
        <button className="round-button" aria-label="揭棋聊天" onClick={() => setStatus('局内聊天功能为本地占位')} type="button">
          <MessageCircle size={24} />
        </button>
      </nav>

      <div className="jieqi-hidden-meta" aria-hidden="true">
        {getJieqiEntryRows('rating').map((row) => (
          <span key={row.id}>{row.label}:{row.id === 'time-control' ? rankedTimeLabel : row.value}</span>
        ))}
        <span>入场:{admission.canEnter ? '门票2000' : '准入提示'}</span>
      </div>

      {jieqiIntroOpen && (
        <div className="jieqi-intro-layer" role="dialog" aria-modal="true" aria-label="揭棋本场说明">
          <div className="jieqi-intro-card">
            <div className="jieqi-intro-title">本场说明</div>
            <div className="jieqi-intro-copy">
              <strong>对局门票：2000</strong>
              <strong>输赢结算棋力分</strong>
              <strong>{rankedTimeLabel}</strong>
            </div>
            <button className="jieqi-start-button" onClick={() => setJieqiIntroOpen(false)} type="button">
              开始
            </button>
          </div>
        </div>
      )}

      {jieqiMenuOpen && (
        <JieqiMenuDialog
          onClose={() => setJieqiMenuOpen(false)}
          onLeave={onBack}
          onResign={() => {
            const nextSettlement = settleJieqiRating('loss', jieqiState);
            setSettlement(nextSettlement);
            setStatus('揭棋评测 · 我方认输');
            setJieqiMenuOpen(false);
          }}
          onToast={setStatus}
          onUndo={undoJieqiRound}
          undoLeft={jieqiUndoLeft}
        />
      )}
    </section>
  );
}

function JieqiMenuDialog({
  onClose,
  onLeave,
  onResign,
  onToast,
  onUndo,
  undoLeft,
}: {
  onClose: () => void;
  onLeave: () => void;
  onResign: () => void;
  onToast: (message: string) => void;
  onUndo: () => void;
  undoLeft: number;
}) {
  return (
    <div className="jieqi-action-menu" role="menu" aria-label="揭棋局内菜单">
      <button onClick={onLeave} role="menuitem" type="button">
        <ChevronLeft size={30} />
        离开
      </button>
      <button onClick={onResign} role="menuitem" type="button">
        <Flag size={30} />
        认输
      </button>
      <button onClick={() => onToast(getJieqiPlaceholder('draw-offer').detail)} role="menuitem" type="button">
        <MessageCircle size={28} />
        提和(3)
      </button>
      <button onClick={onUndo} role="menuitem" type="button">
        <RotateCcw size={28} />
        悔棋({undoLeft})
      </button>
      <button onClick={onClose} role="menuitem" type="button">
        <Settings size={30} />
        设置
      </button>
    </div>
  );
}

function FlipChessScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [flipState, setFlipState] = useState<XiangqiFlipChessGameState>(() => createFlipChessGame({ arenaId: 'training', seed: Date.now() % 100000 }));
  const [selectedFlipPiece, setSelectedFlipPiece] = useState<string | null>(null);
  const [flipStatus, setFlipStatus] = useState('抢红争先或不抢后开始');
  const [flipSettlement, setFlipSettlement] = useState<XiangqiFlipChessSettlement | null>(null);
  const [flipResultOpen, setFlipResultOpen] = useState(false);
  const [flipOpeningStage, setFlipOpeningStage] = useState<FlipOpeningStage>('shining');
  const [flipPreviewCells, setFlipPreviewCells] = useState<string[]>([]);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [flipMenuOpen, setFlipMenuOpen] = useState(false);
  const [flipCaptureReveal, setFlipCaptureReveal] = useState<FlipCaptureReveal | null>(null);
  const flipPreviewStartedRef = useRef<string | null>(null);
  const revealedCount = flipState.pieces.filter((piece) => !piece.hidden).length;
  const multiplier = `${flipState.multiplier}倍`;
  const playerSide = flipState.playerSide ?? 'red';
  const rivalSide = getOppositeFlipSide(playerSide);
  const trophies = getFlipChessTrophySidebar(flipState);
  const hpBySide = { red: flipState.redHp, black: flipState.blackHp };
  const selfHp = hpBySide[playerSide];
  const rivalHp = hpBySide[rivalSide];
  const selfTrophies = trophies[playerSide].map((stack) => `${formatFlipSide(stack.side)}${stack.label}${stack.count}`).join('、') || '暂无';
  const rivalTrophies = trophies[rivalSide].map((stack) => `${formatFlipSide(stack.side)}${stack.label}${stack.count}`).join('、') || '暂无';
  const flipTurnLabel = flipState.phase === 'playing' && flipState.turnSide
    ? `${formatFlipSide(flipState.turnSide)}回合`
    : flipState.phase === 'finished'
      ? '本局结束'
      : '等待抢红';

  useEffect(() => {
    if (flipSettlement?.winnerSide) setFlipResultOpen(true);
  }, [flipSettlement]);

  useEffect(() => {
    if (!flipCaptureReveal) return undefined;
    const timer = window.setTimeout(() => setFlipCaptureReveal(null), 1800);
    return () => window.clearTimeout(timer);
  }, [flipCaptureReveal]);

  useEffect(() => {
    if (
      flipState.phase !== 'playing' ||
      !flipState.playerSide ||
      !flipState.turnSide ||
      flipState.turnSide === flipState.playerSide
    ) {
      return undefined;
    }

    const expectedMoveNumber = flipState.moveNumber;
    const timer = window.setTimeout(() => {
      setFlipState((current) => {
        if (
          current.id !== flipState.id ||
          current.phase !== 'playing' ||
          current.moveNumber !== expectedMoveNumber ||
          !current.playerSide ||
          !current.turnSide ||
          current.turnSide === current.playerSide
        ) {
          return current;
        }
        const action = chooseFlipRivalAction(current);
        if (!action) {
          setFlipStatus(`${formatFlipSide(current.turnSide)}暂无可走`);
          return current;
        }
        setSelectedFlipPiece(null);
        setFlipStatus(action.state.records[action.state.records.length - 1]?.notation ?? `${formatFlipSide(current.turnSide)}已走棋`);
        if (action.reveal) setFlipCaptureReveal(action.reveal);
        if (action.state.phase === 'finished') {
          setFlipSettlement(createFlipChessSettlement(action.state, action.state.playerSide ?? 'red', 3530));
        }
        return action.state;
      });
    }, 720);

    setSelectedFlipPiece(null);
    setFlipStatus(`${formatFlipSide(flipState.turnSide)}思考中`);
    return () => window.clearTimeout(timer);
  }, [flipState.id, flipState.moveNumber, flipState.phase, flipState.playerSide, flipState.turnSide]);

  useEffect(() => {
    if (flipState.phase !== 'red-choice' || flipPreviewStartedRef.current === flipState.id) return undefined;
    flipPreviewStartedRef.current = flipState.id;
    const previewCells = chooseFlipOpeningPreviewCells(flipState);
    setFlipPreviewCells(previewCells);
    setFlipOpeningStage('shining');
    setFlipStatus('四道金光闪过，随机预揭四枚棋子');

    const revealTimer = window.setTimeout(() => {
      setFlipState((current) => (
        current.id === flipState.id && current.phase === 'red-choice'
          ? previewFlipChessOpening(current, previewCells)
          : current
      ));
      setFlipStatus('预揭完成，请选择是否抢红');
    }, 620);
    const choiceTimer = window.setTimeout(() => {
      setFlipOpeningStage('choice');
    }, 1250);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(choiceTimer);
      if (flipPreviewStartedRef.current === flipState.id) {
        flipPreviewStartedRef.current = null;
      }
    };
  }, [flipState.id, flipState.phase]);

  function chooseOpening(claimRed: boolean) {
    setFlipPreviewCells([]);
    setFlipState((current) => chooseFlipChessOpening(current, claimRed ? 'claim-red' : 'pass'));
    setFlipStatus(claimRed ? '已抢红争先，你执红先动' : '不抢，你执黑，等待红方先动');
  }

  function resignFlipGame() {
    setFlipMenuOpen(false);
    setSelectedFlipPiece(null);
    setFlipState((current) => {
      const playerSide = current.playerSide ?? 'red';
      const winnerSide = playerSide === 'red' ? 'black' : 'red';
      const finished: XiangqiFlipChessGameState = {
        ...current,
        phase: 'finished',
        result: winnerSide === 'red' ? 'red-win' : 'black-win',
        redHp: winnerSide === 'red' ? current.redHp : 0,
        blackHp: winnerSide === 'black' ? current.blackHp : 0,
        turnSide: null,
      };
      setFlipSettlement(createFlipChessSettlement(finished, playerSide, 3530));
      return finished;
    });
  }

  function offerFlipDraw() {
    setFlipMenuOpen(false);
    setFlipStatus('已发送提和，本地训练场暂不结算');
  }

  function openFlipSettings() {
    setFlipMenuOpen(false);
    setFlipStatus('设置功能为本地占位');
  }

  function handleFlipCell(cellId: string) {
    if (flipState.phase === 'red-choice') {
      setFlipStatus('请先选择抢红争先或不抢');
      return;
    }
    if (flipState.phase === 'finished') return;
    if (flipState.playerSide && flipState.turnSide && flipState.turnSide !== flipState.playerSide) {
      setSelectedFlipPiece(null);
      setFlipStatus(`等待${formatFlipSide(flipState.turnSide)}走棋`);
      return;
    }
    const piece = flipState.pieces.find((item) => item.cellId === cellId && !item.captured);
    const selectedAttacker = selectedFlipPiece
      ? flipState.pieces.find((item) => item.id === selectedFlipPiece && !item.captured)
      : null;
    if (!piece) {
      if (!selectedFlipPiece) return;
      try {
        const next = moveFlipChessPiece(flipState, selectedFlipPiece, cellId);
        setFlipState(next);
        setSelectedFlipPiece(null);
        setFlipStatus(next.records[next.records.length - 1]?.notation ?? '已移动');
      } catch (error) {
        setFlipStatus(formatFlipActionError(error, '这步暂不可走'));
      }
      return;
    }
    if (piece.hidden) {
      if (selectedAttacker?.kind === 'cannon' && selectedAttacker.id !== piece.id) {
        try {
          const next = captureFlipChessPiece(flipState, selectedAttacker.id, cellId);
          setFlipState(next);
          setSelectedFlipPiece(null);
          setFlipCaptureReveal({
            id: Date.now(),
            attackerLabel: selectedAttacker.label,
            side: piece.side,
            label: piece.label,
          });
          setFlipStatus(next.records[next.records.length - 1]?.notation ?? '已吃子');
          if (next.phase === 'finished') {
            setFlipSettlement(createFlipChessSettlement(next, next.playerSide ?? 'red', 3530));
          }
        } catch (error) {
          setFlipStatus(formatFlipActionError(error, '炮需要隔一个子才能吃'));
        }
        return;
      }
      try {
        const next = flipFlipChessPiece(flipState, cellId);
        setFlipState(next);
        setSelectedFlipPiece(null);
        setFlipStatus(next.records[next.records.length - 1]?.notation ?? '已翻开暗子');
      } catch (error) {
        setFlipStatus(formatFlipActionError(error, '该暗子暂不可翻'));
      }
      return;
    }
    if (selectedFlipPiece === piece.id) {
      setSelectedFlipPiece(null);
      setFlipStatus(`已取消选择${formatFlipSide(piece.side)}${piece.label}`);
      return;
    }
    if (selectedAttacker?.kind === 'cannon' && selectedAttacker.id !== piece.id && piece.side === flipState.turnSide) {
      try {
        const next = captureFlipChessPiece(flipState, selectedAttacker.id, cellId);
        setFlipState(next);
        setSelectedFlipPiece(null);
        setFlipStatus(next.records[next.records.length - 1]?.notation ?? '已吃子');
        if (next.phase === 'finished') {
          setFlipSettlement(createFlipChessSettlement(next, next.playerSide ?? 'red', 3530));
        }
      } catch {
        setSelectedFlipPiece(piece.id);
        setFlipStatus(`${formatFlipSide(piece.side)}${piece.label}已选中`);
      }
      return;
    }
    if (
      selectedAttacker &&
      selectedAttacker.id !== piece.id &&
      (selectedAttacker.kind === 'cannon' || piece.side !== flipState.turnSide)
    ) {
      try {
        const next = captureFlipChessPiece(flipState, selectedAttacker.id, cellId);
        setFlipState(next);
        setSelectedFlipPiece(null);
        setFlipStatus(next.records[next.records.length - 1]?.notation ?? '已吃子');
        if (next.phase === 'finished') {
          setFlipSettlement(createFlipChessSettlement(next, next.playerSide ?? 'red', 3530));
        }
      } catch (error) {
        setFlipStatus(formatFlipActionError(error, '不能吃这个棋子'));
      }
      return;
    }
    if (!selectedFlipPiece && piece.side !== flipState.turnSide) {
      setSelectedFlipPiece(null);
      setFlipStatus(`当前是${flipState.turnSide ? formatFlipSide(flipState.turnSide) : '本方'}回合，不能操作${formatFlipSide(piece.side)}棋子`);
      return;
    }
    if (!selectedFlipPiece || selectedFlipPiece === piece.id || piece.side === flipState.turnSide) {
      setSelectedFlipPiece(piece.id);
      setFlipStatus(`${formatFlipSide(piece.side)}${piece.label}已选中`);
      return;
    }
    try {
      const next = captureFlipChessPiece(flipState, selectedFlipPiece, cellId);
      setFlipState(next);
      setSelectedFlipPiece(null);
      setFlipStatus(next.records[next.records.length - 1]?.notation ?? '已吃子');
      if (next.phase === 'finished') {
        setFlipSettlement(createFlipChessSettlement(next, next.playerSide ?? 'red', 3530));
      }
    } catch (error) {
      setFlipStatus(formatFlipActionError(error, '不能吃这个棋子'));
    }
  }

  function resetFlipPieces() {
    setFlipState(createFlipChessGame({ arenaId: 'training', seed: Date.now() % 100000 }));
    setSelectedFlipPiece(null);
    setFlipSettlement(null);
    setFlipResultOpen(false);
    setFlipMenuOpen(false);
    setFlipCaptureReveal(null);
    setFlipOpeningStage('shining');
    setFlipPreviewCells([]);
    flipPreviewStartedRef.current = null;
    setFlipStatus('抢红争先或不抢后开始');
  }

  return (
    <section className="flip-match-screen">
      <div className="flip-match-topbar">
        <button className="round-button" aria-label="返回更多玩法" onClick={onBack} type="button">
          <ChevronLeft size={22} />
        </button>
        <div className="flip-match-title">
          <strong>翻翻棋</strong>
          <span>新手训练场</span>
        </div>
        <button className="round-button" aria-label="翻翻棋帮助" onClick={() => setRulesOpen(true)} type="button">
          <HelpCircle size={22} />
        </button>
      </div>

      <div className="flip-match-board-area">
        <div className="flip-player-strip is-rival">
          <PlayerBadge name="逸晨" rank={`${formatFlipSide(rivalSide)} · 银币 206.9万`} active={flipState.turnSide === rivalSide} />
          <div className="flip-hp-line">
            <span>{rivalSide === 'red' ? '红' : '黑'} {rivalHp}/{flipState.arena.initialHp}</span>
            <i><b style={{ width: `${(rivalHp / flipState.arena.initialHp) * 100}%` }} /></i>
          </div>
          <span className="flip-trophy-line">对方吃子：{rivalTrophies}</span>
        </div>

        <FlipBoard
          state={flipState}
          selectedPiece={selectedFlipPiece}
          previewCells={flipOpeningStage === 'shining' ? flipPreviewCells : []}
          onCell={handleFlipCell}
        />

        <div className="flip-player-strip is-self">
          <PlayerBadge name="我方" rank={`${formatFlipSide(playerSide)} · 银币 ${flipSettlement?.balanceAfter ?? 3530}`} active={flipState.turnSide === playerSide} />
          <div className="flip-hp-line">
            <span>{playerSide === 'red' ? '红' : '黑'} {selfHp}/{flipState.arena.initialHp}</span>
            <i><b style={{ width: `${(selfHp / flipState.arena.initialHp) * 100}%` }} /></i>
          </div>
          <span className="flip-trophy-line">我方吃子：{selfTrophies}</span>
        </div>

        {flipState.phase === 'red-choice' && flipOpeningStage === 'shining' && (
          <div className="flip-opening-flash" role="status">
            <Star size={18} />
            随机预揭四枚棋子
          </div>
        )}
        {flipCaptureReveal && (
          <div className={`flip-capture-reveal is-${flipCaptureReveal.side}`} role="status">
            <span>{flipCaptureReveal.attackerLabel}打暗子</span>
            <strong>{formatFlipSide(flipCaptureReveal.side)}{flipCaptureReveal.label}</strong>
          </div>
        )}
        {flipState.phase !== 'red-choice' && (
          <div className="flip-status-badge" role="status">
            <strong>{flipTurnLabel}</strong>
            <span>{flipStatus}</span>
          </div>
        )}
      </div>

      {flipState.phase !== 'red-choice' && (
        <nav className="flip-bottom-actions" aria-label="翻翻棋局内操作">
          <button className="round-button" aria-label="打开翻翻棋菜单" onClick={() => setFlipMenuOpen((open) => !open)} type="button">
            <House size={24} />
          </button>
        </nav>
      )}
      {flipState.phase !== 'red-choice' && flipMenuOpen && (
        <div className="flip-action-menu" role="menu" aria-label="翻翻棋局内菜单">
          <button onClick={onBack} role="menuitem" type="button">
            <ChevronLeft size={30} />
            离开
          </button>
          <button onClick={resignFlipGame} role="menuitem" type="button">
            <Flag size={30} />
            认输
          </button>
          <button onClick={offerFlipDraw} role="menuitem" type="button">
            <MessageCircle size={28} />
            提和
          </button>
          <button onClick={openFlipSettings} role="menuitem" type="button">
            <Settings size={30} />
            设置
          </button>
        </div>
      )}
      {flipState.phase === 'red-choice' && flipOpeningStage === 'choice' && (
        <FlipOpeningDialog
          arenaRows={getFlipChessArenaRows('training')}
          onClaimRed={() => chooseOpening(true)}
          onPass={() => chooseOpening(false)}
        />
      )}
      {rulesOpen && <FlipRulesDialog onClose={() => setRulesOpen(false)} />}
      {flipSettlement && flipResultOpen && (
        <FlipResultDialog
          settlement={flipSettlement}
          onBack={onBack}
          onClose={() => setFlipResultOpen(false)}
          onReset={resetFlipPieces}
        />
      )}
    </section>
  );
}

function FlipResultDialog({
  settlement,
  onBack,
  onClose,
  onReset,
}: {
  settlement: XiangqiFlipChessSettlement;
  onBack: () => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const didWin = settlement.coinDelta >= 0;
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="flip-result-card">
        <Trophy size={44} aria-hidden="true" />
        <p className="eyebrow">翻翻棋结算</p>
        <h2>{settlement.title}</h2>
        <strong className={didWin ? 'is-win' : 'is-loss'}>{settlement.summary}</strong>
        <div className="flip-result-rows">
          {settlement.rows.slice(0, 5).map((row) => (
            <InfoRow title={row.title} detail={row.detail} key={row.title} />
          ))}
        </div>
        <div className="result-actions">
          <button onClick={onClose}>查看棋盘</button>
          <button onClick={onBack}>返回</button>
          <button className="primary-action" onClick={onReset}>
            <RotateCcw size={18} />
            再来一局
          </button>
        </div>
      </div>
    </div>
  );
}

function FlipOpeningDialog({
  arenaRows,
  onClaimRed,
  onPass,
}: {
  arenaRows: Array<{ title: string; detail: string }>;
  onClaimRed: () => void;
  onPass: () => void;
}) {
  return (
    <div className="modal-layer is-flip-opening" role="dialog" aria-modal="true">
      <div className="flip-opening-card">
        <p className="eyebrow">翻翻棋开局</p>
        <h2>抢红争先</h2>
        <div className="intro-rules">
          {arenaRows.slice(0, 4).map((row) => (
            <InfoRow title={row.title} detail={row.detail} key={row.title} />
          ))}
        </div>
        <div className="flip-opening-actions">
          <button className="primary-action" onClick={onClaimRed} type="button">
            <Flame size={18} />
            抢红争先
          </button>
          <button onClick={onPass} type="button">
            不抢
          </button>
        </div>
      </div>
    </div>
  );
}

function GobangScreen({
  board,
  status,
  lastMove,
  difficulty,
  drawOffersLeft,
  undoLeft,
  onBack,
  onDraw,
  onPoint,
  onReset,
  onUndo,
}: {
  board: number[][];
  status: string;
  lastMove: Position | null;
  difficulty: GobangDifficulty;
  drawOffersLeft: number;
  undoLeft: number;
  onBack: () => void;
  onDraw: () => void;
  onPoint: (x: number, y: number) => void;
  onReset: () => void;
  onUndo: () => void;
}) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const difficultyOption = gobangDifficultyOptions.find((option) => option.id === difficulty) ?? gobangDifficultyOptions[1];
  const moves = board.flat().filter(Boolean).length;
  const blackStones = board.flat().filter((cell) => cell === 1).length;
  const whiteStones = board.flat().filter((cell) => cell === 2).length;
  const isFinished = /胜|满|和棋/.test(status);
  const boardPrompt = status === '黑先手' ? `黑方执子，对弈${difficultyOption.label}人机` : status;

  useEffect(() => {
    setResultOpen(isFinished);
  }, [isFinished, status]);

  return (
    <section className="gobang-match-screen">
      <div className="gobang-match-topbar">
        <button className="round-button" aria-label="返回更多玩法" onClick={onBack} type="button">
          <ChevronLeft size={22} />
        </button>
        <div>
          <small>欢乐五子棋</small>
          <strong>{boardPrompt}</strong>
        </div>
        <span>{moves}手</span>
      </div>

      <div className="gobang-match-board-area">
        <div className="gobang-player-head is-rival">
          <PlayerBadge name="小天" rank={difficultyOption.rival} active={!isFinished && status.includes('白方')} />
          <span>白 {whiteStones}</span>
        </div>
        <GobangBoard board={board} lastMove={lastMove} onPoint={onPoint} />
        <div className="gobang-player-head">
          <PlayerBadge name="我方" rank="黑子 · 业余新手" active={!isFinished && !status.includes('白方')} />
          <span>黑 {blackStones}</span>
        </div>
      </div>

      <div className="gobang-bottom-menu" role="toolbar" aria-label="五子棋菜单">
        <button onClick={onBack} type="button">
          <ChevronLeft size={20} />
          返回
        </button>
        <button onClick={onReset} type="button">
          <RotateCcw size={20} />
          再来
        </button>
        <button onClick={() => setRulesOpen(true)} type="button">
          <HelpCircle size={20} />
          规则
        </button>
        <button onClick={onUndo} type="button">
          <SkipBack size={20} />
          悔棋({undoLeft})
        </button>
        <button onClick={onDraw} type="button">
          <MessageCircle size={20} />
          求和({drawOffersLeft})
        </button>
      </div>
      {rulesOpen && <GobangRulesDialog onClose={() => setRulesOpen(false)} />}
      {resultOpen && (
        <GobangResultDialog
          moves={moves}
          onBack={onBack}
          onClose={() => setResultOpen(false)}
          onReset={onReset}
          status={status}
        />
      )}
    </section>
  );
}

function GobangResultDialog({
  moves,
  status,
  onBack,
  onClose,
  onReset,
}: {
  moves: number;
  status: string;
  onBack: () => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const title = status === '黑方胜' ? '黑棋胜利' : status === '白方胜' ? '白棋胜利' : status === '双方和棋' ? '双方和棋' : '棋盘已满';
  const summary = status === '黑方胜' ? '你率先连成五子' : status === '白方胜' ? '小天率先连成五子' : status === '双方和棋' ? '本局以和棋收束' : '双方未分胜负';

  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="gobang-result-card">
        <Trophy size={44} aria-hidden="true" />
        <p className="eyebrow">欢乐五子棋</p>
        <h2>{title}</h2>
        <span>{summary} · 共 {moves} 手</span>
        <div className="result-actions">
          <button onClick={onClose}>查看棋盘</button>
          <button onClick={onBack}>返回</button>
          <button className="primary-action" onClick={onReset}>
            <RotateCcw size={18} />
            再来一局
          </button>
        </div>
      </div>
    </div>
  );
}

function GobangRulesDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="confirm-card">
        <p className="eyebrow">欢乐五子棋规则</p>
        <h2>五连即胜</h2>
        <div className="intro-rules">
          <InfoRow title="落子" detail="双方轮流在空交叉点落子，黑方先行。" />
          <InfoRow title="胜利" detail="横、竖或斜向连续五枚同色棋子立即获胜。" />
          <InfoRow title="本地场" detail="采用自由五子棋规则，暂不加入三三、四四等禁手。" />
          <InfoRow title="人机" detail="可选择入门、标准、高手三档，高手会额外预判你的下一手威胁。" />
          <InfoRow title="辅助" detail="每局悔棋和求和各 3 次，悔棋会回到你上一手落子前。" />
        </div>
        <button className="primary-action full-width" onClick={onClose}>知道了</button>
      </div>
    </div>
  );
}

function GobangDifficultyDialog({
  selected,
  onClose,
  onSelect,
}: {
  selected: GobangDifficulty;
  onClose: () => void;
  onSelect: (difficulty: GobangDifficulty) => void;
}) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="gobang-difficulty-card">
        <p className="eyebrow">欢乐五子棋</p>
        <h2>选择棋力</h2>
        <div className="gobang-difficulty-list">
          {gobangDifficultyOptions.map((option) => (
            <button
              className={option.id === selected ? 'is-selected' : ''}
              key={option.id}
              onClick={() => onSelect(option.id)}
              type="button"
            >
              <span>
                <strong>{option.label}</strong>
                <small>{option.detail}</small>
              </span>
              <Swords size={20} aria-hidden="true" />
            </button>
          ))}
        </div>
        <button className="ghost-action full-width" onClick={onClose} type="button">先不开始</button>
      </div>
    </div>
  );
}

function FlipBoard({
  state,
  selectedPiece,
  previewCells = [],
  onCell,
}: {
  state: XiangqiFlipChessGameState;
  selectedPiece: string | null;
  previewCells?: string[];
  onCell: (cellId: string) => void;
}) {
  const previewCellSet = new Set(previewCells);
  return (
    <div className={`flip-board ${state.turnSide ? `is-${state.turnSide}-turn` : ''}`} aria-label="翻翻棋棋盘">
      {state.board.cells.map((cellId, index) => {
        const piece = state.pieces.find((item) => item.cellId === cellId && !item.captured);
        const pieceImage = getFlipPieceImage(piece);
        const row = Math.floor(index / state.board.cols) + 1;
        const column = (index % state.board.cols) + 1;
        const pieceLabel = !piece ? `空位 ${column}-${row}` : piece.hidden ? `暗子 ${column}-${row}` : `${piece.side === 'red' ? '红方' : '黑方'}${piece.label} ${column}-${row}`;
        return (
        <button
          aria-label={pieceLabel}
          className={`flip-cell ${piece ? 'has-piece' : 'is-empty'} ${previewCellSet.has(cellId) ? 'is-previewing' : ''} ${piece?.hidden ? 'is-hidden' : piece?.side ?? ''} ${piece?.id === selectedPiece ? 'is-selected' : ''}`}
          key={cellId}
          onClick={() => onCell(cellId)}
          type="button"
        >
          <span className="flip-cell-cross" aria-hidden="true" />
          {piece ? (
            <span className={`flip-piece ${piece.hidden ? 'is-hidden' : piece.side}`}>
              {pieceImage ? <img src={pieceImage} alt="" aria-hidden="true" /> : null}
              <span className="flip-piece-label" data-label={piece.hidden ? '暗' : piece.label}>
                {piece.hidden ? '暗' : piece.label}
              </span>
            </span>
          ) : (
            <span className="flip-empty-point" aria-hidden="true" />
          )}
        </button>
        );
      })}
    </div>
  );
}

function getFlipPieceImage(piece?: XiangqiFlipChessPiece) {
  if (!piece) return null;
  if (piece.hidden) return jieqiBackPiece;
  return generatedPieceImages[piece.side][flipPieceKindMap[piece.kind]];
}

function MoreGamesLobbyScreen({
  onOpenGame,
  onUnavailable,
}: {
  onOpenGame: (gameKind: MoreGameKind) => void;
  onUnavailable: (message: string, kind?: ToastKind) => void;
}) {
  const posterStyle = (image: string): PosterCardStyle => ({
    '--poster-image': `url(${image})`,
  });

  return (
    <section className="more-lobby" aria-label="更多玩法入口">
      <div
        className="more-card more-card-large gobang-poster"
        role="button"
        tabIndex={0}
        style={posterStyle(gobangPoster)}
        onClick={() => onOpenGame('gobang')}
        onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onOpenGame('gobang')}
      >
        <div className="more-card-copy">
          <strong>欢乐五子棋</strong>
          <small>1404</small>
        </div>
      </div>

      <div className="more-card-grid">
        <button className="more-card more-card-small flip-poster" style={posterStyle(flipChessPoster)} onClick={() => onOpenGame('flip')}>
          <span className="more-card-copy">
            <strong>翻翻棋</strong>
            <small>2269</small>
          </span>
        </button>

        <button
          className="more-card more-card-small wait-poster"
          style={posterStyle(comingSoonPoster)}
          onClick={() => onUnavailable('新玩法敬请期待', 'info')}
        >
          <span className="more-card-copy">
            <strong>敬请期待</strong>
          </span>
        </button>
      </div>
    </section>
  );
}

function FlipRulesDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="flip-rules-card">
        <button className="round-button" aria-label="关闭翻翻棋规则" onClick={onClose} type="button">
          <X size={18} />
        </button>
        <img src={flipRulesGuide} alt="翻翻棋规则：棋子大小、兵卒吃将帅、炮隔子吃子、同级互吃、吃子扣血" />
      </div>
    </div>
  );
}

function RulesDialog({ kind, onClose }: { kind: RulesDialogKind; onClose: () => void }) {
  const titles: Record<RulesDialogKind, string> = {
    xiangqi: '象棋玩法帮助',
    jieqi: '揭棋玩法帮助',
    ranked: '排位赛说明',
  };
  const sectionsByKind: Record<RulesDialogKind, RuleSection[]> = {
    xiangqi: xiangqiRulesSections,
    jieqi: jieqiRulesSections,
    ranked: rankedRulesSections,
  };
  const title = titles[kind];
  const sections = sectionsByKind[kind];

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label={title}>
      <div className="confirm-card rules-card">
        <button className="round-button" aria-label="关闭帮助" onClick={onClose}>
          <X size={18} />
        </button>
        <h2>{title}</h2>
        <div className="rules-content">
          {sections.map((section) => (
            <section className="rule-block" key={section.title}>
              <h3>{section.title}</h3>
              <ol>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>
          ))}
          {kind === 'ranked' && (
            <section className="rule-block ranked-rules-table-block">
              <h3>三、段位表</h3>
              <div className="ranked-rules-table-wrap">
                <table className="ranked-rules-table">
                  <thead>
                    <tr>
                      <th>段位</th>
                      <th>分数</th>
                      <th>新赛季继承</th>
                      <th>跨赛季继承</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedRankRows.map((row) => (
                      <tr key={row.rank}>
                        <td>{row.rank}</td>
                        <td>{row.score}</td>
                        <td>{row.seasonCarry}</td>
                        <td>{row.crossSeasonCarry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
        <button className="primary-action full-width" onClick={onClose}>知道了</button>
      </div>
    </div>
  );
}

type FeatureCard = { id?: string; title: string; detail: string; meta?: string; badge?: string; selected?: boolean; disabled?: boolean };
type FeatureDialogContent = {
  title: string;
  description: string;
  cta: string;
  secondaryCta?: string;
  rows: Array<{ title: string; detail: string }>;
  resources?: Array<{ label: string; value: string; tone?: string }>;
  showcase?: {
    eyebrow: string;
    title: string;
    detail: string;
    progress?: number;
  };
  cards?: FeatureCard[];
  tips: string[];
  risks: string[];
  disabled?: boolean;
};

function FeatureActionDialog({
  state,
  puzzleProgress,
  selectedCoinRowId,
  selectedMinuteMode,
  selectedHuashanMode,
  selectedFriendMode,
  selectedXiangqiDifficulty,
  kifuRecords,
  selectedKifuId,
  onClose,
  onPrimary,
  onSelectCard,
  onSecondary,
}: {
  state: FeatureDialogState;
  puzzleProgress: PuzzleProgress;
  selectedCoinRowId: XiangqiCoinArenaRowId;
  selectedMinuteMode: XiangqiMinuteArenaMode;
  selectedHuashanMode: XiangqiHuashanMode;
  selectedFriendMode: XiangqiFriendRoomMode;
  selectedXiangqiDifficulty: XiangqiAiDifficulty;
  kifuRecords: XiangqiKifuRecord[];
  selectedKifuId: string | null;
  onClose: () => void;
  onPrimary: () => void;
  onSelectCard: (cardId: string) => void;
  onSecondary: () => void;
}) {
  const content = getFeatureDialogContent(
    state,
    puzzleProgress,
    selectedCoinRowId,
    selectedMinuteMode,
    selectedHuashanMode,
    selectedFriendMode,
    selectedXiangqiDifficulty,
    kifuRecords,
    selectedKifuId,
  );

  if (state.kind === 'xiangqi' && state.entryId === 'rank-certification') {
    return (
      <CertificationEntryDialog
        onClose={onClose}
        onPrimary={onPrimary}
      />
    );
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label={content.title}>
      <div className={`confirm-card feature-action-card feature-action-card-${state.kind}`}>
        <button className="round-button" aria-label="关闭功能面板" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="feature-action-scroll">
          <h2>{content.title}</h2>
          <p className="feature-action-description">{content.description}</p>
          {content.resources && (
            <div className="feature-resource-strip">
              {content.resources.map((resource) => (
                <span className={resource.tone ? `tone-${resource.tone}` : ''} key={resource.label}>
                  <small>{resource.label}</small>
                  <strong>{resource.value}</strong>
                </span>
              ))}
            </div>
          )}
          {content.showcase && (
            <section className="feature-showcase">
              <p className="eyebrow">{content.showcase.eyebrow}</p>
              <h3>{content.showcase.title}</h3>
              <span>{content.showcase.detail}</span>
              {typeof content.showcase.progress === 'number' && (
                <div className="feature-progress" aria-label={content.showcase.detail}>
                  <i style={{ width: `${content.showcase.progress}%` }} />
                </div>
              )}
            </section>
          )}
          <div className="intro-rules">
            {content.rows.map((row) => (
              <InfoRow title={row.title} detail={row.detail} key={row.title} />
            ))}
          </div>
          {content.cards && (
            <div className="feature-card-list">
              {content.cards.map((card) => (
                <button
                  className={`feature-mini-card ${card.selected ? 'is-selected' : ''} ${card.disabled ? 'is-disabled' : ''}`}
                  aria-pressed={card.selected ? true : undefined}
                  disabled={card.disabled}
                  key={`${card.title}-${card.detail}`}
                  onClick={() => card.id && onSelectCard(card.id)}
                  type="button"
                >
                  {card.badge && <b className="feature-card-badge">{card.badge}</b>}
                  <strong>{card.title}</strong>
                  <span>{card.detail}</span>
                  {card.meta && <small>{card.meta}</small>}
                </button>
              ))}
            </div>
          )}
          {content.tips.length > 0 && (
            <section className="feature-action-section">
              <h3>规则提示</h3>
              <ul>
                {content.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>
          )}
          {content.risks.length > 0 && (
            <section className="feature-action-section">
              <h3>注意事项</h3>
              <ul>
                {content.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <div className="feature-dialog-actions">
          {content.secondaryCta && (
            <button onClick={onSecondary} type="button">
              <RotateCcw size={18} />
              {content.secondaryCta}
            </button>
          )}
          <button className="primary-action full-width" onClick={content.disabled ? onClose : onPrimary} type="button">
            {content.disabled ? '知道了' : content.cta}
          </button>
        </div>
      </div>
    </div>
  );
}

function CertificationEntryDialog({
  onClose,
  onPrimary,
}: {
  onClose: () => void;
  onPrimary: () => void;
}) {
  const progress = xiangqiCertificationConfig.nextProgress;
  const historyNodes = getCertificationHistoryBestNodes();
  const rewardRows = getCertificationSessionRows().filter((row) => (
    row.id === 'history-best' || row.id === 'reward-requirement' || row.id === 'entry-resource'
  ));

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label={xiangqiCertificationConfig.title}>
      <div className="certification-entry-card">
        <button className="round-button" aria-label="关闭功能面板" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="certification-entry-scroll">
          <div className="certification-season-line">{xiangqiCertificationConfig.seasonCountdownText}</div>
          <section className="certification-rank-stage">
            <div className="rank-curtain" aria-hidden="true" />
            <p>当前等级</p>
            <div className="certification-rank-emblem">
              <Medal size={42} />
            </div>
            <h2>{xiangqiCertificationConfig.currentRank.title}</h2>
            <strong>下级: {progress.label}</strong>
            <div className="progress-track" aria-label={`下级 ${progress.label}`}>
              <span style={{ width: `${Math.round((progress.current / progress.target) * 100)}%` }} />
            </div>
          </section>
          <div className="certification-path" aria-label="历史最高等级">
            {historyNodes.map((node) => (
              <button className={node.featured ? 'is-current' : ''} key={node.id} type="button">
                <span>{node.label}</span>
                <strong>{node.rank}</strong>
                <small>{node.progress.label}</small>
              </button>
            ))}
          </div>
          <section className="certification-reward-box">
            <p>活动结束后，可领取历史最高等级对应的奖励</p>
            {rewardRows.map((row) => (
              <InfoRow
                detail={row.detail ? `${row.value} · ${row.detail}` : row.value}
                key={row.id}
                title={row.label}
              />
            ))}
          </section>
        </div>
        <button className="certification-start-button" onClick={onPrimary} type="button">
          快速开始
        </button>
      </div>
    </div>
  );
}

function getFeatureDialogContent(
  state: FeatureDialogState,
  puzzleProgress: PuzzleProgress,
  selectedCoinRowId: XiangqiCoinArenaRowId,
  selectedMinuteMode: XiangqiMinuteArenaMode,
  selectedHuashanMode: XiangqiHuashanMode,
  selectedFriendMode: XiangqiFriendRoomMode,
  selectedXiangqiDifficulty: XiangqiAiDifficulty,
  kifuRecords: XiangqiKifuRecord[],
  selectedKifuId: string | null,
): FeatureDialogContent {
  if (state.kind === 'xiangqi') {
    if (state.entryId === 'rank-certification') {
      const progress = xiangqiCertificationConfig.nextProgress;
      return {
        title: xiangqiCertificationConfig.title,
        description: '参与本届棋力认证，完成有效对局后更新棋力分、等级进度和证书资格。',
        cta: '快速开始',
        resources: [
          { label: '银色资源', value: defaultCoinArenaWallet.silver.toString(), tone: 'silver' },
          { label: '入场', value: xiangqiCertificationConfig.entryResource, tone: 'gold' },
        ],
        showcase: {
          eyebrow: xiangqiCertificationConfig.seasonCountdownText,
          title: xiangqiCertificationConfig.currentRank.title,
          detail: `下级 ${progress.label}`,
          progress: Math.round((progress.current / progress.target) * 100),
        },
        rows: getCertificationSessionRows().map((row) => ({
          title: row.label,
          detail: row.detail ? `${row.value} · ${row.detail}` : row.value,
        })),
        cards: getCertificationHistoryBestNodes().map((node) => ({
          title: node.label,
          detail: node.rank,
          meta: node.progress.label,
          badge: node.featured ? '当前' : undefined,
        })),
        tips: getCertificationRuleSummary().map((item) => `${item.title}：${item.description}`),
        risks: ['匹配成功后中途退出可能导致认证失败并按负局记录。'],
      };
    }

    if (state.entryId === 'skill-evaluation') {
      const winResult = getRatingResult(true);
      return {
        title: xiangqiRatingConfig.title,
        description: xiangqiRatingConfig.description,
        cta: '开始评测',
        resources: [
          { label: '入场', value: xiangqiRatingConfig.entryResource, tone: 'silver' },
          { label: '结算', value: xiangqiRatingConfig.settlementType, tone: 'gold' },
        ],
        showcase: {
          eyebrow: '本场说明',
          title: xiangqiRatingConfig.arenaTitle,
          detail: xiangqiRatingConfig.timeControl.label,
          progress: xiangqiRatingConfig.currentProgress,
        },
        rows: getRatingEntryRows().map((row) => ({ title: row.label, detail: row.value })),
        cards: winResult.rows.map((row) => ({
          title: row.title,
          detail: row.detail,
          badge: row.title === '漏着' || row.title === '送子' ? '重点' : undefined,
        })),
        tips: getRatingSessionRows().map((row) => `${row.title}：${row.detail}`),
        risks: ['棋力评测只生成本地训练建议，不同步真实账号评测数据。'],
      };
    }

    if (state.entryId === 'huashan') {
      const modes = getHuashanModes();
      const selected = modes.find((mode) => mode.id === selectedHuashanMode) ?? modes[0];
      return {
        title: xiangqiHuashanConfig.title,
        description: selected.description,
        cta: selected.startLabel,
        secondaryCta: '换台',
        resources: [
          { label: '赛季', value: xiangqiHuashanConfig.seasonLabel, tone: 'gold' },
          { label: '排名', value: `第${xiangqiHuashanConfig.rank}名`, tone: 'silver' },
        ],
        showcase: {
          eyebrow: xiangqiHuashanConfig.countdown,
          title: selected.title,
          detail: selected.unlock,
          progress: selected.id === 'pass' ? 60 : 42,
        },
        rows: getHuashanEventRows(),
        cards: modes.map((mode) => ({
          id: mode.id,
          title: mode.title,
          detail: mode.description,
          meta: `${mode.timeControl.totalMinutes}分钟 · ${mode.unlock}`,
          badge: mode.id === selectedHuashanMode ? '当前' : undefined,
          selected: mode.id === selectedHuashanMode,
        })),
        tips: [
          ...xiangqiHuashanConfig.rules,
          getHuashanSafePlaceholder('spectate') as string,
          getHuashanSafePlaceholder('ranking') as string,
          getHuashanSafePlaceholder('reward') as string,
        ],
        risks: ['本地挑战只模拟赛季进度、连胜、胜率和排名，不领取真实奖励。'],
      };
    }

    if (state.entryId === 'friend-match') {
      const room = createFriendRoom(selectedFriendMode, 1);
      return {
        title: '好友对战',
        description: '选择时长后创建本地房间，生成棋社号和桌号并进入非计分对局。',
        cta: `创建${room.timeControl.label}好友房`,
        secondaryCta: '换房',
        resources: [
          { label: '棋社号', value: room.clubNo, tone: 'silver' },
          { label: '桌号', value: room.tableNo, tone: 'gold' },
        ],
        showcase: {
          eyebrow: '本地房间',
          title: room.title,
          detail: room.invite.copyText,
          progress: 100,
        },
        rows: getFriendRoomRows(room),
        cards: friendRoomModes.map((mode) => ({
          id: mode.id,
          title: mode.title,
          detail: mode.timeControl.stepLabel,
          meta: '非计分 · 免费',
          badge: mode.id === selectedFriendMode ? '当前' : undefined,
          selected: mode.id === selectedFriendMode,
        })),
        tips: [room.invite.message, room.invite.placeholder, ...room.safetyTips.map((tip) => tip.text)],
        risks: ['真实好友邀请、QQ/微信分享只展示占位提示，不拉起外部平台。'],
      };
    }

    if (state.entryId === 'my-records') {
      const records = filterKifuRecords(kifuRecords, 'all');
      const selected = selectedKifuId ? records.find((record) => record.id === selectedKifuId) : records[0];
      return {
        title: '我的棋谱',
        description: records.length > 0 ? '查看最近对局、收藏棋谱，并从本地记录继续复盘。' : '完成一局后会自动生成本地棋谱记录。',
        cta: selected ? '继续复盘' : '暂无棋谱',
        secondaryCta: selected ? (selected.favorite ? '取消收藏' : '收藏棋谱') : undefined,
        resources: [
          { label: '最近对局', value: String(records.length), tone: 'silver' },
          { label: '收藏', value: String(records.filter((record) => record.favorite).length), tone: 'gold' },
        ],
        showcase: selected
          ? {
              eyebrow: selected.moduleName,
              title: selected.title,
              detail: `${selected.resultLabel} · ${selected.moveCount}步`,
              progress: selected.moveCount > 0 ? 100 : 30,
            }
          : {
              eyebrow: '本地棋谱',
              title: '暂无记录',
              detail: '完成对局后自动保存最近20局',
              progress: 0,
            },
        rows: selected
          ? [
              { title: '模块', detail: selected.moduleName },
              { title: '场次', detail: selected.arenaTitle },
              { title: '对手', detail: `${selected.opponentName} · ${selected.opponentRank}` },
              { title: '结果', detail: selected.resultLabel },
              { title: '收藏', detail: selected.favorite ? '已收藏' : '未收藏' },
            ]
          : [{ title: '记录状态', detail: '暂无本地棋谱' }],
        cards: records.map((record) => ({
          id: record.id,
          title: record.title,
          detail: `${record.resultLabel} · ${record.moveCount}步`,
          meta: `${record.moduleName} · ${formatResultDate(record.createdAt)}`,
          badge: record.favorite ? '收藏' : record.id === selected?.id ? '当前' : undefined,
          selected: record.id === selected?.id,
          disabled: !record.result?.moves.length,
        })),
        tips: [
          '棋谱记录仅保存在当前前端会话内。',
          '复盘页会继续展示模块、场次、局时、结算类型和标签。',
          '复制、分享和云端收藏仍为本地占位。',
        ],
        risks: ['刷新页面后本地内存棋谱会清空，暂不接账号和云端存档。'],
        disabled: records.length === 0,
      };
    }

    if (state.entryId === 'ai-match') {
      const selected = getXiangqiAiDifficultyOption(selectedXiangqiDifficulty);
      return {
        title: '人机对战',
        description: '选择适合自己的电脑难度，再进入本地练习局。',
        cta: `挑战${selected.label}人机`,
        resources: [
          { label: '当前难度', value: selected.label, tone: 'gold' },
          { label: '结算', value: '不计积分', tone: 'silver' },
        ],
        showcase: {
          eyebrow: '难度选择',
          title: `${selected.label}人机`,
          detail: selected.detail,
          progress: selected.id === 'beginner' ? 35 : selected.id === 'advanced' ? 68 : 100,
        },
        rows: [
          { title: '局时', detail: '10分钟' },
          { title: '步时', detail: '前3步30秒，之后90秒' },
          { title: '当前对手', detail: selected.rival },
          { title: '引擎策略', detail: selected.id === 'beginner' ? '本地轻量 AI' : selected.id === 'advanced' ? '短时强引擎' : '长考强引擎' },
        ],
        cards: xiangqiAiDifficultyOptions.map((option) => ({
          id: option.id,
          title: option.label,
          detail: option.detail,
          meta: option.rival,
          badge: option.id === selectedXiangqiDifficulty ? '当前' : option.badge,
          selected: option.id === selectedXiangqiDifficulty,
        })),
        tips: [
          '入门难度会关闭强引擎，只用轻量本地 AI 陪练。',
          '进阶难度会缩短思考时间，适合多数练习局。',
          '高手难度会给强引擎更长思考时间。',
        ],
        risks: ['人机练习不计积分，不影响头衔和棋力认证。'],
      };
    }

    if (state.entryId === 'coin-arena') {
      const selection = buildCoinArenaSelection({ selectedRowId: selectedCoinRowId, wallet: defaultCoinArenaWallet });
      const session = getCoinArenaSession(selectedCoinRowId, defaultCoinArenaWallet);
      const selectedRow = session.row;
      const selectedCard = selection.cards.find((card) => card.id === selectedCoinRowId);
      const selectedIsEndgame = selectedCoinRowId === 'endgame-coin';
      return {
        title: '铜钱场',
        description: '按铜钱准入分层匹配，支持随机开局、分钟场和残局铜钱入口。',
        cta: selectedCard?.disabled ? '查看救济提示' : selectedIsEndgame ? '进入残局-铜钱场' : selectedCard?.primaryLabel ?? `进入${selectedRow.title}`,
        secondaryCta: '换桌',
        resources: getCoinArenaResources(defaultCoinArenaWallet).map((resource) => ({
          label: resource.label,
          value: resource.amount.toString(),
          tone: resource.tone,
        })),
        showcase: {
          eyebrow: selectedRow.title,
          title: selectedRow.detail,
          detail: selectedRow.randomOpening
            ? `${selectedRow.randomOpening.description} · ${selectedRow.randomOpening.timeControlLabel}`
            : selectedIsEndgame
              ? '转入残局模块，解残局赢铜钱'
              : `准入${selectedRow.admission.label} · ${selectedRow.bonus.rate > 0 ? selectedRow.bonus.label : '无加成'}`,
          progress: session.canEnter ? 100 : 35,
        },
        rows: [
          { title: '入场/底注', detail: selectedRow.randomOpening ? `${selectedRow.randomOpening.ticket}铜钱 · 输赢${selectedRow.randomOpening.winLoss}` : selectedRow.detail },
          { title: '在线人数', detail: `${selectedRow.onlineLabel}人` },
          { title: '准入状态', detail: selectedIsEndgame ? '进入残局铜钱练习' : session.canEnter ? `当前铜钱可进入${selectedRow.title}` : session.reliefPrompt?.message ?? '暂不可进入' },
        ],
        cards: selection.cards.map((card) => ({
          id: card.id,
          title: card.title,
          detail: card.detail,
          meta: `${card.onlineLabel}人${card.reliefMessage ? ' · 铜钱不足' : ''}`,
          badge: card.selected ? '当前' : card.bonusLabel !== '无加成' ? card.bonusLabel : undefined,
          selected: card.selected,
          disabled: card.disabled,
        })),
        tips: [
          '随机场会在系统随机开局上直接对弈。',
          selectedRow.randomOpening
            ? `本场说明：门票${coinArenaRandomOpening.ticket}，单局输赢${coinArenaRandomOpening.winLoss}，${coinArenaRandomOpening.timeControlLabel}。`
            : `${selectedRow.title}：${selectedRow.detail}${selectedRow.bonus.rate > 0 ? `，胜局加成${selectedRow.bonus.label}` : ''}。`,
          '铜钱不足只展示救济或充值提示，本地版本不会拉起支付。',
        ],
        risks: ['逃跑、超时或异常退出可能按负局结算铜钱。'],
      };
    }

    if (state.entryId === 'ranked-5' || state.entryId === 'ranked-10' || state.entryId === 'ranked-20') {
      const selection = buildMinuteArenaSelection({ selectedMode: selectedMinuteMode });
      const session = getMinuteArenaSession(selectedMinuteMode);
      const selectedCard = selection.cards.find((card) => card.id === selectedMinuteMode);
      return {
        title: session.entryTitle,
        description: session.description,
        cta: selectedCard?.primaryLabel ?? `开始${session.title}`,
        secondaryCta: '换桌',
        resources: [
          { label: '金色资源', value: defaultCoinArenaWallet.gold.toString(), tone: 'gold' },
          { label: '铜钱', value: defaultCoinArenaWallet.silver.toString(), tone: 'silver' },
        ],
        showcase: {
          eyebrow: '本场说明',
          title: session.title,
          detail: session.timeControl.label,
          progress: 68,
        },
        rows: [
          { title: '局时', detail: `${session.timeControl.totalMinutes}分钟` },
          { title: '步时', detail: `1分钟(前3步30秒)` },
          { title: '门票', detail: session.ticket.label },
          { title: '操作', detail: session.actions.map((action) => action.label).join(' / ') },
        ],
        cards: selection.cards.map((card) => ({
          id: card.id,
          title: card.title,
          detail: card.onlineLabel,
          badge: card.badge === '已选' ? '当前' : undefined,
          selected: card.selected,
        })),
        tips: [...session.scoringTips],
        risks: ['匹配成功后，该棋局视为有效对局，逃跑或超时会产生扣分风险。'],
      };
    }

    const action = getXiangqiFeatureAction(state.entryId);
    const rows = [
      { title: '功能状态', detail: action.type === 'disabled' ? '安全占位' : action.cta },
      { title: '入口类型', detail: action.type },
    ];
    if (action.match) {
      rows.push({
        title: '对局配置',
        detail: action.match.minutes ? `${action.match.minutes}分钟 · ${action.match.rated ? '计积分' : '不计积分'}` : action.match.mode,
      });
      rows.push({
        title: '有效局',
        detail: action.match.requiresEffectiveGame ? '需要完成有效局' : '练习或好友引导',
      });
    }
    return {
      title: action.title,
      description: action.description,
      cta: action.cta,
      rows,
      tips: action.ruleTips,
      risks: action.riskTips,
      disabled: action.type === 'disabled',
    };
  }

  if (state.kind === 'jieqi') {
    const entry = getJieqiFeatureEntry(state.entryId);
    const action = getJieqiFeatureAction(state.entryId);
    const callouts = getJieqiRuleCallouts(state.entryId);
    const rows = [
      { title: '功能状态', detail: action.type === 'start-jieqi' ? '可进入本地揭棋评测' : action.cta },
      { title: '支付保护', detail: action.paymentRequired ? '需要二次确认' : '不直接支付或扣费' },
    ];
    if (entry.entryLimit) rows.push({ title: '入场限制', detail: entry.entryLimit });
    if (entry.rewardHint) rows.push({ title: '奖励/结算', detail: entry.rewardHint });
    if (action.payload.matchConfig) rows.push({ title: '局时', detail: action.payload.matchConfig.timeControl });
    if (entry.baseStake) rows.push({ title: '底注', detail: `${entry.baseStake}` });
    if (entry.wealthRange) rows.push({ title: '财富范围', detail: entry.wealthRange });
    return {
      title: action.title,
      description: action.description,
      cta: action.cta,
      rows,
      tips: callouts.map((callout) => `${callout.title}：${callout.body}`),
      risks: entry.category === 'commerce' ? ['商城入口只展示浏览面板，不直接下单或拉起支付。'] : [],
      disabled: action.type === 'disabled',
    };
  }

  const entry = puzzleFeatureEntries.find((item) => item.id === state.entryId);
  const action = getPuzzleFeatureAction(state.entryId, puzzleProgress);
  const stats = getPuzzleDashboardStats(puzzleProgress);
  const rows = [
    { title: '本地进度', detail: `${stats.completedCount}题完成 · ${stats.currentStreak}连胜 · ${stats.mistakeCount}道错题` },
    { title: '功能状态', detail: action.localPlaceholder ? '本地占位可展示' : action.label },
  ];
  if (action.set) {
    rows.push({ title: '训练集', detail: `${action.set.title} · ${action.set.estimatedMinutes}分钟 · 难度${action.set.difficulty}` });
    rows.push({ title: '标签', detail: action.set.tags.join(' / ') });
  }
  if (action.type === 'open-ranking') {
    rows.push({ title: '榜首', detail: `${stats.localRanking[0]?.name ?? '你'} · ${stats.localRanking[0]?.seconds ?? 0}秒` });
  }
  return {
    title: entry?.title ?? action.label,
    description: entry?.subtitle ?? action.disabledReason ?? action.label,
    cta: action.label,
    rows,
    tips: [
      '残局子功能全部使用本地进度，不依赖网络或支付。',
      action.puzzle ? `今日题目：${action.puzzle.title}` : '',
      action.set ? action.set.description : '',
    ].filter(Boolean),
    risks: action.disabledReason ? [action.disabledReason] : ['重来不会清除历史统计，失败会进入错题本。'],
    disabled: action.type === 'disabled',
  };
}

function RankedScreen({
  onStart,
  onBack,
  onHelp,
}: {
  onStart: (selection: RankedStartSelection) => void;
  onBack: () => void;
  onHelp: () => void;
}) {
  const [openMenu, setOpenMenu] = useState<RankedMenu>(null);
  const [selectedGame, setSelectedGame] = useState(rankedGameOptions[0]);
  const [selectedArena, setSelectedArena] = useState(rankedArenaOptions[0]);
  const currentRank = {
    tier: 'bronze',
    label: '青铜1星',
    glyph: '将',
    progress: '100/200',
    history: '历史最高: 青铜1星',
    emblem: bronzeRankEmblem,
  };
  const sideActions = [
    { label: '奖励', icon: Gift },
    { label: '排名', icon: BarChart3 },
    { label: '旁观', icon: Eye },
    { label: '记录', icon: ScrollText },
    { label: '分享', icon: Share2 },
  ];

  return (
    <section className="ranked-panel" aria-label="排位赛">
      <div className="ranked-top">
        <div className="ranked-title-row">
          <div className="ranked-title-actions" aria-label="排位赛操作">
            <button aria-label="返回首页" onClick={onBack}>
              <ChevronLeft size={24} />
            </button>
            <button aria-label="帮助" onClick={onHelp}>
              <HelpCircle size={22} />
            </button>
          </div>
          <h2>S3赛季</h2>
        </div>
        <div className="ranked-currencies" aria-label="赛季资源">
          <span>
            <Medal size={18} />
            1720
          </span>
          <span>
            <ScrollText size={18} />
            0
          </span>
          <span>
            <Gem size={18} />
            1
          </span>
        </div>
      </div>

      <nav className="ranked-side-actions" aria-label="排位功能">
        {sideActions.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.label}>
              <Icon size={20} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="ranked-emblem-block">
        <div className="ranked-stars" aria-label="当前星级">
          <Star className="is-lit" size={30} fill="currentColor" />
          <Star size={30} fill="currentColor" />
          <Star size={30} fill="currentColor" />
        </div>
        <div className={`ranked-emblem ranked-emblem--${currentRank.tier}`} aria-label={currentRank.label}>
          <img src={currentRank.emblem} alt="" />
          <span data-glyph={currentRank.glyph}>{currentRank.glyph}</span>
        </div>
        <strong>{currentRank.label}</strong>
        <div className="ranked-progress" aria-label="段位进度">
          <i />
          <span>{currentRank.progress}</span>
        </div>
        <small>{currentRank.history}</small>
      </div>

      <div className="ranked-season-badge" aria-hidden="true">
        <span className="ranked-king-mark">
          <i />
          <Trophy size={42} />
          <i />
        </span>
        <span className="ranked-season-label">棋王历练</span>
      </div>

      <div className="ranked-select-row">
        <button
          className={`ranked-select ${openMenu === 'game' ? 'is-open' : ''}`}
          onClick={() => setOpenMenu(openMenu === 'game' ? null : 'game')}
        >
          <span>{selectedGame.label}</span>
          <ChevronLeft size={24} />
        </button>
        {openMenu === 'game' && (
          <div className="ranked-dropdown ranked-dropdown-game">
            {rankedGameOptions.map((option) => (
              <button
                className={option.id === selectedGame.id ? 'is-selected' : ''}
                key={option.id}
                onClick={() => {
                  setSelectedGame(option);
                  setOpenMenu(null);
                }}
              >
                <strong>{option.label}</strong>
                <span>{option.baseScore}</span>
                <span>{option.players}</span>
              </button>
            ))}
          </div>
        )}
        <button
          className={`ranked-select ${openMenu === 'arena' ? 'is-open' : ''}`}
          onClick={() => setOpenMenu(openMenu === 'arena' ? null : 'arena')}
        >
          <span>
            {selectedArena.label}
            <small>{selectedArena.stake}</small>
          </span>
          <ChevronLeft size={24} />
        </button>
        {openMenu === 'arena' && (
          <div className="ranked-dropdown ranked-dropdown-arena">
            {rankedArenaOptions.map((option) => (
              <button
                className={option.id === selectedArena.id ? 'is-selected' : ''}
                key={option.id}
                onClick={() => {
                  setSelectedArena(option);
                  setOpenMenu(null);
                }}
              >
                <strong>{option.label}</strong>
                <span>{option.stake}</span>
                <em className={option.bonus ? 'has-bonus' : ''}>
                  <b className={option.bonus ? '' : 'is-empty'}>{option.bonus ?? ''}</b>
                  <span>
                    <Users size={17} />
                    {option.players}
                  </span>
                </em>
              </button>
            ))}
          </div>
        )}
      </div>

      <button className="ranked-start-button" onClick={() => onStart({ game: selectedGame, arena: selectedArena })}>
        开始匹配
      </button>
      <div className="ranked-countdown">
        [05/01 - 07/01] 34天18时后结束
      </div>
    </section>
  );
}

function TabShell({ tab }: { tab: BottomTab }) {
  const tabConfigs: Partial<Record<BottomTab, { eyebrow: string; title: string; cards: string[]; rows: string[][] }>> = {
    learn: {
      eyebrow: '学棋',
      title: '课程、题库、名局拆解',
      cards: ['入门课', '杀法训练', '大师讲堂'],
      rows: [
        ['今日训练', '马后炮与重炮杀'],
        ['专项题库', '残局、开局、中局分类'],
        ['学习进度', '本地完成度 12%'],
      ],
    },
    world: {
      eyebrow: '棋界',
      title: '赛事、棋谱、棋友动态',
      cards: ['热门赛事', '棋谱广场', '棋友圈'],
      rows: [
        ['直播预告', '象甲精选对局'],
        ['热门棋谱', '顺炮直车对横车'],
        ['棋友动态', '本地信息流外壳'],
      ],
    },
    discover: {
      eyebrow: '发现',
      title: '活动、任务、福利入口',
      cards: ['签到', '任务', '商城'],
      rows: [
        ['每日签到', '银币 +100'],
        ['成长任务', '完成一局普通对局'],
        ['皮肤背包', '自制棋盘皮肤预留'],
      ],
    },
  };
  const config = tabConfigs[tab] ?? {
    eyebrow: '模块',
    title: '页面外壳',
    cards: ['入口', '数据', '设置'],
    rows: [['内容', '阶段四已接入']],
  };

  return (
    <section className="placeholder-page">
      <div className="section-title">
        <p className="eyebrow">{config.eyebrow}</p>
        <h2>{config.title}</h2>
      </div>
      <div className="feature-grid">
        {config.cards.map((card) => (
          <ModeCard title={card} value="已预留" key={card} />
        ))}
      </div>
      <div className="feed-list">
        {config.rows.map(([title, detail]) => (
          <InfoRow title={title} detail={detail} key={title} />
        ))}
      </div>
    </section>
  );
}

function mapXiangqiLobbyEntry(entryId: string): XiangqiFeatureEntryId {
  const map: Record<string, XiangqiFeatureEntryId> = {
    certification: 'rank-certification',
    puzzle: 'endgame',
    rating: 'skill-evaluation',
    coin: 'coin-arena',
    huashan: 'huashan',
    fast: 'ranked-5',
    friend: 'friend-match',
    bot: 'ai-match',
    records: 'my-records',
    events: 'tournament',
  };
  return map[entryId] ?? 'skill-evaluation';
}

function mapXiangqiDockItem(label: string): XiangqiFeatureEntryId {
  const item = xiangqiFeatureDockItems.find((candidate) => candidate.title === label);
  return item?.id ?? 'activity-center';
}

function LobbyScreen({
  onFeature,
}: {
  onFeature: (entryId: XiangqiFeatureEntryId) => void;
}) {
  return (
    <section className="xiangqi-lobby" aria-label="象棋入口">
      <div className="xiangqi-lobby-head">
        <div className="lobby-currency" aria-label="资产">
          <span>
            <Coins size={16} />
            0
          </span>
          <span>
            <Gem size={16} />
            3500
          </span>
        </div>
      </div>

      <div className="xiangqi-entry-card">
        {xiangqiLobbyEntries.map((entry) => {
          const Icon = entry.icon;
          return (
            <button
              className="xiangqi-entry"
              key={entry.id}
              onClick={() => onFeature(mapXiangqiLobbyEntry(entry.id))}
            >
              <span className={`xiangqi-entry-icon tone-${entry.tone}`} aria-hidden="true">
                <Icon size={24} />
              </span>
              <span className="xiangqi-entry-copy">
                <strong>{entry.title}</strong>
                <small>{entry.count}</small>
              </span>
              <ChevronRight size={21} aria-hidden="true" />
            </button>
          );
        })}

        <div className="xiangqi-entry-divider" />

        {xiangqiSecondaryEntries.map((entry) => {
          const Icon = entry.icon;
          return (
            <button
              className="xiangqi-entry is-secondary"
              key={entry.id}
              onClick={() => onFeature(mapXiangqiLobbyEntry(entry.id))}
            >
              <span className={`xiangqi-entry-icon tone-${entry.tone}`} aria-hidden="true">
                <Icon size={24} />
              </span>
              <span className="xiangqi-entry-copy">
                <strong>{entry.title}</strong>
                <small>{entry.detail}</small>
              </span>
              <ChevronRight size={21} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="xiangqi-floaters" aria-hidden="true">
        <span className="version-badge">
          <b>6天</b>
          <small>新版本倒计时</small>
        </span>
        <span className="saint-badge">
          棋圣买断
          <small>1天23小时</small>
        </span>
      </div>

      <nav className="xiangqi-dock" aria-label="象棋功能">
        {xiangqiDockItems.map((item) => {
          const Icon = item.icon;
          const featureId = mapXiangqiDockItem(item.label);
          return (
            <button key={item.label} onClick={() => onFeature(featureId)}>
              <span>
                <Icon size={25} />
                {item.badge && <b>{item.badge}</b>}
              </span>
              <small>{item.label}</small>
            </button>
          );
        })}
      </nav>
    </section>
  );
}

function JieqiLobbyScreen({ onFeature }: { onFeature: (entryId: JieqiFeatureEntryId) => void }) {
  return (
    <section className="xiangqi-lobby jieqi-lobby" aria-label="揭棋入口">
      <div className="xiangqi-lobby-head">
        <div className="lobby-currency" aria-label="资产">
          <span>
            <Coins size={16} />
            0
          </span>
          <span>
            <Gem size={16} />
            4500
          </span>
        </div>
      </div>

      <div className="xiangqi-entry-card">
        {jieqiLobbyEntries.map((entry) => {
          const Icon = entry.icon;
          return (
            <button
              className="xiangqi-entry jieqi-entry"
              key={entry.id}
              onClick={() => onFeature(entry.id as JieqiFeatureEntryId)}
            >
              <span className={`xiangqi-entry-icon tone-${entry.tone}`} aria-hidden="true">
                <Icon size={24} />
              </span>
              <span className="xiangqi-entry-copy">
                <strong>{entry.title}</strong>
                <small>{entry.detail ?? entry.count}</small>
              </span>
              <span className="jieqi-meta">
                {entry.bonus && <b>{entry.bonus}</b>}
                {entry.detail && entry.count && <small>{entry.count}</small>}
              </span>
              <ChevronRight size={21} aria-hidden="true" />
            </button>
          );
        })}

        <div className="xiangqi-entry-divider" />

        {jieqiSecondaryEntries.map((entry, index) => {
          const Icon = entry.icon;
          return (
            <Fragment key={entry.id}>
              {index > 0 && <div className="xiangqi-entry-divider" />}
              <button
                className="xiangqi-entry is-secondary jieqi-entry"
                onClick={() => onFeature(entry.id as JieqiFeatureEntryId)}
              >
                <span className={`xiangqi-entry-icon tone-${entry.tone}`} aria-hidden="true">
                  <Icon size={24} />
                </span>
                <span className="xiangqi-entry-copy">
                  <strong>{entry.title}</strong>
                  <small>{entry.detail ?? entry.count}</small>
                </span>
                <ChevronRight size={21} aria-hidden="true" />
              </button>
            </Fragment>
          );
        })}
      </div>

      <div className="xiangqi-floaters jieqi-floaters" aria-hidden="true">
        <span className="version-badge">
          <b>6天</b>
          <small>新版本倒计时</small>
        </span>
        <span className="saint-badge">
          惊喜奖励
          <small>1天23小时</small>
        </span>
      </div>

      <nav className="xiangqi-dock" aria-label="揭棋功能">
        {jieqiFeatureDockItems.map((item) => {
          const localDock = xiangqiDockItems.find((candidate) => candidate.label === item.label) ?? xiangqiDockItems[0];
          const Icon = localDock.icon;
          return (
            <button key={item.label} onClick={() => onFeature(item.entryId)}>
              <span>
                <Icon size={25} />
                {item.badge && <b>{item.badge}</b>}
              </span>
              <small>{item.label}</small>
            </button>
          );
        })}
      </nav>
    </section>
  );
}

function GameScreen({
  game,
  opponent,
  moveHints,
  suppressPausePanel,
  analysisOpen,
  menuOpen,
  drawOffersLeft,
  undoLeft,
  onSelectPoint,
  onResign,
  onRequestExit,
  onOpenChat,
  onOpenSettings,
  onOpenAnalysis,
  onCloseAnalysis,
  onTogglePause,
  onToggleMenu,
  onOfferDraw,
  onUndoRound,
  onInviteSpectator,
}: {
  game: GameState;
  opponent: { name: string; rank: string };
  moveHints: boolean;
  suppressPausePanel: boolean;
  analysisOpen: boolean;
  menuOpen: boolean;
  drawOffersLeft: number;
  undoLeft: number;
  onSelectPoint: (point: Position) => void;
  onResign: () => void;
  onRequestExit: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
  onOpenAnalysis: () => void;
  onCloseAnalysis: () => void;
  onTogglePause: () => void;
  onToggleMenu: () => void;
  onOfferDraw: () => void;
  onUndoRound: () => void;
  onInviteSpectator: () => void;
}) {
  const isRedInCheck = isInCheck(game.pieces, 'red');
  const isBlackInCheck = isInCheck(game.pieces, 'black');
  const statusText = game.phase === 'ended'
    ? resultText(game.result)
    : game.turn === 'red'
      ? '我方走棋'
      : 'AI 正在思考';
  const stepLimit = stepSecondsForMove(
    game.moveHistory.length,
    game.regularStepSeconds,
    game.openingStepSeconds,
    game.openingMoveCount,
  );

  return (
    <section className="game-layout">
      <div className="player-column">
        <PlayerBadge name={opponent.name} rank={opponent.rank} active={game.turn === 'black'} />
        <TimerBox total={formatClock(game.blackTotal)} step={formatClock(game.turn === 'black' ? game.stepLeft : stepLimit)} />
      </div>
      <div className="board-panel">
        <div className="game-side-actions" aria-label="对局快捷操作">
          <button onClick={onInviteSpectator}>邀请旁观</button>
          <button onClick={onOpenAnalysis}>推演</button>
        </div>
        <div className="game-status">
          <strong>{statusText}</strong>
          <span>{isRedInCheck ? '我方被将军' : isBlackInCheck ? '对方被将军' : `第 ${game.moveHistory.length + 1} 手`}</span>
        </div>
        <ChessBoard
          pieces={game.pieces}
          selectedPiece={game.selectedPieceId ?? undefined}
          marks={visibleGameLegalMarks(game, moveHints)}
          recentMove={game.recentMove}
          onSelectPoint={onSelectPoint}
        />
        <div className="game-toolbar">
          <button onClick={onToggleMenu} aria-expanded={menuOpen}>
            <House size={17} />
            菜单
          </button>
          <button onClick={onOpenChat}>
            <MessageCircle size={17} />
            聊天
          </button>
          <button onClick={onInviteSpectator}>
            <UserRound size={17} />
            邀请旁观
          </button>
        </div>
        {menuOpen && (
          <div className="game-action-menu">
            <button onClick={onRequestExit}>
              <House size={17} />
              离开
            </button>
            <button onClick={onResign}>
              <Flag size={17} />
              认输
            </button>
            <button onClick={onOfferDraw}>
              <MessageCircle size={17} />
              提和({drawOffersLeft})
            </button>
            <button onClick={onUndoRound}>
              <RotateCcw size={17} />
              悔棋({undoLeft})
            </button>
            <button onClick={onOpenSettings}>
              <Settings size={17} />
              设置
            </button>
          </div>
        )}
        {game.paused && !suppressPausePanel && (
          <div className="pause-panel">
            <button className="round-button" aria-label="关闭菜单" onClick={onTogglePause}>
              <X size={18} />
            </button>
            <strong>对局已暂停</strong>
            <span>当前局面、计时和合法走点都会保留。</span>
          </div>
        )}
        {analysisOpen && (
          <div className="analysis-panel" role="dialog" aria-modal="true" aria-label="对局推演">
            <div className="analysis-title">对局推演</div>
            <p>
              步时剩余
              <strong>{formatClock(game.stepLeft)}</strong>
            </p>
            <span>步时不足10秒退出推演</span>
            <ChessBoard
              pieces={game.pieces}
              compact
              marks={recentMarks(game.recentMove)}
              recentMove={game.recentMove}
            />
            <div className="analysis-controls">
              <button onClick={onCloseAnalysis}>离开</button>
              <button onClick={onCloseAnalysis}>开局</button>
              <button onClick={onCloseAnalysis}>上一步</button>
              <button onClick={onCloseAnalysis}>下一步</button>
            </div>
          </div>
        )}
      </div>
      <div className="player-column">
        <PlayerBadge name="我方" rank="业余1级" active={game.turn === 'red'} />
        <TimerBox total={formatClock(game.redTotal)} step={formatClock(game.turn === 'red' ? game.stepLeft : stepLimit)} />
      </div>
    </section>
  );
}

function ResultScreen({
  result,
  opponent,
  matchMode,
  sessionLabel,
  playSession,
  onReplay,
  onAgain,
  onSwitchOpponent,
  onShare,
}: {
  result: GameResult | null;
  opponent: { name: string; rank: string };
  matchMode: MatchMode;
  sessionLabel: string;
  playSession: XiangqiPlaySession;
  onReplay: () => void;
  onAgain: () => void;
  onSwitchOpponent: () => void;
  onShare: () => void;
}) {
  const winnerName = result?.winner === 'red' ? '我方' : opponent.name;
  const reason = result ? resultReason(result.reason, result.winner) : '我方认输';
  const didWin = result?.winner === 'red';
  const summary = getPlaySessionResultSummary(playSession, didWin);
  const points = summary.delta;
  const lastMove = result ? result.moves[result.moves.length - 1] ?? null : null;
  const modeLabel = sessionLabel || (matchModes.find((mode) => mode.id === matchMode)?.label ?? '棋力评测');
  const moveCount = result?.moves.length ?? 0;
  const rounds = Math.ceil(moveCount / 2);
  const canReplay = moveCount > 0;
  const resultDate = formatResultDate(result?.endedAt);

  if (playSession.kind === 'certification') {
    return (
      <CertificationResultScreen
        canReplay={canReplay}
        didWin={didWin}
        lastMove={lastMove}
        opponent={opponent}
        onAgain={onAgain}
        onReplay={onReplay}
        onShare={onShare}
        onSwitchOpponent={onSwitchOpponent}
        reason={reason}
        result={result}
        summary={summary}
      />
    );
  }

  return (
    <section className="result-layout">
      <div className="result-hero">
        <div className="result-player-card">
          <PlayerBadge name="我方" rank="业余1级" active={result?.winner === 'red'} />
          <span>{playSession.kind === 'coin' ? summary.progressLabel : `${summary.metricTitle} ${points}`}</span>
        </div>
        <div className="result-title-block">
          <p className="eyebrow">{modeLabel} · 对局结束</p>
          <h2>{winnerName}胜</h2>
          <span>{reason}</span>
        </div>
        <div className="result-player-card">
          <PlayerBadge name={opponent.name} rank={opponent.rank} active={result?.winner === 'black'} />
          <span>{playSession.tableLabel}</span>
        </div>
      </div>

      <div className="result-main-grid">
        <div className="result-info-panel">
          <div className="score-summary">
            <ModeCard title="结果原因" value={reason} />
            <ModeCard title="回合数" value={`${rounds}回合`} />
            <ModeCard title="用时" value={formatClock(result?.elapsed ?? 0)} />
            <ModeCard title="日期" value={resultDate} />
          </div>
          <div className="result-session-grid">
            {summary.rows.map((row) => (
              <InfoRow title={row.title} detail={row.detail} key={row.title} />
            ))}
          </div>
          <div className="rank-progress-panel">
            <div>
              <strong>{summary.progressTitle}</strong>
              <small>{summary.metricTitle}</small>
              <span>{summary.progressLabel}</span>
            </div>
            <strong className={points.startsWith('+') ? 'is-positive' : 'is-negative'}>{points}</strong>
            <div className="progress-track">
              <span style={{ width: `${summary.progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="result-board-panel">
          <div className="section-title">
            <p className="eyebrow">棋局缩略</p>
            <h2>{lastMove?.notation ?? '暂无最近一步'}</h2>
          </div>
          <ChessBoard pieces={result?.pieces ?? startingPieces.slice(0, 20)} compact marks={recentMarks(lastMove)} />
        </div>
      </div>

      <div className="result-actions">
        <button onClick={onSwitchOpponent}>切换对手</button>
        <button className="primary-action" onClick={onAgain}>
          <RotateCcw size={18} />
          再来一局
        </button>
        <button onClick={onShare}>分享</button>
        <button onClick={onReplay} disabled={!canReplay} aria-disabled={!canReplay}>
          <ScrollText size={18} />
          复盘分析
        </button>
      </div>
      {!canReplay && <div className="empty-hint">暂无可复盘棋谱</div>}
    </section>
  );
}

function CertificationResultScreen({
  result,
  opponent,
  summary,
  didWin,
  reason,
  lastMove,
  canReplay,
  onReplay,
  onAgain,
  onSwitchOpponent,
  onShare,
}: {
  result: GameResult | null;
  opponent: { name: string; rank: string };
  summary: ReturnType<typeof getPlaySessionResultSummary>;
  didWin: boolean;
  reason: string;
  lastMove: Move | null;
  canReplay: boolean;
  onReplay: () => void;
  onAgain: () => void;
  onSwitchOpponent: () => void;
  onShare: () => void;
}) {
  const resultMark = didWin ? '胜' : '负';
  const resultTitle = didWin ? '我方胜' : `${opponent.name}胜`;
  const upgradeTitle = didWin && summary.progressLabel.startsWith('100/');

  return (
    <section className="certification-result-layout">
      {upgradeTitle && (
        <div className="certification-upgrade-banner">
          <strong>恭喜升级</strong>
          <span>镇级棋士III</span>
        </div>
      )}
      <div className="certification-result-card">
        <button className="round-button" aria-label="关闭结算提示">
          <X size={17} />
        </button>
        <button className="round-button is-help" aria-label="结算帮助">
          <HelpCircle size={17} />
        </button>
        <div className="certification-result-versus">
          <PlayerBadge name="我方" rank="镇级棋士III" active={didWin} />
          <strong className={didWin ? 'is-win' : 'is-loss'}>{resultMark}</strong>
          <PlayerBadge name={opponent.name} rank={opponent.rank} active={!didWin} />
        </div>
        <p className="certification-result-meta">棋力认证第4届 · {reason}</p>
        <div className="certification-score-delta">
          <strong className={summary.delta.startsWith('+') ? 'is-positive' : 'is-negative'}>{summary.delta}</strong>
          <span>本局得分</span>
        </div>
        <div className="certification-score-track">
          <span>{summary.progressTitle}</span>
          <strong>{summary.progressLabel}</strong>
          <span>镇级棋士II</span>
          <div className="progress-track">
            <span style={{ width: `${summary.progressPercent}%` }} />
          </div>
        </div>
        <div className="certification-mini-board">
          <ChessBoard pieces={result?.pieces ?? startingPieces.slice(0, 20)} compact marks={recentMarks(lastMove)} />
        </div>
        <div className="certification-result-actions">
          <button onClick={onSwitchOpponent}>切换对手</button>
          <button onClick={onAgain}>再来一局</button>
          <button onClick={onShare}>分享</button>
          <button onClick={onReplay} disabled={!canReplay} aria-disabled={!canReplay}>复盘分析</button>
        </div>
      </div>
      <div className="certification-result-caption">{resultTitle}</div>
      {!canReplay && <div className="empty-hint">暂无可复盘棋谱</div>}
    </section>
  );
}

function ReplayScreen({
  result,
  opponent,
  playSession,
  replayStep,
  playing,
  onStep,
  onTogglePlay,
  onBack,
  onToast,
}: {
  result: GameResult | null;
  opponent: { name: string; rank: string };
  playSession: XiangqiPlaySession;
  replayStep: number;
  playing: boolean;
  onStep: (step: number) => void;
  onTogglePlay: () => void;
  onBack: () => void;
  onToast: (message: string, kind?: ToastKind) => void;
}) {
  const moves = result?.moves ?? [];
  const clampedStep = Math.max(0, Math.min(moves.length, replayStep));
  const pieces = buildReplayPieces(moves, clampedStep);
  const recentMove = clampedStep > 0 ? moves[clampedStep - 1] : null;
  const hasMoves = moves.length > 0;
  const resultWinner = result?.winner === 'red' ? '我方胜' : '对方胜';
  const resultLabel = result ? `${resultWinner} · ${resultReason(result.reason, result.winner)}` : '暂无结果';
  const resultDate = formatResultDate(result?.endedAt);
  const sessionRows = getPlaySessionReplayRows(playSession);

  return (
    <section className="replay-layout">
      <div className="replay-board-panel">
        <ChessBoard pieces={pieces} marks={recentMarks(recentMove)} recentMove={recentMove} />
        <div className="replay-bottom-bar">
          <button onClick={onBack}>菜单</button>
          <button onClick={() => onToast('棋谱信息已在右侧展示', 'info')}>棋谱信息</button>
          <button onClick={() => onStep(Math.max(0, clampedStep - 1))} disabled={!hasMoves || clampedStep === 0}>上一步</button>
          <button onClick={() => onStep(Math.min(moves.length, clampedStep + 1))} disabled={!hasMoves || clampedStep === moves.length}>下一步</button>
          <button onClick={() => onToast('分析功能后续接入', 'info')}>分析</button>
        </div>
      </div>
      <aside className="notation-panel">
        <div className="section-title">
          <p className="eyebrow">棋谱信息 · {clampedStep}/{moves.length}</p>
          <h2>{playSession.label}棋谱</h2>
        </div>
        <div className="replay-session-tags" aria-label="棋谱标签">
          {playSession.replayTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="replay-meta-grid">
          {sessionRows.map((row) => (
            <InfoRow title={row.title} detail={row.detail} key={row.title} />
          ))}
          <InfoRow title="红方" detail="我方 · 业余1级" />
          <InfoRow title="黑方" detail={`${opponent.name} · ${opponent.rank}`} />
          <InfoRow title="结果" detail={resultLabel} />
          <InfoRow title="日期" detail={resultDate} />
          <InfoRow title="评论" detail="暂无棋友评论" />
          <InfoRow title="注释" detail={recentMove?.notation ?? '暂无注释'} />
        </div>
        <ol>
          {moves.map((move, index) => (
            <li className={index < clampedStep ? 'is-played' : ''} key={`${move.pieceId}-${index}`}>
              {index + 1}. {move.notation}
            </li>
          ))}
        </ol>
        {!hasMoves && <InfoRow title="暂无可复盘棋谱" detail="本局未产生走子，棋盘保留初始空状态" />}
        <div className="replay-controls">
          <button onClick={() => onToast('暂无变着', 'info')} disabled={!hasMoves}>
            <SkipBack size={18} />
            上变
          </button>
          <button onClick={() => onStep(Math.max(0, clampedStep - 1))} disabled={!hasMoves || clampedStep === 0}>
            <ChevronLeft size={18} />
            上一步
          </button>
          <button className="primary-action" onClick={onTogglePlay} disabled={!hasMoves}>
            {playing ? <Pause size={18} /> : <Play size={18} />}
            {playing ? '暂停' : '播放'}
          </button>
          <button onClick={() => onStep(Math.min(moves.length, clampedStep + 1))} disabled={!hasMoves || clampedStep === moves.length}>
            下一步
            <ChevronRight size={18} />
          </button>
          <button onClick={() => onToast('暂无变着', 'info')} disabled={!hasMoves}>
            下变
            <SkipForward size={18} />
          </button>
        </div>
        <button className="full-width" onClick={() => onToast('复制棋谱功能为本地占位', 'info')}>
          复制棋谱
        </button>
        <button className="full-width" onClick={onBack}>
          返回结算
        </button>
      </aside>
    </section>
  );
}

function MatchingOverlay({ session, onCancel }: { session: XiangqiPlaySession; onCancel: () => void }) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="matching-card">
        <button className="round-button" aria-label="取消匹配" onClick={onCancel}>
          <X size={18} />
        </button>
        <div className="matching-spinner">
          <Swords size={34} />
        </div>
        <p className="eyebrow">正在匹配</p>
        <h2>{session.label}</h2>
        <span>{session.detail} · {session.timeLabel} · {session.tableLabel}</span>
        <div className="match-progress">
          <i />
        </div>
      </div>
    </div>
  );
}

function GameIntroDialog({
  playSession,
  onLeave,
  onStart,
  onSwitchTable,
}: {
  playSession: XiangqiPlaySession;
  onLeave: () => void;
  onStart: () => void;
  onSwitchTable: () => void;
}) {
  const isCertification = playSession.kind === 'certification';
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className={`confirm-card game-intro-card ${isCertification ? 'is-certification' : ''}`}>
        <p className="eyebrow">本场说明</p>
        {isCertification ? (
          <div className="certification-intro-copy">
            <strong>输赢仅计算棋力分</strong>
            <span>局时:15分钟</span>
            <span>步时:90秒(前3步=30秒)</span>
          </div>
        ) : (
          <>
            <h2>{playSession.label}</h2>
            <div className="intro-rules">
              <InfoRow title="场次" detail={`${playSession.arenaTitle} · ${playSession.tableLabel}`} />
              <InfoRow title="局时" detail={playSession.timeLabel} />
              <InfoRow title="步时" detail={playSession.stepLabel} />
              {playSession.matchMode === 'training' && <InfoRow title="难度" detail={playSession.arenaTitle} />}
              <InfoRow title="入场" detail={playSession.costLabel} />
              <InfoRow title="结算" detail={playSession.rewardLabel} />
            </div>
          </>
        )}
        <div className="feature-dialog-actions game-intro-actions">
          <button onClick={onLeave} type="button">
            <ChevronLeft size={18} />
            离开
          </button>
          {(playSession.kind === 'minute' || playSession.kind === 'coin' || playSession.kind === 'huashan' || playSession.kind === 'friend') && (
            <button onClick={onSwitchTable} type="button">
              <RotateCcw size={18} />
              {playSession.kind === 'huashan' ? '换台' : playSession.kind === 'friend' ? '换房' : '换桌'}
            </button>
          )}
          <button className="primary-action" onClick={onStart} type="button">
            <Play size={18} />
            开始
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsDialog({
  settings,
  onClose,
  onToggle,
}: {
  settings: GameSettings;
  onClose: () => void;
  onToggle: (key: SettingKey) => void;
}) {
  const items: Array<{ key: SettingKey; label: string; detail: string }> = [
    { key: 'backgroundMusic', label: '背景音乐', detail: '本地静音状态' },
    { key: 'sound', label: '下棋音效', detail: '落子与吃子提示' },
    { key: 'messages', label: '对局时接受对方消息', detail: '聊天抽屉消息' },
    { key: 'autoVoice', label: '自动播放对方语音', detail: '语音消息自动播放' },
    { key: 'localVoice', label: '接受对方的局内个性语音播报', detail: '本地模拟播报' },
    { key: 'moveHints', label: '显示走子提示', detail: '绿色合法落点' },
    { key: 'coordinates', label: '显示棋盘刻度线', detail: '坐标辅助线' },
    { key: 'captureAnimation', label: '显示吃子/将军动画', detail: '保留动效开关' },
    { key: 'boardMarks', label: '棋盘标记功能', detail: '支持复盘标记' },
  ];

  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="confirm-card settings-card">
        <button className="round-button" aria-label="关闭设置" onClick={onClose}>
          <X size={18} />
        </button>
        <p className="eyebrow">对局设置</p>
        <h2>经典木棋盘</h2>
        <div className="settings-list">
          {items.map((item) => (
            <button
              className="setting-row"
              key={item.key}
              onClick={() => onToggle(item.key)}
              role="switch"
              aria-checked={settings[item.key]}
            >
              <span>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
              <i className={settings[item.key] ? 'is-on' : ''} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatDrawer({
  messages,
  tab,
  text,
  onClose,
  onSend,
  onTab,
  onText,
}: {
  messages: string[];
  tab: ChatTab;
  text: string;
  onClose: () => void;
  onSend: () => void;
  onTab: (tab: ChatTab) => void;
  onText: (text: string) => void;
}) {
  const emojiItems = ['赞', '稳', '妙', '哭', '酷', '困', '怒', '笑', '将', '茶', '鼓', '赢'];
  const quickMessages = [
    '棋逢对手，将遇良才，猜快，猜快!',
    '再与我对弈一局?',
    '呀！大意失荆州!',
    '宁失一子，不失一先!',
    '哈哈，小卒过河顶大车!',
    '单车难破士象全呀!',
    '观棋不语真君子，落子无悔大丈夫!',
  ];
  return (
    <div className="modal-layer is-bottom" role="dialog" aria-modal="true">
      <div className="chat-drawer">
        <div className="chat-header">
          <div className="segmented">
            <button className={tab === 'emoji' ? 'is-active' : ''} onClick={() => onTab('emoji')}>
              魔法表情
            </button>
            <button className={tab === 'log' ? 'is-active' : ''} onClick={() => onTab('log')}>
              聊天记录
            </button>
          </div>
          <button className="round-button" aria-label="关闭聊天" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {tab === 'emoji' ? (
          <div className="emoji-grid">
            {emojiItems.map((item) => (
              <button key={item} onClick={() => onText(`${text}${item}`.slice(0, 45))}>
                {item}
              </button>
            ))}
          </div>
        ) : (
          <div className="chat-log quick-chat-log">
            {quickMessages.map((message) => (
              <button key={message} onClick={() => onText(message)} type="button">
                {message}
              </button>
            ))}
            {messages.map((message, index) => (
              <p key={`${message}-${index}`}>{message}</p>
            ))}
          </div>
        )}
        <div className="chat-input-row">
          <input
            maxLength={45}
            onChange={(event) => onText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSend();
            }}
            placeholder="最多45字"
            value={text}
          />
          <button className="primary-action" onClick={onSend}>
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  action,
  onCancel,
  onConfirm,
}: {
  action: ConfirmAction;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const title = action === 'resign' ? '确认投降？' : '退出本局？';
  const detail = action === 'resign' ? '投降后本局立即判负，并进入结算。' : '退出会按认输处理，并保留棋谱用于复盘。';
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="confirm-card">
        <p className="eyebrow">对局确认</p>
        <h2>{title}</h2>
        <span>{detail}</span>
        <div className="result-actions">
          <button onClick={onCancel}>继续对局</button>
          <button className="primary-action" onClick={onConfirm}>
            <Flag size={18} />
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div className={`toast-message is-${toast.kind}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}

function ProfileScreen() {
  return (
    <section className="profile-layout">
      <div className="profile-hero">
        <PlayerBadge name="本地棋手" rank="业余1级" active />
        <div>
          <p className="eyebrow">个人页占位</p>
          <h2>战绩与资产将在后续接入</h2>
        </div>
      </div>
      <div className="feature-grid">
        <ModeCard title="总对局" value="0" />
        <ModeCard title="胜率" value="--" />
        <ModeCard title="收藏棋谱" value="0" />
      </div>
      <div className="feed-list">
        <InfoRow title="我的棋谱" detail="本地复盘记录入口" />
        <InfoRow title="设置" detail="音效、提示、棋盘皮肤" />
      </div>
    </section>
  );
}

function ChessBoard({
  pieces,
  selectedPiece,
  marks = [],
  hintArrow,
  recentMove,
  compact = false,
  thumbnail = false,
  onSelectPoint,
}: {
  pieces: Piece[];
  selectedPiece?: string;
  marks?: Position[];
  hintArrow?: { from: Position; to: Position };
  recentMove?: Move | null;
  compact?: boolean;
  thumbnail?: boolean;
  onSelectPoint?: (point: Position) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardPaddingPercent = thumbnail ? 10 : BOARD_PADDING_PERCENT;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      drawBoard(ctx, rect.width, rect.height, boardPaddingPercent / 100);
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [boardPaddingPercent]);

  function handleBoardClick(event: MouseEvent<HTMLDivElement>) {
    if (!onSelectPoint) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const playableSize = 100 - boardPaddingPercent * 2;
    const percentX = ((event.clientX - rect.left) / rect.width) * 100;
    const percentY = ((event.clientY - rect.top) / rect.height) * 100;
    const x = Math.round(((percentX - boardPaddingPercent) / playableSize) * (BOARD_WIDTH - 1));
    const y = Math.round(((percentY - boardPaddingPercent) / playableSize) * (BOARD_HEIGHT - 1));
    if (inBounds({ x, y })) onSelectPoint({ x, y });
  }

  return (
    <div className={`chess-board ${compact ? 'is-compact' : ''} ${thumbnail ? 'is-thumbnail' : ''}`} onClick={handleBoardClick}>
      <span className="board-ornament is-top" aria-hidden="true" />
      <span className="board-ornament is-bottom" aria-hidden="true" />
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="board-river">
        <span>楚河</span>
        <span>汉界</span>
      </div>
      {recentMove && (
        <>
          <span className="recent-ring" style={pointStyle(recentMove.from, boardPaddingPercent)} />
          <span className="recent-ring is-target" style={pointStyle(recentMove.to, boardPaddingPercent)} />
        </>
      )}
      {marks.map((mark) => (
        <span className="move-mark" key={`${mark.x}-${mark.y}`} style={pointStyle(mark, boardPaddingPercent)} />
      ))}
      {hintArrow && <HintArrow from={hintArrow.from} to={hintArrow.to} paddingPercent={boardPaddingPercent} />}
      {pieces.map((piece) => {
        const pieceImage = getGeneratedPieceImage(piece);
        return (
          <button
            className={`piece ${piece.side} ${pieceImage ? 'is-image-piece' : ''} ${piece.id === selectedPiece ? 'is-selected' : ''}`}
            key={piece.id}
            style={pointStyle(piece, boardPaddingPercent)}
            onClick={(event) => {
              event.stopPropagation();
              onSelectPoint?.({ x: piece.x, y: piece.y });
            }}
            aria-label={`${piece.side === 'red' ? '红方' : '黑方'}${piece.label || '暗子'}`}
          >
            {pieceImage ? (
              <img className="piece-image" src={pieceImage} alt="" aria-hidden="true" />
            ) : (
              <span className="piece-glyph" data-label={piece.label}>
                {piece.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function getGeneratedPieceImage(piece: Piece) {
  if (piece.label === '暗' || piece.label === '') return jieqiBackPiece;
  return generatedPieceImages[piece.side][piece.kind];
}

function HintArrow({ from, to, paddingPercent = BOARD_PADDING_PERCENT }: { from: Position; to: Position; paddingPercent?: number }) {
  const fromStyle = pointStyle(from, paddingPercent);
  const toStyle = pointStyle(to, paddingPercent);
  const fromLeft = parseFloat(String(fromStyle.left));
  const fromTop = parseFloat(String(fromStyle.top));
  const toLeft = parseFloat(String(toStyle.left));
  const toTop = parseFloat(String(toStyle.top));
  const dx = toLeft - fromLeft;
  const dy = toTop - fromTop;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return (
    <span
      className="hint-arrow"
      style={{
        left: `${fromLeft}%`,
        top: `${fromTop}%`,
        width: `${length}%`,
        transform: `rotate(${angle}deg)`,
      }}
    />
  );
}

function drawBoard(ctx: CanvasRenderingContext2D, width: number, height: number, paddingRatio = 0.07) {
  const padding = Math.min(width, height) * paddingRatio;
  const boardWidth = width - padding * 2;
  const boardHeight = height - padding * 2;
  const cellX = boardWidth / 8;
  const cellY = boardHeight / 9;

  ctx.save();
  ctx.strokeStyle = 'rgba(72, 34, 14, 0.88)';
  ctx.shadowColor = 'rgba(255, 229, 172, 0.25)';
  ctx.shadowBlur = 0.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1.9;
  ctx.strokeRect(padding, padding, boardWidth, boardHeight);
  ctx.lineWidth = 1.05;

  for (let x = 0; x <= 8; x += 1) {
    ctx.beginPath();
    ctx.moveTo(padding + x * cellX, padding);
    ctx.lineTo(padding + x * cellX, padding + 4 * cellY);
    ctx.moveTo(padding + x * cellX, padding + 5 * cellY);
    ctx.lineTo(padding + x * cellX, padding + 9 * cellY);
    ctx.stroke();
  }

  for (let y = 0; y <= 9; y += 1) {
    ctx.beginPath();
    ctx.moveTo(padding, padding + y * cellY);
    ctx.lineTo(padding + 8 * cellX, padding + y * cellY);
    ctx.stroke();
  }

  drawPalace(ctx, padding, cellX, cellY, 0);
  drawPalace(ctx, padding, cellX, cellY, 7);
  drawPositionMarks(ctx, padding, cellX, cellY);
  ctx.restore();
}

function drawPalace(ctx: CanvasRenderingContext2D, padding: number, cellX: number, cellY: number, topRow: number) {
  ctx.beginPath();
  ctx.moveTo(padding + 3 * cellX, padding + topRow * cellY);
  ctx.lineTo(padding + 5 * cellX, padding + (topRow + 2) * cellY);
  ctx.moveTo(padding + 5 * cellX, padding + topRow * cellY);
  ctx.lineTo(padding + 3 * cellX, padding + (topRow + 2) * cellY);
  ctx.stroke();
}

function drawPositionMarks(ctx: CanvasRenderingContext2D, padding: number, cellX: number, cellY: number) {
  const points = [
    { x: 1, y: 2 },
    { x: 7, y: 2 },
    { x: 0, y: 3 },
    { x: 2, y: 3 },
    { x: 4, y: 3 },
    { x: 6, y: 3 },
    { x: 8, y: 3 },
    { x: 0, y: 6 },
    { x: 2, y: 6 },
    { x: 4, y: 6 },
    { x: 6, y: 6 },
    { x: 8, y: 6 },
    { x: 1, y: 7 },
    { x: 7, y: 7 },
  ];
  ctx.save();
  ctx.strokeStyle = 'rgba(72, 34, 14, 0.62)';
  ctx.fillStyle = 'rgba(72, 34, 14, 0.48)';
  ctx.lineWidth = 1;
  const markScale = Math.min(cellX, cellY);
  for (const point of points) {
    const cx = padding + point.x * cellX;
    const cy = padding + point.y * cellY;
    drawMarkCorners(ctx, cx, cy, point.x > 0, point.x < BOARD_WIDTH - 1, markScale);
  }
  ctx.restore();
}

function drawMarkCorners(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  drawLeft: boolean,
  drawRight: boolean,
  scale: number,
) {
  const gap = Math.max(3.2, scale * 0.16);
  const length = Math.max(2.6, scale * 0.12);
  const dotStep = Math.max(0.8, scale * 0.04);
  const dotRadius = Math.max(0.3, scale * 0.012);
  const drawCorner = (xSide: -1 | 1, ySide: -1 | 1) => {
    ctx.beginPath();
    ctx.moveTo(cx + xSide * gap, cy + ySide * (gap + length));
    ctx.lineTo(cx + xSide * gap, cy + ySide * gap);
    ctx.lineTo(cx + xSide * (gap + length), cy + ySide * gap);
    ctx.stroke();

    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(
        cx + xSide * (gap + 2 + i * dotStep),
        cy + ySide * (gap + 2 + i * dotStep),
        dotRadius,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  };

  if (drawLeft) {
    drawCorner(-1, -1);
    drawCorner(-1, 1);
  }
  if (drawRight) {
    drawCorner(1, -1);
    drawCorner(1, 1);
  }
}

function PlayerBadge({ name, rank, active = false }: { name: string; rank: string; active?: boolean }) {
  return (
    <div className={`player-badge ${active ? 'is-active' : ''}`}>
      <span>{name.slice(0, 1)}</span>
      <div>
        <strong>{name}</strong>
        <small>{rank}</small>
      </div>
    </div>
  );
}

function TimerBox({ total, step }: { total: string; step: string }) {
  return (
    <div className="timer-box">
      <span>{total}</span>
      <strong>{step}</strong>
    </div>
  );
}

function InfoRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="info-row">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function ModeCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="mode-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function GobangBoard({
  board,
  lastMove,
  onPoint,
}: {
  board: number[][];
  lastMove?: Position | null;
  onPoint: (x: number, y: number) => void;
}) {
  return (
    <div className="gobang-board" style={{ '--gobang-size': gobangSize } as CSSProperties}>
      {board.map((row, y) =>
        row.map((cell, x) => (
          <button
            className={`gobang-cell ${cell === 1 ? 'is-black' : cell === 2 ? 'is-white' : ''} ${lastMove?.x === x && lastMove.y === y ? 'is-last' : ''}`}
            aria-label={`五子棋 ${x + 1}-${y + 1}`}
            key={`${x}-${y}`}
            onClick={() => onPoint(x, y)}
          >
            {cell !== 0 && <span />}
          </button>
        )),
      )}
      <LayoutGrid size={18} className="gobang-corner" aria-hidden="true" />
    </div>
  );
}

function recentMarks(move: Move | null): Position[] {
  return move ? [move.from, move.to] : [];
}

function visibleGameLegalMarks(game: GameState, moveHints: boolean): Position[] {
  if (!moveHints || game.phase !== 'playing' || game.turn !== 'red' || !game.selectedPieceId) return [];
  const selected = findPiece(game.pieces, game.selectedPieceId);
  if (!selected || selected.side !== 'red') return [];
  const currentLegalMoves = getLegalMoves(game.pieces, selected);
  return game.legalMoves.filter((move) => hasPoint(currentLegalMoves, move));
}

function pointStyle(point: Position, paddingPercent = BOARD_PADDING_PERCENT): CSSProperties {
  const playableSize = 100 - paddingPercent * 2;
  return {
    left: `${paddingPercent + (point.x / 8) * playableSize}%`,
    top: `${paddingPercent + (point.y / 9) * playableSize}%`,
  };
}

function formatClock(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatResultDate(isoDate?: string): string {
  const date = isoDate ? new Date(isoDate) : new Date();
  if (Number.isNaN(date.getTime())) return '--';
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}

function resultText(result: GameResult | null): string {
  if (!result) return '对局结束';
  return `${result.winner === 'red' ? '我方' : 'AI'}${resultReason(result.reason, result.winner)}`;
}

function resultReason(reason: EndReason, winner: Side): string {
  const loser = winner === 'red' ? '对方' : '我方';
  if (reason === 'checkmate') return `${loser}被将死`;
  if (reason === 'stalemate') return `${loser}无子可走`;
  if (reason === 'timeout') return `${loser}超时`;
  if (reason === 'captured') return `${loser}主帅被吃`;
  return '我方认输';
}
