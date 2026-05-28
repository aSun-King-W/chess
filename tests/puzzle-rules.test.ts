import {
  applyPuzzleMove,
  createPuzzleSession,
  dailyPuzzle,
  getNextPuzzleHint,
  getPuzzleLegalMoves,
  resetPuzzleSession,
  revealPuzzleHint,
  tickPuzzleSession,
} from '../src/puzzle.js';
import type { Puzzle } from '../src/puzzle.js';
import type { Piece, Position } from '../src/game.js';
import { findPiece, getPieceAt, hasPoint } from '../src/game.js';

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
      assert(dailyPuzzle.id === 'daily-490-che-lin-zhong-lu', 'daily puzzle should expose a stable id');
      assert(dailyPuzzle.title === '车临中路', 'daily puzzle title should be migrated');
      assert(dailyPuzzle.pieces.length > 0, 'daily puzzle should carry initial pieces');
      assert(dailyPuzzle.sideToMove === 'red', 'daily puzzle should keep red first');
      assert(dailyPuzzle.goal.type === 'capture-king', 'daily puzzle should expose its goal');
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
    name: '提示返回目标点和箭头，并只消耗一次',
    run: () => {
      const session = createPuzzleSession(dailyPuzzle);
      const hint = getNextPuzzleHint(dailyPuzzle, session);
      assert(hint?.target.x === 4 && hint.target.y === 0, 'hint should target the black king');
      assert(hint.arrow?.from.x === 4 && hint.arrow.from.y === 8, 'hint arrow should start from red rook');
      assert(hint.arrow?.to.x === 4 && hint.arrow.to.y === 0, 'hint arrow should end on target');

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
    name: '按解法走子会成功并记录步数',
    run: () => {
      const session = createPuzzleSession(dailyPuzzle);
      const legalMoves = getPuzzleLegalMoves(session, 'pr');
      assert(hasPoint(legalMoves, { x: 4, y: 0 }), 'solution move should be legal');

      const result = applyPuzzleMove(dailyPuzzle, session, { pieceId: 'pr', to: { x: 4, y: 0 } });
      assert(result.verdict === 'success', 'solution move should solve the puzzle');
      assert(result.session.status === 'solved', 'session should be solved');
      assert(result.session.steps === 1, 'steps should increment');
      assert(result.move?.captured?.kind === 'king', 'move should capture black king');
      assert(getPieceAt(result.session.pieces, { x: 4, y: 0 })?.id === 'pr', 'rook should land on target');
      assert(!findPiece(result.session.pieces, 'pk'), 'black king should be removed');
    },
  },
  {
    name: '合法但不在解法线上的走子会判错并失败',
    run: () => {
      const session = createPuzzleSession(dailyPuzzle);
      const wrongTarget = { x: 4, y: 7 };
      assert(hasPoint(getPuzzleLegalMoves(session, 'pr'), wrongTarget), `wrong target ${pointLabel(wrongTarget)} should still be legal`);

      const result = applyPuzzleMove(dailyPuzzle, session, { pieceId: 'pr', to: wrongTarget });
      assert(result.verdict === 'incorrect', 'legal non-solution move should be incorrect');
      assert(result.session.status === 'failed', 'wrong move should fail this puzzle');
      assert(result.session.steps === 1, 'wrong legal move should still count as a step');
      assert(result.expected?.to.x === 4 && result.expected.to.y === 0, 'result should expose expected solution');
    },
  },
  {
    name: '非法走子返回 failure 且不改变 session',
    run: () => {
      const session = createPuzzleSession(dailyPuzzle);
      const result = applyPuzzleMove(dailyPuzzle, session, { pieceId: 'pr', to: { x: 5, y: 7 } });
      assert(result.verdict === 'failure', 'illegal move should be a failure verdict');
      assert(result.session === session, 'illegal move should keep session reference unchanged');
      assert(result.session.steps === 0, 'illegal move should not count a step');
      assert(findPiece(result.session.pieces, 'pr')?.x === 4, 'rook x should remain');
      assert(findPiece(result.session.pieces, 'pr')?.y === 8, 'rook y should remain');
    },
  },
  {
    name: '计时推进和重来会恢复棋盘步数计时状态',
    run: () => {
      let session = createPuzzleSession(dailyPuzzle);
      session = tickPuzzleSession(session, 12);
      session = applyPuzzleMove(dailyPuzzle, session, { pieceId: 'pr', to: { x: 4, y: 7 } }).session;
      assert(session.elapsedSeconds === 12, 'timer should advance before reset');
      assert(session.steps === 1, 'step should be recorded before reset');

      const reset = resetPuzzleSession(dailyPuzzle, session);
      assert(reset.steps === 0, 'reset should clear steps');
      assert(reset.elapsedSeconds === 0, 'reset should clear timer');
      assert(reset.status === 'ready', 'reset should return to ready');
      assert(findPiece(reset.pieces, 'pr')?.x === 4 && findPiece(reset.pieces, 'pr')?.y === 8, 'reset should restore rook');
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
