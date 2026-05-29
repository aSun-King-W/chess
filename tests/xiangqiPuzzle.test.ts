import {
  addXiangqiPuzzleComment,
  applyXiangqiPuzzleAttemptMove,
  buildXiangqiPuzzleSettlement,
  calculatePuzzleScore,
  createXiangqiPuzzleAttempt,
  createXiangqiPuzzleCommentPanel,
  createXiangqiPuzzleRecord,
  getXiangqiPuzzleEntry,
  getXiangqiPuzzleIntroRows,
  getXiangqiPuzzleMenuActions,
  getXiangqiPuzzleReplayRows,
  restartXiangqiPuzzleAttempt,
  revealXiangqiPuzzleHint,
  startXiangqiPuzzleAttempt,
  tickXiangqiPuzzleAttempt,
  undoXiangqiPuzzleAttemptStep,
  xiangqiPuzzleEntries,
} from '../src/xiangqiPuzzle.js';
import { dailyPuzzle, getPuzzleLegalMoves } from '../src/puzzle.js';
import type { Puzzle } from '../src/puzzle.js';

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

const tests: TestCase[] = [
  {
    name: '残局入口配置覆盖每日闯关评分挑战学习铜钱场',
    run: () => {
      assert(xiangqiPuzzleEntries.length === 6, 'six observed entries should be exposed');
      assert(getXiangqiPuzzleEntry('daily').title === '每日残局', 'daily title');
      assert(getXiangqiPuzzleEntry('campaign').title === '残局-闯关', 'campaign title');
      assert(getXiangqiPuzzleEntry('scored').settlementType === '评分', 'scored settlement');
      assert(getXiangqiPuzzleEntry('challenge').badge === '排行', 'challenge badge');
      assert(getXiangqiPuzzleEntry('study').ticketLabel === '免费学习', 'study ticket');
      assert(getXiangqiPuzzleEntry('coin').ticketLabel.includes('1000'), 'coin ticket');

      const introRows = getXiangqiPuzzleIntroRows('daily');
      assert(rowDetail(introRows, '入口') === '每日残局', 'intro entry row');
      assert(rowDetail(introRows, '挑战人数') === '6万人挑战', 'intro challenge count should resemble observed copy');
      assert(rowDetail(introRows, '过关率') === '94%', 'intro pass rate');
      assert(rowDetail(introRows, '最快记录') === '棋小4秒过关', 'intro fastest row');
    },
  },
  {
    name: '开始和计时会进入局内状态并保留步数计时指标',
    run: () => {
      let attempt = createXiangqiPuzzleAttempt('daily', {
        now: '2026-05-28T10:00:00.000Z',
        resources: { hintCards: 3 },
      });
      assert(attempt.status === 'ready', 'attempt should start ready');
      assert(attempt.session.steps === 0, 'initial steps');
      assert(attempt.resources.hintCards === 3, 'initial hint cards');

      attempt = startXiangqiPuzzleAttempt(attempt, '2026-05-28T10:00:01.000Z');
      attempt = tickXiangqiPuzzleAttempt(attempt, 41);

      assert(attempt.status === 'playing', 'attempt should be playing');
      assert(attempt.session.elapsedSeconds === 41, 'timer should tick');
      assert(attempt.latestMessage.includes('最优路线'), 'start message should mention route');
    },
  },
  {
    name: '正确路线会成功结算并生成成绩复盘记录 rows',
    run: () => {
      let attempt = createXiangqiPuzzleAttempt('daily', { now: '2026-05-28T10:00:00.000Z' });
      attempt = startXiangqiPuzzleAttempt(attempt);
      attempt = tickXiangqiPuzzleAttempt(attempt, 41);
      attempt = {
        ...attempt,
        session: {
          ...attempt.session,
          pieces: attempt.session.pieces
            .filter((piece) => piece.id !== 'daily-br-center')
            .map((piece) => (piece.id === 'daily-rr-center' ? { ...piece, x: 5, y: 4 } : piece)),
        },
      };

      const result = applyXiangqiPuzzleAttemptMove(dailyPuzzle, attempt, { pieceId: 'daily-rr-center', to: { x: 5, y: 1 } }, undefined, {
        autoReply: false,
      });
      assert(result.verdict === 'success', 'solution should succeed');
      assert(result.attempt.status === 'solved', 'attempt should be solved');
      assert(result.attempt.session.steps === 1, 'steps should increment');

      const settlement = buildXiangqiPuzzleSettlement(result.attempt);
      assert(settlement.statusLabel === '挑战成功', 'settlement success label');
      assert(settlement.timeLabel === '41秒过关', 'settlement time copy');
      assert(settlement.regionRankText.includes('北京市北京市超过'), 'settlement region copy');
      assert(settlement.nationalPercentText.includes('超过全国'), 'settlement national copy');
      assert(settlement.rewardText === '过关奖励体力卡+2', 'settlement reward');
      assert(settlement.buttons[0] === '关闭' && settlement.buttons[1] === '炫耀一下', 'settlement buttons');

      assert(rowDetail(settlement.rows, '入口') === '每日残局', 'settlement entry row');
      assert(rowDetail(settlement.rows, '成绩') === '41秒过关', 'settlement result row');
      assert(rowDetail(settlement.rows, '步数') === '1步', 'settlement steps row');
      assert(rowDetail(settlement.rows, '奖励') === '过关奖励体力卡+2', 'settlement reward row');

      const replayRows = getXiangqiPuzzleReplayRows(result.attempt);
      assert(rowDetail(replayRows, '模块') === '残局体系', 'replay module');
      assert(rowDetail(replayRows, '判题') === '已按正解过关', 'replay verdict');
      assert(rowDetail(replayRows, '底部按钮') === '菜单 / 排行 / 分享 / 提示', 'replay actions');

      const record = createXiangqiPuzzleRecord(result.attempt, {}, '2026-05-28T10:01:00.000Z');
      assert(record.status === 'solved', 'record status');
      assert(record.elapsedSeconds === 41, 'record timer');
      assert(rowDetail(record.replayRows, '题目') === dailyPuzzle.title, 'record replay title');
    },
  },
  {
    name: '每日自由残局未杀掉黑将时不会直接判错',
    run: () => {
      const attempt = startXiangqiPuzzleAttempt(createXiangqiPuzzleAttempt('daily'));
      const result = applyXiangqiPuzzleAttemptMove(dailyPuzzle, attempt, { pieceId: 'daily-rr-center', to: { x: 4, y: 3 } }, undefined, {
        autoReply: false,
      });

      assert(result.verdict === 'correct', 'legal non-winning move should continue');
      assert(!result.impossible, 'daily free mate should not become impossible on a non-winning move');
      assert(result.attempt.status === 'playing', 'attempt should keep playing');
      assert(result.attempt.session.turn === 'black', 'black should move after red does not win');
      assert(result.message.includes('黑方应手'), 'message should mention black response');
      assert(getXiangqiPuzzleMenuActions(result.attempt).join('/') === '退出/重来/设置', 'playing menu actions');
    },
  },
  {
    name: '多手闯关会自动走出黑方应手并把提示推进到红方下一手',
    run: () => {
      const puzzle: Puzzle = {
        id: 'auto-reply-training',
        title: '自动应手训练',
        pieces: [
          { id: 'rk', side: 'red', kind: 'king', label: '帥', x: 4, y: 9 },
          { id: 'bk', side: 'black', kind: 'king', label: '將', x: 5, y: 0 },
          { id: 'rr', side: 'red', kind: 'rook', label: '車', x: 0, y: 8 },
          { id: 'bp', side: 'black', kind: 'pawn', label: '卒', x: 1, y: 3 },
        ],
        sideToMove: 'red',
        goal: { type: 'solution-line', description: '红走一步后黑方自动应手' },
        hints: [
          {
            moveIndex: 2,
            title: '红方继续',
            target: { x: 0, y: 6 },
            arrow: { from: { x: 0, y: 7 }, to: { x: 0, y: 6 } },
          },
        ],
        solutionLine: [
          { pieceId: 'rr', from: { x: 0, y: 8 }, to: { x: 0, y: 7 }, note: '车九进一' },
          { pieceId: 'bp', from: { x: 1, y: 3 }, to: { x: 1, y: 4 }, note: '卒二进一' },
          { pieceId: 'rr', from: { x: 0, y: 7 }, to: { x: 0, y: 6 }, note: '车九进一' },
        ],
        stats: { challengeCount: 1, passRate: 1, fastestSeconds: 8, commentCount: 0 },
      };
      const attempt = startXiangqiPuzzleAttempt(createXiangqiPuzzleAttempt('campaign', { puzzle }));
      const first = applyXiangqiPuzzleAttemptMove(puzzle, attempt, { pieceId: 'rr', to: { x: 0, y: 7 } });

      assert(first.verdict === 'correct', 'first red move should remain correct after auto reply');
      assert(first.attempt.session.steps === 2, 'black reply should be auto-applied and counted');
      assert(first.attempt.session.turn === 'red', 'turn should return to red after black reply');
      assert(first.attempt.session.progressIndex === 2, 'progress should skip the known black response');
      assert(first.message.includes('对方已应'), 'message should explain the auto reply');
    },
  },
  {
    name: '提示会消耗提示卡和局内提示次数，重复显示不重复消耗',
    run: () => {
      let attempt = createXiangqiPuzzleAttempt('daily', { resources: { hintCards: 3 } });

      const first = revealXiangqiPuzzleHint(dailyPuzzle, attempt);
      assert(first.consumed, 'first hint should consume');
      assert(first.hint?.title === '车吃中士', 'hint title');
      assert(first.attempt.resources.hintCards === 2, 'resource hint card should decrease');
      assert(first.attempt.session.hintsUsed === 1, 'session hint usage');
      assert(first.message === '提示：车吃中士', 'hint message');

      const second = revealXiangqiPuzzleHint(dailyPuzzle, first.attempt);
      assert(!second.consumed, 'same hint should not consume twice');
      assert(second.attempt.resources.hintCards === 2, 'resource hint cards stable');
      assert(second.attempt.session.hintsUsed === 1, 'session hint usage stable');
    },
  },
  {
    name: '悔棋按当前轮次回退而不是重开整局',
    run: () => {
      let attempt = startXiangqiPuzzleAttempt(createXiangqiPuzzleAttempt('daily'));
      attempt = applyXiangqiPuzzleAttemptMove(dailyPuzzle, attempt, { pieceId: 'daily-rr-center', to: { x: 4, y: 3 } }, undefined, {
        autoReply: false,
      }).attempt;

      const undone = undoXiangqiPuzzleAttemptStep(dailyPuzzle, attempt, '2026-05-28T10:02:00.000Z');
      assert(undone.status === 'playing', 'undo should keep the attempt playable');
      assert(undone.session.steps === 0, 'undo should remove one recorded step');
      assert(undone.session.turn === 'red', 'turn should return to red after undoing red move');
      assert(undone.session.moveHistory.length === 0, 'move history should lose only the latest move');
      assert(undone.undos === 1, 'undo count should increment');
      assert(undone.restarts === 0, 'undo should not count as a restart');

      let roundAttempt = startXiangqiPuzzleAttempt(createXiangqiPuzzleAttempt('daily'));
      roundAttempt = applyXiangqiPuzzleAttemptMove(dailyPuzzle, roundAttempt, { pieceId: 'daily-rr-center', to: { x: 4, y: 3 } }, undefined, {
        autoReply: false,
      }).attempt;
      const blackReply = roundAttempt.session.pieces
        .filter((piece) => piece.side === 'black')
        .flatMap((piece) => getPuzzleLegalMoves(roundAttempt.session, piece.id).map((to) => ({ pieceId: piece.id, to })))[0];
      assert(blackReply, 'black should have a legal reply in this position');
      roundAttempt = applyXiangqiPuzzleAttemptMove(dailyPuzzle, roundAttempt, blackReply, undefined, {
        autoReply: false,
      }).attempt;

      const roundUndone = undoXiangqiPuzzleAttemptStep(dailyPuzzle, roundAttempt, '2026-05-28T10:03:00.000Z');
      assert(roundUndone.session.steps === 0, 'undo should remove the player move and the black reply');
      assert(roundUndone.session.turn === 'red', 'turn should return to red after undoing a full round');
      assert(roundUndone.session.moveHistory.length === 0, 'full-round undo should clear both moves');
    },
  },
  {
    name: '重来恢复棋盘步数计时但保留提示消耗和重来次数',
    run: () => {
      let attempt = startXiangqiPuzzleAttempt(createXiangqiPuzzleAttempt('daily'));
      attempt = tickXiangqiPuzzleAttempt(attempt, 12);
      attempt = revealXiangqiPuzzleHint(dailyPuzzle, attempt).attempt;
      attempt = applyXiangqiPuzzleAttemptMove(dailyPuzzle, attempt, { pieceId: 'daily-rr-center', to: { x: 4, y: 3 } }, undefined, {
        autoReply: false,
      }).attempt;

      const restarted = restartXiangqiPuzzleAttempt(dailyPuzzle, attempt, '2026-05-28T10:02:00.000Z');
      assert(restarted.status === 'playing', 'restart should return to playing');
      assert(restarted.session.steps === 0, 'restart clears steps');
      assert(restarted.session.elapsedSeconds === 0, 'restart clears timer');
      assert(restarted.session.hintsUsed === 1, 'restart keeps used hints');
      assert(restarted.session.hintsRemaining === 0, 'restart keeps consumed hint count');
      assert(restarted.restarts === 1, 'restart count increments');
      assert(restarted.impossiblePrompt === null, 'restart clears prompt');
      assert(calculatePuzzleScore(restarted) === 80, 'score should include hint and restart penalties');
    },
  },
  {
    name: '评论记录面板包含棋谱评论和本地评论写入',
    run: () => {
      let attempt = createXiangqiPuzzleAttempt('daily', { now: '2026-05-28T10:00:00.000Z' });
      let panel = createXiangqiPuzzleCommentPanel(attempt);
      assert(panel.title === '棋谱评论', 'comment panel title');
      assert(panel.topic === '每日一题', 'comment panel topic');
      assert(panel.challengeText === '6万人挑战', 'comment panel challenge count');
      assert(panel.passRateText === '94%过关', 'comment panel pass rate');
      assert(panel.comments.length === 2, 'default comments');
      assert(panel.inputPlaceholder.includes('解法'), 'input placeholder');

      attempt = addXiangqiPuzzleComment(attempt, '  中路车一步到位，走偏就直接重来。 ', {
        author: 'Meteor',
        now: '2026-05-28T10:03:00.000Z',
      });
      panel = createXiangqiPuzzleCommentPanel(attempt);
      assert(panel.comments.length === 3, 'new comment should be prepended');
      assert(panel.comments[0].author === 'Meteor', 'new comment author');
      assert(panel.comments[0].content === '中路车一步到位，走偏就直接重来。', 'new comment content should trim');
      assert(panel.comments[0].localOnly, 'new comment should stay local only');
      assert(attempt.latestMessage === '评论已写入本地棋谱记录。', 'comment message');
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
