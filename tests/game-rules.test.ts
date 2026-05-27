import {
  applyMove,
  buildReplayPieces,
  canUndoRound,
  chooseAiMove,
  createGobangBoard,
  createInitialGame,
  finishGame,
  findPiece,
  getLegalMoves,
  getPieceAt,
  hasGobangWin,
  hasPoint,
  isInCheck,
  movePiece,
  placeStone,
  startingPieces,
  undoLastRound,
} from '../src/game.js';
import type { Piece, Position } from '../src/game.js';

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertPoint(points: Position[], point: Position, label: string) {
  assert(hasPoint(points, point), `${label}: expected ${point.x},${point.y}`);
}

function assertNoPoint(points: Position[], point: Position, label: string) {
  assert(!hasPoint(points, point), `${label}: did not expect ${point.x},${point.y}`);
}

function piece(partial: Partial<Piece> & Pick<Piece, 'id' | 'side' | 'kind' | 'x' | 'y'>): Piece {
  return {
    label: partial.kind === 'king' ? (partial.side === 'red' ? '帥' : '將') : '子',
    ...partial,
  };
}

const tests: TestCase[] = [
  {
    name: '马不能越过被堵住的马腿',
    run: () => {
      const pieces = [
        piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
        piece({ id: 'bk', side: 'black', kind: 'king', x: 5, y: 0 }),
        piece({ id: 'rn', side: 'red', kind: 'horse', x: 4, y: 6 }),
        piece({ id: 'block', side: 'red', kind: 'pawn', x: 4, y: 5 }),
      ];
      const moves = getLegalMoves(pieces, pieces[2]);
      assertNoPoint(moves, { x: 3, y: 4 }, 'blocked left jump');
      assertNoPoint(moves, { x: 5, y: 4 }, 'blocked right jump');
      assertPoint(moves, { x: 2, y: 5 }, 'side jump remains legal');
    },
  },
  {
    name: '炮需要一个炮架才能吃子',
    run: () => {
      const pieces = [
        piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
        piece({ id: 'bk', side: 'black', kind: 'king', x: 5, y: 0 }),
        piece({ id: 'rc', side: 'red', kind: 'cannon', x: 1, y: 7 }),
        piece({ id: 'screen', side: 'black', kind: 'pawn', x: 1, y: 5 }),
        piece({ id: 'target', side: 'black', kind: 'rook', x: 1, y: 2 }),
      ];
      const moves = getLegalMoves(pieces, pieces[2]);
      assertPoint(moves, { x: 1, y: 2 }, 'cannon capture over screen');
      assertNoPoint(moves, { x: 1, y: 5 }, 'cannon cannot capture screen');
    },
  },
  {
    name: '兵过河后可以横走，未过河不能横走',
    run: () => {
      const baseKings = [
        piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
        piece({ id: 'bk', side: 'black', kind: 'king', x: 5, y: 0 }),
      ];
      const beforeRiver = piece({ id: 'rp1', side: 'red', kind: 'pawn', x: 2, y: 6 });
      const afterRiver = piece({ id: 'rp2', side: 'red', kind: 'pawn', x: 2, y: 4 });
      assertNoPoint(getLegalMoves([...baseKings, beforeRiver], beforeRiver), { x: 1, y: 6 }, 'before river sideways');
      assertPoint(getLegalMoves([...baseKings, afterRiver], afterRiver), { x: 1, y: 4 }, 'after river left');
      assertPoint(getLegalMoves([...baseKings, afterRiver], afterRiver), { x: 3, y: 4 }, 'after river right');
    },
  },
  {
    name: '将帅照面会构成将军并阻止让线',
    run: () => {
      const pieces = [
        piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
        piece({ id: 'bk', side: 'black', kind: 'king', x: 4, y: 0 }),
        piece({ id: 'rr', side: 'red', kind: 'rook', x: 4, y: 5 }),
      ];
      assert(!isInCheck(pieces, 'red'), 'screened red king should be safe');
      const moved = movePiece(pieces, 'rr', { x: 3, y: 5 });
      assert(isInCheck(moved, 'red'), 'moving the screen exposes flying general');
      assertNoPoint(getLegalMoves(pieces, pieces[2]), { x: 3, y: 5 }, 'legal move filter protects own king');
    },
  },
  {
    name: '吃掉将帅会结束对局并保留结算棋谱',
    run: () => {
      const game = {
        ...createInitialGame(),
        pieces: [
          piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
          piece({ id: 'bk', side: 'black', kind: 'king', x: 4, y: 0 }),
          piece({ id: 'rr', side: 'red', kind: 'rook', x: 4, y: 1 }),
        ],
      };
      const ended = applyMove(game, 'rr', { x: 4, y: 0 });
      assert(ended.phase === 'ended', 'game should end');
      assert(ended.result?.winner === 'red', 'red should win');
      assert(ended.result?.moves.length === 1, 'result should keep final move');
    },
  },
  {
    name: '复盘可以按步恢复棋盘状态',
    run: () => {
      let game = createInitialGame();
      game = applyMove(game, 'rn1', { x: 2, y: 7 });
      game = applyMove(game, 'bn1', { x: 2, y: 2 });
      const stepOne = buildReplayPieces(game.moveHistory, 1);
      const stepTwo = buildReplayPieces(game.moveHistory, 2);
      assert(getPieceAt(stepOne, { x: 2, y: 7 })?.id === 'rn1', 'red horse should be on first replay target');
      assert(findPiece(stepOne, 'bn1')?.x === 1, 'black horse should not move before step two');
      assert(getPieceAt(stepTwo, { x: 2, y: 2 })?.id === 'bn1', 'black horse should move at step two');
    },
  },
  {
    name: '自定义局时会写入双方计时并用于结算用时',
    run: () => {
      const game = createInitialGame(10 * 60);
      assert(game.redTotal === 600, 'red total should use custom time');
      assert(game.blackTotal === 600, 'black total should use custom time');
      assert(game.initialTotalSeconds === 600, 'initial total should be stored');

      const ended = finishGame({ ...game, redTotal: 590 }, 'black', 'timeout');
      assert(ended.result?.elapsed === 10, 'elapsed should be based on custom initial time');
    },
  },
  {
    name: '无双方一轮走子时不可悔棋',
    run: () => {
      let game = createInitialGame();
      assert(!canUndoRound(game), 'fresh game should not allow undo');

      game = applyMove(game, 'rn1', { x: 2, y: 7 });
      assert(!canUndoRound(game), 'single move should not allow round undo');
      const unchanged = undoLastRound(game);
      assert(unchanged.moveHistory.length === 1, 'single move should remain');
      assert(findPiece(unchanged.pieces, 'rn1')?.x === 2, 'single move piece should stay moved');
    },
  },
  {
    name: '悔棋会回退最近一轮红黑走法',
    run: () => {
      let game = createInitialGame();
      game = applyMove(game, 'rn1', { x: 2, y: 7 });
      game = applyMove(game, 'bn1', { x: 2, y: 2 });
      assert(canUndoRound(game), 'full round should allow undo');

      const undone = undoLastRound(game);
      assert(undone.moveHistory.length === 0, 'round undo should remove two moves');
      assert(undone.turn === 'red', 'round undo should return to red turn');
      assert(findPiece(undone.pieces, 'rn1')?.x === 1 && findPiece(undone.pieces, 'rn1')?.y === 9, 'red horse should return');
      assert(findPiece(undone.pieces, 'bn1')?.x === 1 && findPiece(undone.pieces, 'bn1')?.y === 0, 'black horse should return');
    },
  },
  {
    name: 'AI 只选择当前局面的合法黑方走法',
    run: () => {
      const move = chooseAiMove(startingPieces, 0);
      assert(move, 'AI should find a move from the initial position');
      const movingPiece = findPiece(startingPieces, move.pieceId);
      assert(movingPiece?.side === 'black', 'AI should move black pieces');
      assertPoint(getLegalMoves(startingPieces, movingPiece), move.to, 'AI move legality');
    },
  },
  {
    name: 'AI 优先选择直接取胜的走法',
    run: () => {
      const pieces = [
        piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
        piece({ id: 'bk', side: 'black', kind: 'king', x: 5, y: 0 }),
        piece({ id: 'br', side: 'black', kind: 'rook', x: 4, y: 1 }),
        piece({ id: 'bp', side: 'black', kind: 'pawn', x: 0, y: 3 }),
      ];
      const move = chooseAiMove(pieces, 0);
      assert(move?.pieceId === 'br', 'AI should use the attacking rook');
      assert(move.to.x === 4 && move.to.y === 9, 'AI should capture the exposed king');
    },
  },
  {
    name: '五子棋识别横竖斜五连',
    run: () => {
      let board = createGobangBoard();
      for (let x = 2; x <= 6; x += 1) board = placeStone(board, x, 4, 1);
      assert(hasGobangWin(board, 1), 'horizontal five should win');

      board = createGobangBoard();
      for (let index = 0; index < 5; index += 1) board = placeStone(board, index + 1, index + 1, 2);
      assert(hasGobangWin(board, 2), 'diagonal five should win');
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
