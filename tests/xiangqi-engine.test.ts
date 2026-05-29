import {
  chooseComputerMove,
  evaluateComputerPosition,
  piecesToFen,
  uciBestMoveToMove,
} from '../src/xiangqiEngine.js';
import {
  findPiece,
  getLegalMoves,
  hasPoint,
  startingPieces,
} from '../src/game.js';
import type { Piece, Position } from '../src/game.js';

type TestCase = {
  name: string;
  run: () => void | Promise<void>;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertPoint(points: Position[], point: Position, label: string) {
  assert(hasPoint(points, point), `${label}: expected ${point.x},${point.y}`);
}

function piece(partial: Partial<Piece> & Pick<Piece, 'id' | 'side' | 'kind' | 'x' | 'y'>): Piece {
  return {
    label: partial.kind === 'king' ? (partial.side === 'red' ? '帥' : '將') : '子',
    ...partial,
  };
}

const tests: TestCase[] = [
  {
    name: 'FEN 适配输出标准初始局面',
    run: () => {
      assert(
        piecesToFen(startingPieces, 'red') === 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1',
        'initial FEN should match standard Xiangqi placement',
      );
      assert(piecesToFen(startingPieces, 'black').endsWith(' b - - 0 1'), 'black side-to-move should use b');
    },
  },
  {
    name: 'UCI bestmove 可以映射回本地棋子和坐标',
    run: () => {
      const move = uciBestMoveToMove(startingPieces, 'black', 'bestmove h9g7');
      assert(move?.pieceId === 'bn2', 'h9 should map to the black right horse');
      assert(move.to.x === 6 && move.to.y === 2, 'g7 should map to local coordinate 6,2');
    },
  },
  {
    name: 'UCI 非法返回会被拒绝',
    run: () => {
      assert(uciBestMoveToMove(startingPieces, 'black', 'bestmove h9h8') === null, 'horse cannot move straight');
      assert(uciBestMoveToMove(startingPieces, 'black', 'bestmove a0a1') === null, 'red rook square is not black to move');
      assert(uciBestMoveToMove(startingPieces, 'black', 'bestmove none') === null, 'none should not produce a move');
    },
  },
  {
    name: '强引擎返回合法步时优先采用引擎步',
    run: async () => {
      const move = await chooseComputerMove(startingPieces, 'black', {
        engine: async () => 'bestmove h9g7',
      });
      assert(move?.pieceId === 'bn2', 'engine move should be selected');
      assert(move.to.x === 6 && move.to.y === 2, 'engine target should be selected');
    },
  },
  {
    name: '强引擎失败或返回非法步时使用合法兜底',
    run: async () => {
      const move = await chooseComputerMove(startingPieces, 'black', {
        engine: async () => 'bestmove h9h8',
      });
      assert(move, 'fallback should still find a move');
      const movingPiece = findPiece(startingPieces, move.pieceId);
      assert(movingPiece?.side === 'black', 'fallback should move black');
      assertPoint(getLegalMoves(startingPieces, movingPiece), move.to, 'fallback legality');
    },
  },
  {
    name: '入门难度不会调用强引擎',
    run: async () => {
      let calls = 0;
      const move = await chooseComputerMove(startingPieces, 'black', {
        difficulty: 'beginner',
        engine: async () => {
          calls += 1;
          return 'bestmove h9g7';
        },
      });
      assert(calls === 0, 'beginner difficulty should stay on lightweight local AI');
      assert(move, 'beginner difficulty should still find a legal move');
      const movingPiece = findPiece(startingPieces, move.pieceId);
      assert(movingPiece?.side === 'black', 'beginner move should move black');
      assertPoint(getLegalMoves(startingPieces, movingPiece), move.to, 'beginner move legality');
    },
  },
  {
    name: '局面评估会识别子力优势和被将军压力',
    run: () => {
      const balanced = [
        piece({ id: 'rk', side: 'red', kind: 'king', x: 5, y: 9 }),
        piece({ id: 'bk', side: 'black', kind: 'king', x: 5, y: 0 }),
        piece({ id: 'br', side: 'black', kind: 'rook', label: '車', x: 0, y: 0 }),
        piece({ id: 'rr', side: 'red', kind: 'rook', label: '車', x: 8, y: 9 }),
      ];
      const extraRook = [
        ...balanced,
        piece({ id: 'br2', side: 'black', kind: 'rook', label: '車', x: 1, y: 0 }),
      ];
      const checked = [
        piece({ id: 'rk', side: 'red', kind: 'king', x: 5, y: 9 }),
        piece({ id: 'bk', side: 'black', kind: 'king', x: 4, y: 0 }),
        piece({ id: 'rr', side: 'red', kind: 'rook', label: '車', x: 4, y: 3 }),
      ];
      assert(evaluateComputerPosition(extraRook, 'black') > evaluateComputerPosition(balanced, 'black'), 'extra rook should improve black evaluation');
      assert(evaluateComputerPosition(checked, 'black') < 0, 'being checked should hurt black evaluation');
    },
  },
  {
    name: 'AI 兜底会避免为了小子送掉大子',
    run: async () => {
      const pieces = [
        piece({ id: 'rk', side: 'red', kind: 'king', x: 5, y: 9 }),
        piece({ id: 'bk', side: 'black', kind: 'king', x: 5, y: 0 }),
        piece({ id: 'br', side: 'black', kind: 'rook', label: '車', x: 4, y: 4 }),
        piece({ id: 'rp', side: 'red', kind: 'pawn', label: '兵', x: 4, y: 5 }),
        piece({ id: 'rr', side: 'red', kind: 'rook', label: '車', x: 4, y: 9 }),
        piece({ id: 'bn', side: 'black', kind: 'horse', label: '馬', x: 0, y: 2 }),
      ];
      const move = await chooseComputerMove(pieces, 'black', { engine: async () => null });
      assert(!(move?.pieceId === 'br' && move.to.x === 4 && move.to.y === 5), 'fallback should not trade a rook for a pawn');
    },
  },
];

for (const test of tests) {
  await test.run();
  console.log(`ok - ${test.name}`);
}
