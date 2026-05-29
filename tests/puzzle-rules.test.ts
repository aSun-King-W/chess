import {
  applyPuzzleFreeMove,
  applyPuzzleMove,
  campaignPuzzles,
  createPuzzleSession,
  dailyPuzzle,
  getCampaignPuzzle,
  getNextPuzzleHint,
  getPuzzleLegalMoves,
  resetPuzzleSession,
  revealPuzzleHint,
  tickPuzzleSession,
} from '../src/puzzle.js';
import type { Puzzle } from '../src/puzzle.js';
import type { Piece, Position } from '../src/game.js';
import { findPiece, hasPoint } from '../src/game.js';

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function piece(partial: Partial<Piece> & Pick<Piece, 'id' | 'side' | 'kind' | 'x' | 'y'>): Piece {
  return {
    label: partial.kind === 'king' ? (partial.side === 'red' ? '帥' : '將') : '子',
    ...partial,
  };
}

function pointLabel(point: Position) {
  return `${point.x},${point.y}`;
}

const tests: TestCase[] = [
  {
    name: '每日残局包含可迁移的题目数据和初始 session',
    run: () => {
      assert(dailyPuzzle.id === 'daily-20260529-user-endgame', 'daily puzzle should expose a stable id');
      assert(dailyPuzzle.title === '车炮混战', 'daily puzzle title should be migrated');
      assert(dailyPuzzle.pieces.length > 0, 'daily puzzle should carry initial pieces');
      assert(dailyPuzzle.sideToMove === 'red', 'daily puzzle should keep red first');
      assert(dailyPuzzle.goal.type === 'capture-king', 'daily puzzle should expose its goal');
      assert(dailyPuzzle.mode === 'free-mate', 'daily puzzle should use free mate rules');
      assert(dailyPuzzle.hints.length === 1, 'daily puzzle should expose hint data');
      assert(dailyPuzzle.solutionLine.length === 1, 'daily puzzle should expose solution line');
      assert(dailyPuzzle.stats.challengeCount > 0, 'daily puzzle should expose stats');

      const session = createPuzzleSession(dailyPuzzle);
      assert(session.puzzleId === dailyPuzzle.id, 'session should point at puzzle id');
      assert(session.turn === 'red', 'session should start from puzzle side to move');
      assert(session.status === 'ready', 'session should start ready');
      assert(session.steps === 0 && session.elapsedSeconds === 0, 'session should reset steps and timer');
      assert(session.hintsRemaining === dailyPuzzle.hints.length, 'session should start with available hints');
      assert(session.pieces !== dailyPuzzle.pieces, 'session should clone puzzle pieces');
    },
  },
  {
    name: '残局闯关题库按关卡递增并且每题正解都可合法走完',
    run: () => {
      assert(campaignPuzzles.length >= 16, 'campaign should expose the first map page as distinct puzzles');
      assert(getCampaignPuzzle(1).id !== dailyPuzzle.id, 'level 1 should use a dedicated campaign puzzle');
      assert(getCampaignPuzzle(2).id !== getCampaignPuzzle(1).id, 'level 2 should not reuse level 1 board');
      assert(getCampaignPuzzle(17).id === getCampaignPuzzle(1).id, 'levels after local set should cycle deterministically');

      const ids = new Set(campaignPuzzles.map((puzzle) => puzzle.id));
      assert(ids.size === campaignPuzzles.length, 'campaign puzzle ids should be unique');

      campaignPuzzles.forEach((puzzle, index) => {
        assert(puzzle.source && puzzle.motif && puzzle.difficulty, `${puzzle.id} should carry source, motif and difficulty`);
        let session = createPuzzleSession(puzzle);
        puzzle.solutionLine.forEach((solutionMove, moveIndex) => {
          const movingPiece = session.pieces.find((piece) => piece.id === solutionMove.pieceId);
          if (movingPiece?.side === puzzle.sideToMove) {
            const hint = puzzle.hints.find((item) => item.moveIndex === moveIndex);
            assert(hint?.detail && hint.detail.length >= 8, `${puzzle.id} red move ${moveIndex + 1} should explain the idea`);
          }
          const legalMoves = getPuzzleLegalMoves(session, solutionMove.pieceId);
          assert(
            hasPoint(legalMoves, solutionMove.to),
            `${puzzle.id} move ${moveIndex + 1} should be legal at level ${index + 1}`,
          );

          const result = applyPuzzleMove(puzzle, session, { pieceId: solutionMove.pieceId, to: solutionMove.to });
          assert(
            moveIndex === puzzle.solutionLine.length - 1 ? result.verdict === 'success' : result.verdict === 'correct',
            `${puzzle.id} move ${moveIndex + 1} should follow the solution line`,
          );
          session = result.session;
        });

        assert(session.status === 'solved', `${puzzle.id} should finish solved`);
      });
    },
  },
  {
    name: '提示返回目标点和箭头，并只消耗一次',
    run: () => {
      const session = createPuzzleSession(dailyPuzzle);
      const hint = getNextPuzzleHint(dailyPuzzle, session);
      assert(hint?.target.x === 4 && hint.target.y === 1, 'hint should target the middle black advisor');
      assert(hint.arrow?.from.x === 4 && hint.arrow.from.y === 4, 'hint arrow should start from red rook');
      assert(hint.arrow?.to.x === 4 && hint.arrow.to.y === 1, 'hint arrow should end on target');

      const firstReveal = revealPuzzleHint(dailyPuzzle, session);
      assert(firstReveal.consumed, 'first reveal should consume one hint');
      assert(firstReveal.session.hintsRemaining === 0, 'hint count should decrease');
      assert(firstReveal.session.hintsUsed === 1, 'hint usage should increment');

      const secondReveal = revealPuzzleHint(dailyPuzzle, firstReveal.session);
      assert(!secondReveal.consumed, 'same hint should not be consumed twice');
      assert(secondReveal.session.hintsRemaining === 0, 'remaining hints should stay stable');
      assert(secondReveal.session.hintsUsed === 1, 'used hints should stay stable');
    },
  },
  {
    name: '自由残局只有将死才会结算胜负',
    run: () => {
      const session = createPuzzleSession(dailyPuzzle);
      const legalMoves = getPuzzleLegalMoves(session, 'daily-rr-center');
      assert(hasPoint(legalMoves, { x: 4, y: 1 }), 'hint move should be legal');

      const setup = applyPuzzleFreeMove(dailyPuzzle, session, { pieceId: 'daily-rr-center', to: { x: 4, y: 1 } });
      assert(setup.verdict === 'correct', 'non-mate capture should keep the puzzle playing');
      assert(setup.session.status === 'playing', 'session should remain playable');
      assert(setup.session.turn === 'black', 'turn should pass to black after a non-winning move');
      assert(setup.move?.captured?.id === 'daily-ba-mid', 'rook should capture the middle black advisor');

      const matePuzzle: Puzzle = {
        id: 'free-mate-checkmate-training',
        title: '自由将死训练',
        pieces: [
          piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
          piece({ id: 'bk', side: 'black', kind: 'king', x: 4, y: 0 }),
          piece({ id: 'rr-check', side: 'red', kind: 'rook', x: 4, y: 8 }),
          piece({ id: 'rr-left', side: 'red', kind: 'rook', x: 3, y: 0 }),
          piece({ id: 'rr-right', side: 'red', kind: 'rook', x: 5, y: 0 }),
        ],
        sideToMove: 'red',
        goal: { type: 'capture-king', description: '自由将死' },
        hints: [],
        solutionLine: [],
        stats: { challengeCount: 1, passRate: 1, fastestSeconds: 1, commentCount: 0 },
      };
      const win = applyPuzzleFreeMove(matePuzzle, createPuzzleSession(matePuzzle), { pieceId: 'rr-check', to: { x: 4, y: 1 } });
      assert(win.verdict === 'success', 'checkmating the black king should solve the puzzle');
      assert(win.session.status === 'solved', 'session should be solved');

      const blackMateSession = {
        ...createPuzzleSession(matePuzzle),
        turn: 'black' as const,
        pieces: [
          piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
          piece({ id: 'bk', side: 'black', kind: 'king', x: 4, y: 0 }),
          piece({ id: 'br-check', side: 'black', kind: 'rook', x: 4, y: 1 }),
          piece({ id: 'br-left', side: 'black', kind: 'rook', x: 3, y: 9 }),
          piece({ id: 'br-right', side: 'black', kind: 'rook', x: 5, y: 9 }),
        ],
      };
      const loss = applyPuzzleFreeMove(matePuzzle, blackMateSession, { pieceId: 'br-check', to: { x: 4, y: 8 } });
      assert(loss.verdict === 'failure', 'black checkmate should fail the puzzle');
      assert(loss.session.status === 'failed', 'session should be failed only after black checkmates');

      const stalematePuzzle: Puzzle = {
        id: 'free-mate-stalemate-training',
        title: '自由困毙训练',
        pieces: [
          piece({ id: 'rk', side: 'red', kind: 'king', x: 8, y: 9 }),
          piece({ id: 'bk', side: 'black', kind: 'king', x: 4, y: 0 }),
          piece({ id: 'rr-left', side: 'red', kind: 'rook', x: 3, y: 9 }),
          piece({ id: 'rr-right', side: 'red', kind: 'rook', x: 5, y: 9 }),
          piece({ id: 'rr-rank', side: 'red', kind: 'rook', x: 0, y: 2 }),
        ],
        sideToMove: 'red',
        goal: { type: 'capture-king', description: '自由困毙' },
        hints: [],
        solutionLine: [],
        stats: { challengeCount: 1, passRate: 1, fastestSeconds: 1, commentCount: 0 },
      };
      const stalemateWin = applyPuzzleFreeMove(stalematePuzzle, createPuzzleSession(stalematePuzzle), { pieceId: 'rr-rank', to: { x: 0, y: 1 } });
      assert(stalemateWin.verdict === 'success', 'stalemating black should solve the puzzle');
      assert(stalemateWin.session.status === 'solved', 'stalemate should mark the session solved');
      assert(stalemateWin.message.includes('无合法应手'), 'stalemate success should explain no legal reply');
    },
  },
  {
    name: '每日自由残局合法非杀手会继续进入黑方回合',
    run: () => {
      const session = createPuzzleSession(dailyPuzzle);
      const quietTarget = { x: 4, y: 3 };
      assert(hasPoint(getPuzzleLegalMoves(session, 'daily-rr-center'), quietTarget), `quiet target ${pointLabel(quietTarget)} should still be legal`);

      const result = applyPuzzleFreeMove(dailyPuzzle, session, { pieceId: 'daily-rr-center', to: quietTarget });
      assert(result.verdict === 'correct', 'legal non-winning move should be accepted');
      assert(result.session.status === 'playing', 'non-winning move should not fail this puzzle');
      assert(result.session.turn === 'black', 'black should reply after red does not win');
      assert(result.session.steps === 1, 'legal move should still count as a step');
    },
  },
  {
    name: '非法走子返回 failure 且不改变 session',
    run: () => {
      const session = createPuzzleSession(dailyPuzzle);
      const result = applyPuzzleFreeMove(dailyPuzzle, session, { pieceId: 'daily-rr-center', to: { x: 5, y: 5 } });
      assert(result.verdict === 'failure', 'illegal move should be a failure verdict');
      assert(result.session === session, 'illegal move should keep session reference unchanged');
      assert(result.session.steps === 0, 'illegal move should not count a step');
      assert(findPiece(result.session.pieces, 'daily-rr-center')?.x === 4, 'rook x should remain');
      assert(findPiece(result.session.pieces, 'daily-rr-center')?.y === 4, 'rook y should remain');
    },
  },
  {
    name: '计时推进和重来会恢复棋盘步数计时状态',
    run: () => {
      let session = createPuzzleSession(dailyPuzzle);
      session = tickPuzzleSession(session, 12);
      session = applyPuzzleFreeMove(dailyPuzzle, session, { pieceId: 'daily-rr-center', to: { x: 4, y: 3 } }).session;
      assert(session.elapsedSeconds === 12, 'timer should advance before reset');
      assert(session.steps === 1, 'step should be recorded before reset');

      const reset = resetPuzzleSession(dailyPuzzle, session);
      assert(reset.steps === 0, 'reset should clear steps');
      assert(reset.elapsedSeconds === 0, 'reset should clear timer');
      assert(reset.status === 'ready', 'reset should return to ready');
      assert(findPiece(reset.pieces, 'daily-rr-center')?.x === 4 && findPiece(reset.pieces, 'daily-rr-center')?.y === 4, 'reset should restore rook');
    },
  },
  {
    name: '多步解法可以返回 correct 并推进到下一手',
    run: () => {
      const multiMovePuzzle: Puzzle = {
        id: 'two-ply-training',
        title: '两步训练',
        pieces: [
          piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
          piece({ id: 'bk', side: 'black', kind: 'king', x: 5, y: 0 }),
          piece({ id: 'rr', side: 'red', kind: 'rook', x: 0, y: 8 }),
          piece({ id: 'bp', side: 'black', kind: 'pawn', x: 1, y: 3 }),
        ],
        sideToMove: 'red',
        goal: { type: 'solution-line', description: '按指定顺序走两手' },
        hints: [
          {
            moveIndex: 1,
            title: '黑卒进一步',
            target: { x: 1, y: 4 },
            arrow: { from: { x: 1, y: 3 }, to: { x: 1, y: 4 } },
          },
        ],
        solutionLine: [
          { pieceId: 'rr', from: { x: 0, y: 8 }, to: { x: 0, y: 7 } },
          { pieceId: 'bp', from: { x: 1, y: 3 }, to: { x: 1, y: 4 } },
        ],
        stats: { challengeCount: 1, passRate: 1, fastestSeconds: 8, commentCount: 0 },
      };

      let session = createPuzzleSession(multiMovePuzzle);
      const first = applyPuzzleMove(multiMovePuzzle, session, { pieceId: 'rr', to: { x: 0, y: 7 } });
      assert(first.verdict === 'correct', 'first move should be correct but not solved');
      assert(first.session.status === 'playing', 'session should remain playable');
      assert(first.session.turn === 'black', 'turn should advance to black');
      assert(first.hint?.target.x === 1 && first.hint.target.y === 4, 'next hint should follow progress');

      session = first.session;
      const second = applyPuzzleMove(multiMovePuzzle, session, { pieceId: 'bp', to: { x: 1, y: 4 } });
      assert(second.verdict === 'success', 'last solution move should solve');
      assert(second.session.status === 'solved', 'multi move puzzle should be solved');
      assert(second.session.steps === 2, 'both moves should be counted');
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
