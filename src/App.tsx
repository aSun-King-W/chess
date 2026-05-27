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
  chooseAiMove,
  chooseGobangMove,
  clonePieces,
  createGobangBoard,
  createInitialGame,
  findPiece,
  finishGame,
  getLegalMoves,
  getPieceAt,
  gobangSize,
  hasGobangWin,
  hasPoint,
  inBounds,
  isInCheck,
  movePiece,
  opposite,
  placeStone,
  puzzlePieces,
  selectPiece,
  samePoint,
  startingPieces,
  stepSecondsForMove,
  undoLastRound,
} from './game';
import type { EndReason, GameResult, GameState, Move, Piece, Position, Side } from './game';
import comingSoonPoster from './assets/more-games/coming-soon.png';
import flipChessPoster from './assets/more-games/flip-chess.png';
import gobangPoster from './assets/more-games/gobang.png';
import jieqiIcon from './assets/mode-icons/jieqi.png';
import moreIcon from './assets/mode-icons/more.png';
import puzzleIcon from './assets/mode-icons/puzzle.png';
import rankedIcon from './assets/mode-icons/ranked.png';
import recentIcon from './assets/mode-icons/recent.png';
import xiangqiIcon from './assets/mode-icons/xiangqi.png';
import bronzeRankEmblem from './assets/ranked/rank-emblem-bronze.png';

type Route = 'home' | 'lobby' | 'jieqi' | 'puzzle' | 'more-game' | 'game' | 'result' | 'replay' | 'profile';
type Mode = 'xiangqi' | 'jieqi' | 'puzzle' | 'more' | 'ranked';
type BottomTab = 'play' | 'learn' | 'world' | 'discover' | 'me';
type MatchMode = 'certification' | 'rating' | 'training' | 'huashan' | 'fast5' | 'standard10' | 'slow20' | 'friend';
type ConfirmAction = 'resign' | 'exit';
type PuzzleState = 'ready' | 'solved' | 'failed';
type ChatTab = 'emoji' | 'log';
type SettingKey = 'moveHints' | 'coordinates' | 'captureAnimation' | 'backgroundMusic' | 'sound' | 'messages';
type GameSettings = Record<SettingKey, boolean>;
type ToastKind = 'info' | 'success' | 'warning';
type RankedMenu = 'game' | 'arena' | null;
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
};
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
type JieqiPiece = Piece & {
  hidden: boolean;
  revealed: boolean;
};
type FlipPiece = {
  id: string;
  side: Side;
  label: string;
  hidden: boolean;
};
type RankedGameOption = {
  id: string;
  label: string;
  baseScore: string;
  players: string;
};
type RankedArenaOption = {
  id: string;
  label: string;
  stake: string;
  players: string;
  bonus?: string;
};
const BOARD_PADDING_PERCENT = 7;
const puzzleHintTarget: Position = { x: 4, y: 0 };
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
    label: '棋力认证赛',
    tag: '积分',
    detail: '本地积分认证 · 胜负影响段级分',
    timeLabel: '15分钟',
    stepLabel: '前3回合30秒，之后90秒',
    cost: '200银币',
    reward: '胜利积分+12',
    entryNote: '立即匹配',
    enabled: true,
    totalSeconds: 15 * 60,
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
    cost: '报名券',
    reward: '活动奖励',
    entryNote: '暂未开放',
    enabled: false,
    totalSeconds: 15 * 60,
    toast: '活动暂未开放',
  },
  {
    id: 'fast5',
    label: '5分钟场',
    tag: '快棋',
    detail: '短局快攻 · 适合碎片练手',
    timeLabel: '5分钟',
    stepLabel: '前3回合30秒，之后90秒',
    cost: '100银币',
    reward: '胜利积分+6',
    entryNote: '快速开局',
    enabled: true,
    totalSeconds: 5 * 60,
  },
  {
    id: 'standard10',
    label: '10分钟场',
    tag: '标准',
    detail: '标准局时 · 排位入口复用此场',
    timeLabel: '10分钟',
    stepLabel: '前3回合30秒，之后90秒',
    cost: '150银币',
    reward: '胜利积分+8',
    entryNote: '标准匹配',
    enabled: true,
    totalSeconds: 10 * 60,
  },
  {
    id: 'slow20',
    label: '20分钟场',
    tag: '慢棋',
    detail: '长考慢棋 · 更接近正式对局',
    timeLabel: '20分钟',
    stepLabel: '前3回合30秒，之后90秒',
    cost: '300银币',
    reward: '胜利积分+14',
    entryNote: '进入慢棋',
    enabled: true,
    totalSeconds: 20 * 60,
  },
  {
    id: 'friend',
    label: '好友对战',
    tag: '房间',
    detail: '房间制对局 · 邀请好友后续接入',
    timeLabel: '自定义',
    stepLabel: '房主设置',
    cost: '免费',
    reward: '友谊局',
    entryNote: '后续开放',
    enabled: false,
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
  { id: 'certification', title: '棋力认证赛4届', count: '9410', icon: Medal, tone: 'violet', mode: 'certification' },
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

const xiangqiDockItems: Array<{ label: string; icon: IconComponent; badge?: string }> = [
  { label: '每日福利', icon: Gift, badge: '2' },
  { label: '活动中心', icon: Gem },
  { label: '广告时间', icon: Video },
  { label: '商城', icon: ShoppingBasket },
];

function getMatchMode(mode: MatchMode): LobbyMode {
  return matchModes.find((item) => item.id === mode) ?? matchModes[0];
}

export default function App() {
  const [route, setRoute] = useState<Route>('home');
  const [activeMode, setActiveMode] = useState<Mode>('xiangqi');
  const [bottomTab, setBottomTab] = useState<BottomTab>('play');
  const [game, setGame] = useState<GameState>(() => createInitialGame());
  const [replayStep, setReplayStep] = useState(0);
  const [matchMode, setMatchMode] = useState<MatchMode>('certification');
  const [sessionLabel, setSessionLabel] = useState('棋力认证赛');
  const [matchingMode, setMatchingMode] = useState<MatchingState | null>(null);
  const [opponentIndex, setOpponentIndex] = useState(1);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [puzzleBoard, setPuzzleBoard] = useState<Piece[]>(() => clonePieces(puzzlePieces));
  const [puzzleSelected, setPuzzleSelected] = useState<string | null>(null);
  const [puzzleLegalMoves, setPuzzleLegalMoves] = useState<Position[]>([]);
  const [puzzleStatus, setPuzzleStatus] = useState<PuzzleState>('ready');
  const [puzzleMoves, setPuzzleMoves] = useState(0);
  const [puzzleSeconds, setPuzzleSeconds] = useState(0);
  const [puzzleHintVisible, setPuzzleHintVisible] = useState(false);
  const [puzzleCommentsOpen, setPuzzleCommentsOpen] = useState(false);
  const [gobangBoard, setGobangBoard] = useState<number[][]>(() => createGobangBoard());
  const [gobangStatus, setGobangStatus] = useState('黑先手');
  const [gameIntroOpen, setGameIntroOpen] = useState(false);
  const [gameMenuOpen, setGameMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState<ChatTab>('emoji');
  const [chatText, setChatText] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>(['系统提示：欢迎来到天天象棋!']);
  const [drawOffersLeft, setDrawOffersLeft] = useState(3);
  const [undoLeft, setUndoLeft] = useState(3);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    moveHints: true,
    coordinates: true,
    captureAnimation: true,
    backgroundMusic: false,
    sound: true,
    messages: true,
  });
  const [toast, setToast] = useState<ToastState | null>(null);
  const contentFrameRef = useRef<HTMLDivElement>(null);
  const isLobbyTitle =
    route === 'lobby' ||
    (route === 'home' && bottomTab === 'play' && (activeMode === 'jieqi' || activeMode === 'puzzle' || activeMode === 'more'));

  const pageTitle = useMemo(() => {
    if (route === 'lobby') return '象棋';
    if (route === 'jieqi') return '揭棋评测';
    if (route === 'puzzle') return '每日残局';
    if (route === 'more-game') return '更多玩法';
    if (route === 'game') return `${sessionLabel}对局`;
    if (route === 'result') return `${sessionLabel}结算`;
    if (route === 'replay') return `${sessionLabel}复盘`;
    if (route === 'profile') return '我的';
    if (bottomTab !== 'play') return bottomTabs.find((item) => item.id === bottomTab)?.label ?? '下棋';
    if (activeMode === 'xiangqi') return '首页';
    if (activeMode === 'puzzle') return '残局挑战';
    return modeItems.find((item) => item.id === activeMode)?.label ?? '下棋';
  }, [activeMode, bottomTab, route, sessionLabel]);

  const currentOpponent = opponents[opponentIndex % opponents.length];

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
    if (!((route === 'home' && activeMode === 'puzzle' && bottomTab === 'play') || route === 'puzzle') || puzzleStatus !== 'ready') return;
    const timer = window.setInterval(() => setPuzzleSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [activeMode, bottomTab, puzzleStatus, route]);

  useEffect(() => {
    if (route !== 'game' || game.phase !== 'playing' || game.turn !== 'black' || game.paused) return;

    const aiDelay = window.setTimeout(() => {
      setGame((current) => {
        if (current.phase !== 'playing' || current.turn !== 'black' || current.paused) return current;
        const move = chooseAiMove(current.pieces, current.moveHistory.length);
        if (!move) return finishGame(current, 'red', 'checkmate');
        return applyMove(current, move.pieceId, move.to);
      });
    }, 650);

    return () => window.clearTimeout(aiDelay);
  }, [game.moveHistory.length, game.paused, game.phase, game.turn, route]);

  useEffect(() => {
    if (game.result && route === 'game') {
      setReplayStep(game.result.moves.length);
      const routeDelay = window.setTimeout(() => setRoute('result'), 600);
      return () => window.clearTimeout(routeDelay);
    }
  }, [game.result, route]);

  useEffect(() => {
    if (!matchingMode) return;
    const matchDelay = window.setTimeout(() => {
      setOpponentIndex((index) => (index + 1) % opponents.length);
      startGame(matchingMode.mode, matchingMode.label);
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

  function showToast(message: string, kind: ToastKind = 'info') {
    setToast({ id: Date.now(), message, kind });
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

  function startMatching(mode: MatchMode, label = getMatchMode(mode).label) {
    const modeInfo = getMatchMode(mode);
    setMatchMode(mode);
    if (!modeInfo.enabled) {
      showToast(modeInfo.toast ?? '入口暂未开放', 'info');
      return;
    }
    setSessionLabel(label);
    setReplayPlaying(false);
    setMatchingMode({ mode, label });
  }

  function startGame(mode = matchMode, label = sessionLabel) {
    const modeInfo = getMatchMode(mode);
    setMatchMode(mode);
    setSessionLabel(label);
    setGame({ ...createInitialGame(modeInfo.totalSeconds), paused: true });
    setReplayStep(0);
    setReplayPlaying(false);
    setConfirmAction(null);
    setSettingsOpen(false);
    setChatOpen(false);
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

  function openSettings() {
    setGameMenuOpen(false);
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

  function sendChatMessage() {
    const message = chatText.trim();
    if (!message) return;
    setChatMessages((current) => [...current, `我方：${message}`]);
    setChatText('');
    setChatTab('log');
  }

  function selectPuzzlePoint(point: Position) {
    if (puzzleStatus === 'solved') return;
    const selected = puzzleSelected ? findPiece(puzzleBoard, puzzleSelected) : undefined;
    const pointPiece = getPieceAt(puzzleBoard, point);
    if (selected && hasPoint(puzzleLegalMoves, point)) {
      const captured = getPieceAt(puzzleBoard, point);
      const nextPieces = movePiece(puzzleBoard, selected.id, point);
      setPuzzleBoard(nextPieces);
      setPuzzleSelected(null);
      setPuzzleLegalMoves([]);
      setPuzzleMoves((moves) => moves + 1);
      setPuzzleHintVisible(false);
      setPuzzleStatus(captured?.kind === 'king' ? 'solved' : 'failed');
      return;
    }
    if (pointPiece?.side === 'red') {
      setPuzzleSelected(pointPiece.id);
      setPuzzleLegalMoves(getLegalMoves(puzzleBoard, pointPiece));
    } else {
      setPuzzleSelected(null);
      setPuzzleLegalMoves([]);
    }
  }

  function resetPuzzle() {
    setPuzzleBoard(clonePieces(puzzlePieces));
    setPuzzleSelected(null);
    setPuzzleLegalMoves([]);
    setPuzzleStatus('ready');
    setPuzzleMoves(0);
    setPuzzleSeconds(0);
    setPuzzleHintVisible(false);
  }

  function playGobang(x: number, y: number) {
    if (gobangBoard[y][x] !== 0 || /胜|满/.test(gobangStatus)) return;
    const afterPlayer = placeStone(gobangBoard, x, y, 1);
    if (hasGobangWin(afterPlayer, 1)) {
      setGobangBoard(afterPlayer);
      setGobangStatus('黑方胜');
      return;
    }
    const aiMove = chooseGobangMove(afterPlayer, x, y);
    if (!aiMove) {
      setGobangBoard(afterPlayer);
      setGobangStatus('棋盘已满');
      return;
    }
    const afterAi = placeStone(afterPlayer, aiMove.x, aiMove.y, 2);
    setGobangBoard(afterAi);
    setGobangStatus(hasGobangWin(afterAi, 2) ? '白方胜' : '黑方落子');
  }

  function resetGobang() {
    setGobangBoard(createGobangBoard());
    setGobangStatus('黑先手');
  }

  const result = game.result;

  return (
    <main className="app-shell">
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
          <button onClick={() => openMode('more')}>
            <span className="recent-token is-image-token" aria-hidden="true">
              <img className="mode-token-image" src={recentIcon} alt="" />
            </span>
            <span>
              <strong>翻翻棋-铜钱场</strong>
              <small>1907</small>
            </span>
            <em>2026.05.26玩过</em>
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

      <section className="phone-stage">
        <header className={`top-bar ${isLobbyTitle ? 'is-game-lobby-title' : ''}`}>
          {isLobbyTitle ? (
            <div className="title-actions" aria-label="玩法页面操作">
              <button className="round-button" aria-label="返回首页" onClick={returnHomeLanding}>
                <ChevronLeft size={24} />
              </button>
              {activeMode !== 'puzzle' && activeMode !== 'more' && (
                <button className="round-button" aria-label="帮助" onClick={() => showToast(`${pageTitle}玩法帮助后续开放`, 'info')}>
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
              gobangBoard={gobangBoard}
              gobangStatus={gobangStatus}
              onStart={() => setRoute('lobby')}
              onStartRanked={() => startMatching('standard10', '排位赛')}
              onStartJieqi={() => setRoute('jieqi')}
              onStartPuzzle={() => setRoute('puzzle')}
              onStartMoreGame={() => setRoute('more-game')}
              onPuzzlePoint={selectPuzzlePoint}
              onPuzzleReset={resetPuzzle}
              onPuzzleHint={() => setPuzzleHintVisible(true)}
              onPuzzleComments={() => setPuzzleCommentsOpen(true)}
              onGobangPoint={playGobang}
              onGobangReset={resetGobang}
              onUnavailable={showToast}
              onReturnHome={returnHomeLanding}
            />
          )}
          {route === 'lobby' && <LobbyScreen onStart={startMatching} onUnavailable={showToast} />}
          {route === 'jieqi' && <JieqiScreen />}
          {route === 'puzzle' && (
            <PuzzleScreen
              pieces={puzzleBoard}
              selectedPiece={puzzleSelected}
              legalMoves={puzzleLegalMoves}
              status={puzzleStatus}
              moves={puzzleMoves}
              seconds={puzzleSeconds}
              hintVisible={puzzleHintVisible}
              onSelectPoint={selectPuzzlePoint}
              onReset={resetPuzzle}
              onHint={() => setPuzzleHintVisible(true)}
              onComments={() => setPuzzleCommentsOpen(true)}
            />
          )}
          {route === 'more-game' && <MoreGamesScreen board={gobangBoard} status={gobangStatus} onPoint={playGobang} onReset={resetGobang} />}
          {route === 'game' && (
            <GameScreen
              game={game}
              opponent={currentOpponent}
              moveHints={gameSettings.moveHints}
              suppressPausePanel={Boolean(confirmAction || gameIntroOpen || settingsOpen)}
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
              onReplay={() => {
                if (!result?.moves.length) {
                  showToast('暂无可复盘棋谱', 'warning');
                  return;
                }
                setReplayPlaying(false);
                setRoute('replay');
              }}
              onAgain={() => startMatching(matchMode)}
              onSwitchOpponent={() => startMatching(matchMode)}
              onShare={() => showToast('分享功能为本地占位', 'info')}
            />
          )}
          {route === 'replay' && (
            <ReplayScreen
              result={result}
              opponent={currentOpponent}
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
        {matchingMode && <MatchingOverlay mode={matchingMode.mode} label={matchingMode.label} onCancel={() => setMatchingMode(null)} />}
        {confirmAction && (
          <ConfirmDialog
            action={confirmAction}
            onCancel={cancelGameAction}
            onConfirm={confirmGameAction}
          />
        )}
        {route === 'game' && gameIntroOpen && (
          <GameIntroDialog matchMode={matchMode} sessionLabel={sessionLabel} onStart={beginGameAfterIntro} />
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
          <PuzzleCommentDialog onClose={() => setPuzzleCommentsOpen(false)} />
        )}
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
  gobangBoard,
  gobangStatus,
  onStart,
  onStartRanked,
  onStartJieqi,
  onStartPuzzle,
  onStartMoreGame,
  onPuzzlePoint,
  onPuzzleReset,
  onPuzzleHint,
  onPuzzleComments,
  onGobangPoint,
  onGobangReset,
  onUnavailable,
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
  gobangBoard: number[][];
  gobangStatus: string;
  onStart: () => void;
  onStartRanked: () => void;
  onStartJieqi: () => void;
  onStartPuzzle: () => void;
  onStartMoreGame: () => void;
  onPuzzlePoint: (point: Position) => void;
  onPuzzleReset: () => void;
  onPuzzleHint: () => void;
  onPuzzleComments: () => void;
  onGobangPoint: (x: number, y: number) => void;
  onGobangReset: () => void;
  onUnavailable: (message: string, kind?: ToastKind) => void;
  onReturnHome: () => void;
}) {
  if (bottomTab !== 'play') {
    return <TabShell tab={bottomTab} />;
  }

  if (activeMode === 'puzzle') return <PuzzleLobbyScreen onOpenPuzzle={onStartPuzzle} onUnavailable={onUnavailable} />;

  if (activeMode === 'jieqi') return <JieqiLobbyScreen onOpenEvaluation={onStartJieqi} onUnavailable={onUnavailable} />;
  if (activeMode === 'more') return <MoreGamesLobbyScreen onOpenGame={onStartMoreGame} onUnavailable={onUnavailable} />;
  if (activeMode === 'ranked') return <RankedScreen onStart={onStartRanked} onBack={onReturnHome} onHelp={() => onUnavailable('排位赛规则帮助后续开放', 'info')} />;

  return (
    <section className="home-layout">
      <button className="home-hero-banner" onClick={() => onUnavailable('活动入口后续开放', 'info')}>
        <span className="hero-copy">
          <small>玩恭喜发财 · 爆活费</small>
          <strong>新版本福利倒计时</strong>
          <em>前往参与</em>
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
          <div>
            <h2>棋力认证第4届</h2>
            <p>参与拿实体证书!</p>
          </div>
          <button className="pill-action" onClick={onStart}>
            立即参与
          </button>
        </article>

        <article className="home-card friend-card">
          <span className="avatar-placeholder" aria-hidden="true" />
          <div>
            <h2>暂无好友</h2>
            <p>看看附近棋友</p>
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
          <div>
            <h2>残局挑战</h2>
            <p>北京市北京市仅11839人能破</p>
            <strong>【残局挑战】490期,5月25日</strong>
            <small>1分钟内 · 已阅999 · 评论326</small>
          </div>
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

function PuzzleLobbyScreen({
  onOpenPuzzle,
  onUnavailable,
}: {
  onOpenPuzzle: () => void;
  onUnavailable: (message: string, kind?: ToastKind) => void;
}) {
  return (
    <section className="puzzle-lobby" aria-label="残局挑战入口">
      <div className="puzzle-resources" aria-label="残局资源">
        <span>
          <Gem size={17} />
          2500
        </span>
        <span>
          <Zap size={17} />
          9
        </span>
        <span>
          <Lightbulb size={17} />
          4
        </span>
      </div>

      <div className="puzzle-panel">
        <button className="daily-puzzle-card" onClick={onOpenPuzzle}>
          <span className="daily-board" aria-hidden="true">
            <ChessBoard pieces={puzzlePieces} compact />
          </span>
          <span className="daily-copy">
            <strong>每日残局</strong>
            <small>2026年05月27日</small>
            <span>累计<b>50417人</b>挑战,<b>87%</b>过关</span>
            <span>北京市北京市仅<b>6679人</b>能破</span>
          </span>
        </button>

        <div className="puzzle-entry-list">
          {puzzleLobbyEntries.map((entry, index) => {
            const Icon = entry.icon;
            const standalone = index === 0 || index === 1 || index === 4;
            return (
              <Fragment key={entry.id}>
                {standalone && index > 0 && <div className="puzzle-entry-gap" />}
                <button
                  className="puzzle-entry"
                  onClick={() => {
                    if (entry.id === 'pass') {
                      onOpenPuzzle();
                      return;
                    }
                    onUnavailable(`${entry.title}后续开放`, 'info');
                  }}
                >
                  <span className="puzzle-entry-icon" aria-hidden="true">
                    <Icon size={26} />
                  </span>
                  <span className="puzzle-entry-copy">
                    <strong>{entry.title}</strong>
                    <small>{entry.detail ?? entry.count}</small>
                  </span>
                  <span className="puzzle-entry-meta">{entry.bonus ?? ''}</span>
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

function PuzzleScreen({
  pieces,
  selectedPiece,
  legalMoves,
  status,
  moves,
  seconds,
  hintVisible,
  onSelectPoint,
  onReset,
  onHint,
  onComments,
}: {
  pieces: Piece[];
  selectedPiece: string | null;
  legalMoves: Position[];
  status: PuzzleState;
  moves: number;
  seconds: number;
  hintVisible: boolean;
  onSelectPoint: (point: Position) => void;
  onReset: () => void;
  onHint: () => void;
  onComments: () => void;
}) {
  const statusText = status === 'solved' ? '挑战成功' : status === 'failed' ? '这步不是最佳解' : '红先一手取胜';
  const marks = hintVisible ? [...legalMoves, puzzleHintTarget] : legalMoves;
  return (
    <section className="mode-shell">
      <div className="section-title">
        <p className="eyebrow">每日残局</p>
        <h2>车临中路</h2>
      </div>
      <div className="feature-grid">
        <ModeCard title="评分" value={status === 'solved' ? '三星' : '待完成'} />
        <ModeCard title="步数" value={`${moves}步`} />
        <ModeCard title="计时" value={formatClock(seconds)} />
        <ModeCard title="状态" value={statusText} />
      </div>
      <div className="mode-play-grid">
        <ChessBoard pieces={pieces} selectedPiece={selectedPiece ?? undefined} marks={marks} onSelectPoint={onSelectPoint} compact />
        <div className="feed-list">
          <InfoRow title="闯关" detail="入门残局 · 第1关" />
          <InfoRow title="挑战" detail="点击红车，看绿色落点" />
          <InfoRow title="推荐" detail={hintVisible ? '红车进一将军' : '提示可查看推荐落点'} />
          <button className="full-width" onClick={onHint}>
            <Medal size={18} />
            提示
          </button>
          <button className="full-width" onClick={onComments}>
            <MessageCircle size={18} />
            评论
          </button>
          <button className="primary-action full-width" onClick={onReset}>
            <RotateCcw size={18} />
            重来
          </button>
        </div>
      </div>
    </section>
  );
}

function PuzzleCommentDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="confirm-card puzzle-comment-card">
        <button className="round-button" aria-label="关闭评论" onClick={onClose}>
          <X size={18} />
        </button>
        <p className="eyebrow">棋谱评论</p>
        <h2>车临中路</h2>
        <div className="intro-rules">
          <InfoRow title="参与人数" detail="2.4万" />
          <InfoRow title="过关率" detail="36%" />
          <InfoRow title="热评" detail="弃子引将，车进中路" />
        </div>
        <div className="chat-input-row">
          <input maxLength={45} placeholder="写下你的拆解" />
          <button className="primary-action" onClick={onClose}>发送</button>
        </div>
      </div>
    </div>
  );
}

function createInitialJieqiPieces(): JieqiPiece[] {
  return startingPieces.map((piece) => {
    const revealed = piece.kind === 'king';
    return {
      ...piece,
      hidden: !revealed,
      revealed,
    };
  });
}

function moveJieqiPiece(pieces: JieqiPiece[], pieceId: string, to: Position): JieqiPiece[] {
  return pieces
    .filter((piece) => piece.id === pieceId || !samePoint(piece, to))
    .map((piece) => (piece.id === pieceId ? { ...piece, ...to, hidden: false, revealed: true } : piece));
}

function JieqiScreen() {
  const [pieces, setPieces] = useState<JieqiPiece[]>(() => createInitialJieqiPieces());
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [status, setStatus] = useState('红方先行，暗子移动后揭示');
  const [moveCount, setMoveCount] = useState(0);
  const displayPieces = pieces.map((piece) => ({
    ...piece,
    label: piece.hidden && !piece.revealed ? '暗' : piece.label,
  }));

  function selectJieqiPoint(point: Position) {
    if (/胜|结束/.test(status)) return;
    const selected = selectedPiece ? pieces.find((piece) => piece.id === selectedPiece) : undefined;
    const pointPiece = pieces.find((piece) => samePoint(piece, point));
    if (selected && hasPoint(legalMoves, point)) {
      const captured = pieces.find((piece) => samePoint(piece, point));
      const afterPlayer = moveJieqiPiece(pieces, selected.id, point);
      setSelectedPiece(null);
      setLegalMoves([]);
      setMoveCount((count) => count + 1);
      if (captured?.kind === 'king') {
        setPieces(afterPlayer);
        setStatus('揭棋评测 · 我方胜');
        return;
      }
      const aiMove = chooseAiMove(afterPlayer, moveCount + 1);
      if (!aiMove) {
        setPieces(afterPlayer);
        setStatus('揭棋评测 · 我方胜');
        return;
      }
      const aiTarget = getPieceAt(afterPlayer, aiMove.to);
      const afterAi = moveJieqiPiece(afterPlayer, aiMove.pieceId, aiMove.to);
      setPieces(afterAi);
      setMoveCount((count) => count + 1);
      setStatus(aiTarget?.kind === 'king' ? '揭棋评测 · 对方胜' : 'AI 已应手，红方继续');
      return;
    }
    if (pointPiece?.side === 'red') {
      setSelectedPiece(pointPiece.id);
      setLegalMoves(getLegalMoves(pieces, pointPiece));
      setStatus(pointPiece.hidden ? '暗子按真实身份生成落点' : `${pointPiece.label}可走`);
      return;
    }
    setSelectedPiece(null);
    setLegalMoves([]);
  }

  function resetJieqi() {
    setPieces(createInitialJieqiPieces());
    setSelectedPiece(null);
    setLegalMoves([]);
    setStatus('红方先行，暗子移动后揭示');
    setMoveCount(0);
  }

  return (
    <section className="mode-shell">
      <div className="section-title">
        <p className="eyebrow">揭棋</p>
        <h2>暗子移动后揭示真实身份</h2>
      </div>
      <div className="feature-grid">
        <ModeCard title="棋力评测" value="本地可玩" />
        <ModeCard title="走子" value={`${moveCount}手`} />
        <ModeCard title="状态" value={status} />
      </div>
      <div className="mode-play-grid">
        <ChessBoard pieces={displayPieces} selectedPiece={selectedPiece ?? undefined} marks={legalMoves} onSelectPoint={selectJieqiPoint} compact />
        <div className="feed-list">
          <InfoRow title="规则说明" detail="开局显示暗子，首次移动后揭示身份" />
          <InfoRow title="本局模式" detail="揭棋评测 · 本地AI" />
          <InfoRow title="提示" detail="选择红方暗子即可查看真实合法点" />
          <button className="primary-action full-width" onClick={resetJieqi}>
            <RotateCcw size={18} />
            重开揭棋
          </button>
        </div>
      </div>
    </section>
  );
}

function MoreGamesScreen({
  board,
  status,
  onPoint,
  onReset,
}: {
  board: number[][];
  status: string;
  onPoint: (x: number, y: number) => void;
  onReset: () => void;
}) {
  const [flipPieces, setFlipPieces] = useState<FlipPiece[]>(() => createInitialFlipPieces());
  const [rulesOpen, setRulesOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const revealedCount = flipPieces.filter((piece) => !piece.hidden).length;
  const multiplier = revealedCount < 4 ? 'x1' : revealedCount < 8 ? 'x2' : 'x3';

  function revealFlipPiece(id: string) {
    setFlipPieces((current) =>
      current.map((piece) => (piece.id === id ? { ...piece, hidden: false } : piece)),
    );
  }

  function resetFlipPieces() {
    setFlipPieces(createInitialFlipPieces());
  }

  return (
    <section className="mode-shell">
      <div className="section-title">
        <p className="eyebrow">更多玩法</p>
        <h2>翻翻棋与五子棋</h2>
      </div>
      <div className="feature-grid">
        <ModeCard title="翻翻棋" value={`${revealedCount}/16`} />
        <ModeCard title="五子棋" value={status} />
        <ModeCard title="倍率" value={multiplier} />
      </div>
      <div className="mode-play-grid">
        <FlipBoard pieces={flipPieces} onReveal={revealFlipPiece} />
        <div className="flip-side-panel">
          <div className="flip-player-row">
            <PlayerBadge name="我方" rank="资产 2.75万" active />
            <div className="hp-track"><span style={{ width: '78%' }} /></div>
          </div>
          <div className="flip-player-row">
            <PlayerBadge name="对方" rank="资产 1.86万" />
            <div className="hp-track is-rival"><span style={{ width: '64%' }} /></div>
          </div>
          <InfoRow title="当前倍率" detail={multiplier} />
          <InfoRow title="玩法状态" detail="点击暗子翻开预设棋种" />
          <div className="result-actions">
            <button onClick={() => setRulesOpen(true)}>规则</button>
            <button onClick={resetFlipPieces}>重置翻子</button>
            <button onClick={() => setExitOpen(true)}>强退</button>
          </div>
          <div className="gobang-mini">
            <GobangBoard board={board} onPoint={onPoint} />
            <button className="primary-action full-width" onClick={onReset}>
              <RotateCcw size={18} />
              重开五子棋
            </button>
          </div>
        </div>
      </div>
      {rulesOpen && <FlipRulesDialog onClose={() => setRulesOpen(false)} />}
      {exitOpen && <FlipExitDialog onCancel={() => setExitOpen(false)} onConfirm={() => setExitOpen(false)} />}
    </section>
  );
}

function createInitialFlipPieces(): FlipPiece[] {
  const labels = ['帅', '仕', '相', '车', '马', '炮', '兵', '兵', '将', '士', '象', '车', '马', '炮', '卒', '卒'];
  return labels.map((label, index) => ({
    id: `flip-${index}`,
    side: index < 8 ? 'red' : 'black',
    label,
    hidden: true,
  }));
}

function FlipBoard({ pieces, onReveal }: { pieces: FlipPiece[]; onReveal: (id: string) => void }) {
  return (
    <div className="flip-board" aria-label="翻翻棋棋盘">
      {pieces.map((piece) => (
        <button
          className={`flip-piece ${piece.hidden ? 'is-hidden' : piece.side}`}
          key={piece.id}
          onClick={() => onReveal(piece.id)}
        >
          {piece.hidden ? '暗' : piece.label}
        </button>
      ))}
    </div>
  );
}

function MoreGamesLobbyScreen({
  onOpenGame,
  onUnavailable,
}: {
  onOpenGame: () => void;
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
        onClick={onOpenGame}
        onKeyDown={(event) => event.key === 'Enter' && onOpenGame()}
      >
        <div className="more-card-copy">
          <strong>欢乐五子棋</strong>
          <small>1404</small>
        </div>
      </div>

      <div className="more-card-grid">
        <button className="more-card more-card-small flip-poster" style={posterStyle(flipChessPoster)} onClick={onOpenGame}>
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
      <div className="confirm-card">
        <p className="eyebrow">翻翻棋规则</p>
        <h2>翻子与倍率</h2>
        <span>本地版先提供翻开、倍率、血量展示；完整吃子胜负后续接入。</span>
        <button className="primary-action full-width" onClick={onClose}>知道了</button>
      </div>
    </div>
  );
}

function FlipExitDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="confirm-card">
        <p className="eyebrow">强退确认</p>
        <h2>退出翻翻棋？</h2>
        <span>本地版只关闭确认框，不进行真实结算。</span>
        <div className="result-actions">
          <button onClick={onCancel}>继续</button>
          <button className="primary-action" onClick={onConfirm}>
            <RotateCcw size={18} />
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

function RankedScreen({ onStart, onBack, onHelp }: { onStart: () => void; onBack: () => void; onHelp: () => void }) {
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

      <button className="ranked-start-button" onClick={onStart}>
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

function LobbyScreen({
  onStart,
  onUnavailable,
}: {
  onStart: (mode: MatchMode) => void;
  onUnavailable: (message: string, kind?: ToastKind) => void;
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
              onClick={() => {
                if (entry.mode) {
                  onStart(entry.mode);
                  return;
                }
                onUnavailable(entry.toast ?? '入口后续开放', 'info');
              }}
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
              onClick={() => onUnavailable(`${entry.title}后续开放`, 'info')}
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
          return (
            <button key={item.label} onClick={() => onUnavailable(`${item.label}后续开放`, 'info')}>
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

function JieqiLobbyScreen({
  onOpenEvaluation,
  onUnavailable,
}: {
  onOpenEvaluation: () => void;
  onUnavailable: (message: string, kind?: ToastKind) => void;
}) {
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
              onClick={() => {
                if (entry.id === 'rating') {
                  onOpenEvaluation();
                  return;
                }
                onUnavailable(`${entry.title}后续开放`, 'info');
              }}
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
                onClick={() => onUnavailable(`${entry.title}后续开放`, 'info')}
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
        {xiangqiDockItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={() => onUnavailable(`${item.label}后续开放`, 'info')}>
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
  menuOpen,
  drawOffersLeft,
  undoLeft,
  onSelectPoint,
  onResign,
  onRequestExit,
  onOpenChat,
  onOpenSettings,
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
  menuOpen: boolean;
  drawOffersLeft: number;
  undoLeft: number;
  onSelectPoint: (point: Position) => void;
  onResign: () => void;
  onRequestExit: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
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
  const stepLimit = stepSecondsForMove(game.moveHistory.length);

  return (
    <section className="game-layout">
      <div className="player-column">
        <PlayerBadge name={opponent.name} rank={opponent.rank} active={game.turn === 'black'} />
        <TimerBox total={formatClock(game.blackTotal)} step={formatClock(game.turn === 'black' ? game.stepLeft : stepLimit)} />
      </div>
      <div className="board-panel">
        <div className="game-status">
          <strong>{statusText}</strong>
          <span>{isRedInCheck ? '我方被将军' : isBlackInCheck ? '对方被将军' : `第 ${game.moveHistory.length + 1} 手`}</span>
        </div>
        <ChessBoard
          pieces={game.pieces}
          selectedPiece={game.selectedPieceId ?? undefined}
          marks={[...(moveHints ? game.legalMoves : []), ...recentMarks(game.recentMove)]}
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
  onReplay,
  onAgain,
  onSwitchOpponent,
  onShare,
}: {
  result: GameResult | null;
  opponent: { name: string; rank: string };
  matchMode: MatchMode;
  sessionLabel: string;
  onReplay: () => void;
  onAgain: () => void;
  onSwitchOpponent: () => void;
  onShare: () => void;
}) {
  const winnerName = result?.winner === 'red' ? '我方' : opponent.name;
  const reason = result ? resultReason(result.reason, result.winner) : '我方认输';
  const points = result?.winner === 'red' ? '+10' : '-10';
  const lastMove = result ? result.moves[result.moves.length - 1] ?? null : null;
  const modeLabel = sessionLabel || (matchModes.find((mode) => mode.id === matchMode)?.label ?? '棋力评测');
  const moveCount = result?.moves.length ?? 0;
  const rounds = Math.ceil(moveCount / 2);
  const canReplay = moveCount > 0;
  const scoreProgress = result?.winner === 'red' ? 58 : 42;
  const currentScore = result?.winner === 'red' ? '42/100' : '30/100';
  const resultDate = formatResultDate(result?.endedAt);

  return (
    <section className="result-layout">
      <div className="result-hero">
        <div className="result-player-card">
          <PlayerBadge name="我方" rank="业余1级" active={result?.winner === 'red'} />
          <span>本局积分 1280</span>
        </div>
        <div className="result-title-block">
          <p className="eyebrow">{modeLabel} · 对局结束</p>
          <h2>{winnerName}胜</h2>
          <span>{reason}</span>
        </div>
        <div className="result-player-card">
          <PlayerBadge name={opponent.name} rank={opponent.rank} active={result?.winner === 'black'} />
          <span>本局积分 1268</span>
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
          <div className="rank-progress-panel">
            <div>
              <strong>业余1级</strong>
              <span>段位进度 {currentScore}</span>
            </div>
            <strong className={points.startsWith('+') ? 'is-positive' : 'is-negative'}>{points}</strong>
            <div className="progress-track">
              <span style={{ width: `${scoreProgress}%` }} />
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

function ReplayScreen({
  result,
  opponent,
  replayStep,
  playing,
  onStep,
  onTogglePlay,
  onBack,
  onToast,
}: {
  result: GameResult | null;
  opponent: { name: string; rank: string };
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
          <h2>本地复盘棋谱</h2>
        </div>
        <div className="replay-meta-grid">
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

function MatchingOverlay({ mode, label, onCancel }: { mode: MatchMode; label: string; onCancel: () => void }) {
  const modeInfo = getMatchMode(mode);
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
        <h2>{label}</h2>
        <span>{modeInfo.detail} · {modeInfo.timeLabel}</span>
        <div className="match-progress">
          <i />
        </div>
      </div>
    </div>
  );
}

function GameIntroDialog({ matchMode, sessionLabel, onStart }: { matchMode: MatchMode; sessionLabel: string; onStart: () => void }) {
  const modeInfo = getMatchMode(matchMode);
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="confirm-card game-intro-card">
        <p className="eyebrow">本场说明</p>
        <h2>{sessionLabel}</h2>
        <div className="intro-rules">
          <InfoRow title="局时" detail={modeInfo.timeLabel} />
          <InfoRow title="步时" detail={modeInfo.stepLabel} />
          <InfoRow title="入场" detail={modeInfo.cost} />
          <InfoRow title="结算" detail={modeInfo.reward} />
        </div>
        <button className="primary-action full-width" onClick={onStart}>
          <Play size={18} />
          开始
        </button>
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
    { key: 'moveHints', label: '显示走子提示', detail: '绿色合法落点' },
    { key: 'coordinates', label: '棋盘坐标线', detail: '本地视觉状态' },
    { key: 'captureAnimation', label: '吃子/将军动画', detail: '保留动效开关' },
    { key: 'backgroundMusic', label: '背景音乐', detail: '本地静音状态' },
    { key: 'sound', label: '下棋音效', detail: '落子与吃子提示' },
    { key: 'messages', label: '接受对局消息', detail: '聊天抽屉消息' },
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
  const emojiItems = ['赞', '稳', '妙', '将', '茶', '鼓'];
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
          <div className="chat-log">
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
  recentMove,
  compact = false,
  onSelectPoint,
}: {
  pieces: Piece[];
  selectedPiece?: string;
  marks?: Position[];
  recentMove?: Move | null;
  compact?: boolean;
  onSelectPoint?: (point: Position) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      drawBoard(ctx, rect.width, rect.height);
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  function handleBoardClick(event: MouseEvent<HTMLDivElement>) {
    if (!onSelectPoint) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const playableSize = 100 - BOARD_PADDING_PERCENT * 2;
    const percentX = ((event.clientX - rect.left) / rect.width) * 100;
    const percentY = ((event.clientY - rect.top) / rect.height) * 100;
    const x = Math.round(((percentX - BOARD_PADDING_PERCENT) / playableSize) * (BOARD_WIDTH - 1));
    const y = Math.round(((percentY - BOARD_PADDING_PERCENT) / playableSize) * (BOARD_HEIGHT - 1));
    if (inBounds({ x, y })) onSelectPoint({ x, y });
  }

  return (
    <div className={`chess-board ${compact ? 'is-compact' : ''}`} onClick={handleBoardClick}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="board-river">楚河　　汉界</div>
      {recentMove && (
        <>
          <span className="recent-ring" style={pointStyle(recentMove.from)} />
          <span className="recent-ring is-target" style={pointStyle(recentMove.to)} />
        </>
      )}
      {marks.map((mark) => (
        <span className="move-mark" key={`${mark.x}-${mark.y}`} style={pointStyle(mark)} />
      ))}
      {pieces.map((piece) => (
        <button
          className={`piece ${piece.side} ${piece.id === selectedPiece ? 'is-selected' : ''}`}
          key={piece.id}
          style={pointStyle(piece)}
          onClick={(event) => {
            event.stopPropagation();
            onSelectPoint?.({ x: piece.x, y: piece.y });
          }}
          aria-label={`${piece.side === 'red' ? '红方' : '黑方'}${piece.label}`}
        >
          {piece.label}
        </button>
      ))}
    </div>
  );
}

function drawBoard(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const padding = Math.min(width, height) * 0.07;
  const boardWidth = width - padding * 2;
  const boardHeight = height - padding * 2;
  const cellX = boardWidth / 8;
  const cellY = boardHeight / 9;

  ctx.fillStyle = '#d8a75f';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(91, 48, 19, 0.08)';
  for (let i = 0; i < 18; i += 1) {
    ctx.fillRect((i * width) / 17, 0, 1.5, height);
  }

  ctx.strokeStyle = '#5b3013';
  ctx.lineWidth = 2;
  ctx.strokeRect(padding, padding, boardWidth, boardHeight);
  ctx.lineWidth = 1.2;

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
}

function drawPalace(ctx: CanvasRenderingContext2D, padding: number, cellX: number, cellY: number, topRow: number) {
  ctx.beginPath();
  ctx.moveTo(padding + 3 * cellX, padding + topRow * cellY);
  ctx.lineTo(padding + 5 * cellX, padding + (topRow + 2) * cellY);
  ctx.moveTo(padding + 5 * cellX, padding + topRow * cellY);
  ctx.lineTo(padding + 3 * cellX, padding + (topRow + 2) * cellY);
  ctx.stroke();
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

function GobangBoard({ board, onPoint }: { board: number[][]; onPoint: (x: number, y: number) => void }) {
  return (
    <div className="gobang-board" style={{ '--gobang-size': gobangSize } as CSSProperties}>
      {board.map((row, y) =>
        row.map((cell, x) => (
          <button
            className={`gobang-cell ${cell === 1 ? 'is-black' : cell === 2 ? 'is-white' : ''}`}
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

function pointStyle(point: Position): CSSProperties {
  const playableSize = 100 - BOARD_PADDING_PERCENT * 2;
  return {
    left: `${BOARD_PADDING_PERCENT + (point.x / 8) * playableSize}%`,
    top: `${BOARD_PADDING_PERCENT + (point.y / 9) * playableSize}%`,
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
  if (reason === 'timeout') return `${loser}超时`;
  if (reason === 'captured') return `${loser}主帅被吃`;
  return '我方认输';
}
