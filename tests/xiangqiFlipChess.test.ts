import {
  captureFlipChessPiece,
  canFlipChessPieceCapture,
  chooseFlipChessOpening,
  createFlipChessGame,
  createFlipChessSettlement,
  flipFlipChessPiece,
  getFlipChessArenaConfig,
  getFlipChessArenaRows,
  getFlipChessRecordRows,
  getFlipChessReplayRows,
  getFlipChessSafePlaceholder,
  getFlipChessTrophySidebar,
  moveFlipChessPiece,
} from '../src/xiangqiFlipChess.js';
import type {
  XiangqiFlipChessPiece,
  XiangqiFlipChessPieceKind,
  XiangqiFlipChessSide,
} from '../src/xiangqiFlipChess.js';

const nodeTestSpecifier = 'node:test';
const { test } = await import(nodeTestSpecifier) as { test: (name: string, fn: () => void) => unknown };

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function rowDetail(rows: Array<{ title: string; detail: string }>, title: string): string {
  const row = rows.find((item) => item.title === title);
  assert(row, `${title} row should exist`);
  return row.detail;
}

function piece(
  id: string,
  side: XiangqiFlipChessSide,
  kind: XiangqiFlipChessPieceKind,
  label: string,
  cellId: string,
  overrides: Partial<XiangqiFlipChessPiece> = {},
): XiangqiFlipChessPiece {
  const defaults: Record<XiangqiFlipChessPieceKind, Pick<XiangqiFlipChessPiece, 'rank' | 'damage' | 'flipMultiplier'>> = {
    general: { rank: 7, damage: 14, flipMultiplier: 6 },
    advisor: { rank: 2, damage: 5, flipMultiplier: 2 },
    elephant: { rank: 3, damage: 6, flipMultiplier: 3 },
    horse: { rank: 5, damage: 8, flipMultiplier: 4 },
    rook: { rank: 6, damage: 10, flipMultiplier: 5 },
    cannon: { rank: 4, damage: 8, flipMultiplier: 4 },
    pawn: { rank: 1, damage: 4, flipMultiplier: 2 },
  };

  return {
    id,
    cellId,
    side,
    kind,
    label,
    hidden: false,
    captured: false,
    ...defaults[kind],
    ...overrides,
  };
}

const tests: TestCase[] = [
  {
    name: '翻翻棋场次配置包含新手训练场门票倍率强退提示和安全占位',
    run: () => {
      const training = getFlipChessArenaConfig('training');
      const rows = getFlipChessArenaRows('training');
      const friend = getFlipChessArenaConfig('friend');
      const forceExit = getFlipChessSafePlaceholder('force-exit-timeout');
      const share = getFlipChessSafePlaceholder('share');

      assert(training.title === '新手训练场', 'training title');
      assert(training.ticket === 0, 'training ticket');
      assert(training.initialHp === 60, 'training hp');
      assert(training.maxMultiplier === 1000, 'training max multiplier');
      assert(training.forceExitPenaltyMultiplier === 400, 'training force exit penalty');
      assert(training.description.includes('开局扣除'), 'training description ticket');
      assert(rowDetail(rows, '强退超时') === '至少扣400倍', 'force exit row');
      assert(rowDetail(rows, '上限倍率') === '1000', 'max multiplier row');

      assert(friend.settlementType === '非计分', 'friend settlement type');
      assert(forceExit.message.includes('至少400倍'), 'force exit placeholder');
      assert(share.available === false && share.localOnly === true, 'share local only');
    },
  },
  {
    name: '初始化暗子格盘后先进入抢红争先阶段',
    run: () => {
      const game = createFlipChessGame({ arenaId: 'training', seed: 0 });

      assert(game.moduleName === '翻翻棋', 'module name');
      assert(game.phase === 'red-choice', 'initial phase');
      assert(game.board.rows === 8 && game.board.cols === 4, 'vertical board');
      assert(game.board.cells.length === 32, 'cell count');
      assert(game.pieces.length === 32, 'piece count');
      assert(game.pieces.every((item) => item.hidden), 'all pieces hidden');
      assert(game.redHp === 60 && game.blackHp === 60, 'initial hp');
      assert(game.multiplier === 8, 'base multiplier');
      assert(game.result === 'unfinished', 'initial result');
    },
  },
  {
    name: '抢红会锁定红方先手并把开局倍率从8推到16',
    run: () => {
      const claimed = chooseFlipChessOpening(createFlipChessGame({ arenaId: 'training' }), 'claim-red');
      const passed = chooseFlipChessOpening(createFlipChessGame({ arenaId: 'training' }), 'pass');

      assert(claimed.phase === 'playing', 'claimed phase');
      assert(claimed.playerSide === 'red', 'claimed player side');
      assert(claimed.turnSide === 'red', 'claimed turn');
      assert(claimed.multiplier === 16, 'claimed multiplier');
      assert(claimed.records[0].notation.includes('抢红争先'), 'claimed notation');

      assert(passed.playerSide === 'black', 'passed player side');
      assert(passed.turnSide === 'red', 'passed red acts first');
      assert(passed.multiplier === 8, 'passed multiplier');
      assert(passed.records[0].notation.includes('不抢'), 'passed notation');
    },
  },
  {
    name: '翻开暗子后显示阵营归属并推动倍率和回合',
    run: () => {
      const game = chooseFlipChessOpening(createFlipChessGame({ arenaId: 'training', seed: 0 }), 'claim-red');
      const hiddenPiece = game.pieces.find((item) => item.cellId === 'f0-0');
      assert(hiddenPiece && hiddenPiece.hidden, 'piece starts hidden');

      const flipped = flipFlipChessPiece(game, 'f0-0');
      const revealed = flipped.pieces.find((item) => item.id === hiddenPiece.id);

      assert(revealed && revealed.hidden === false, 'piece revealed');
      assert(flipped.multiplier > game.multiplier, 'multiplier changed');
      assert(flipped.turnSide === 'black', 'turn switches after flip');
      assert(flipped.moveNumber === 1, 'move count');
      assert(flipped.records[flipped.records.length - 1].notation.includes('翻开'), 'flip notation');
    },
  },
  {
    name: '移动和吃子会校验暗子状态阵营回合并把战利品堆到侧栏',
    run: () => {
      const game = chooseFlipChessOpening(createFlipChessGame({
        arenaId: 'training',
        pieces: [
          piece('red-rook', 'red', 'rook', '车', 'f0-0'),
          piece('black-pawn', 'black', 'pawn', '卒', 'f0-2'),
        ],
      }), 'claim-red');
      const moved = moveFlipChessPiece(game, 'red-rook', 'f0-1');
      const ready = { ...moved, turnSide: 'red' as const };

      assert(moved.pieces.find((item) => item.id === 'red-rook')?.cellId === 'f0-1', 'piece moved');
      assert(moved.turnSide === 'black', 'turn switches after move');
      assert(canFlipChessPieceCapture(ready, ready.pieces[0], ready.pieces[1]), 'rook can capture pawn');

      const captured = captureFlipChessPiece(ready, 'red-rook', 'f0-2');
      const trophies = getFlipChessTrophySidebar(captured);

      assert(captured.blackHp === 56, 'capture damage');
      assert(captured.multiplier === 19, 'capture multiplier');
      assert(captured.capturedBy.red.length === 1, 'red trophy count');
      assert(trophies.red[0].label === '卒' && trophies.red[0].count === 1, 'red trophy stack');
      assert(captured.records[captured.records.length - 1].notation.includes('扣4血'), 'damage notation');
    },
  },
  {
    name: '翻翻棋吃子规则包含兵吃将炮隔山和将不能吃兵',
    run: () => {
      const base = chooseFlipChessOpening(createFlipChessGame({
        arenaId: 'training',
        pieces: [
          piece('red-general', 'red', 'general', '帅', 'f0-0'),
          piece('black-pawn', 'black', 'pawn', '卒', 'f0-1'),
          piece('red-pawn', 'red', 'pawn', '兵', 'f1-0'),
          piece('black-general', 'black', 'general', '将', 'f1-1'),
          piece('red-cannon', 'red', 'cannon', '炮', 'f2-0'),
          piece('screen', 'black', 'horse', '马', 'f2-1'),
          piece('black-rook', 'black', 'rook', '车', 'f2-3'),
        ],
      }), 'claim-red');

      assert(!canFlipChessPieceCapture(base, base.pieces[0], base.pieces[1]), 'general cannot capture pawn');
      assert(canFlipChessPieceCapture(base, base.pieces[2], base.pieces[3]), 'pawn can capture general');
      assert(canFlipChessPieceCapture(base, base.pieces[4], base.pieces[6]), 'cannon captures with one screen');
    },
  },
  {
    name: '血量归零后产出胜利银币结算、按钮和复盘记录 rows',
    run: () => {
      const game = chooseFlipChessOpening(createFlipChessGame({
        arenaId: 'training',
        pieces: [
          piece('red-rook', 'red', 'rook', '车', 'f0-0'),
          piece('black-boss', 'black', 'pawn', '卒', 'f0-1', { damage: 60, flipMultiplier: 21 }),
        ],
      }), 'claim-red');
      const finished = captureFlipChessPiece(game, 'red-rook', 'f0-1');
      const settlement = createFlipChessSettlement(finished, 'red', 5830);
      const replayRows = getFlipChessReplayRows(finished);
      const recordRows = getFlipChessRecordRows(finished);

      assert(finished.phase === 'finished', 'finished phase');
      assert(finished.result === 'red-win', 'red wins');
      assert(finished.blackHp === 0, 'black hp zero');
      assert(finished.multiplier === 38, 'observed style multiplier');
      assert(settlement.title === '红方胜利', 'settlement title');
      assert(settlement.summary === '胜利，银币 +53', 'settlement summary');
      assert(settlement.coinDelta === 53, 'coin delta');
      assert(rowDetail(settlement.rows, '抢先加倍').includes('开局倍率翻倍'), 'opening row');
      assert(rowDetail(settlement.rows, '血差') === '红方+60', 'blood diff row');
      assert(settlement.actions.map((item) => item.label).join('/') === '切换对手/再来一局/分享', 'settlement actions');
      assert(settlement.actions[2].safePlaceholder === 'share', 'share placeholder');
      assert(rowDetail(replayRows, '模块') === '翻翻棋', 'replay module');
      assert(rowDetail(replayRows, '倍率') === '38倍，上限1000', 'replay multiplier');
      assert(rowDetail(recordRows, '结果') === '红方胜', 'record result');
      assert(rowDetail(recordRows, '战利品') === '红1 / 黑0', 'record trophies');
    },
  },
  {
    name: '负局按强退超时风险至少扣400倍且好友邀请只给本地占位',
    run: () => {
      const game = chooseFlipChessOpening(createFlipChessGame({
        arenaId: 'training',
        pieces: [
          piece('red-pawn', 'red', 'pawn', '兵', 'f0-0', { damage: 60 }),
          piece('black-rook', 'black', 'rook', '车', 'f0-1', { flipMultiplier: 5 }),
        ],
      }), 'claim-red');
      const blackTurn = { ...game, turnSide: 'black' as const };
      const finished = captureFlipChessPiece(blackTurn, 'black-rook', 'f0-0');
      const settlement = createFlipChessSettlement(finished, 'red', 1000);
      const invite = getFlipChessSafePlaceholder('friend-invite');

      assert(finished.result === 'black-win', 'black wins');
      assert(settlement.coinDelta === -400, 'loss minimum penalty');
      assert(rowDetail(settlement.rows, '银币') === '-400', 'loss coin row');
      assert(invite.message.includes('不拉起外部分享'), 'friend invite placeholder');
    },
  },
];

tests.forEach((testCase) => {
  void test(testCase.name, testCase.run);
});
