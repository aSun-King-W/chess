import {
  applyJieqiMove,
  createInitialJieqiPieces,
  findJieqiPiece,
  getJieqiLegalMoves,
  getJieqiPieceAt,
  isHiddenJieqiPiece,
  toDisplayJieqiPieces,
} from '../src/jieqi.js';
import { findPiece, hasPoint, startingPieces } from '../src/game.js';
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

function piece(partial: Partial<Piece> & Pick<Piece, 'id' | 'side' | 'kind' | 'x' | 'y'>): Piece {
  return {
    label: partial.kind === 'king' ? (partial.side === 'red' ? '帥' : '將') : '子',
    ...partial,
  };
}

const tests: TestCase[] = [
  {
    name: '揭棋初始局只有帅将明示，其余棋子保留真实身份',
    run: () => {
      const pieces = createInitialJieqiPieces();
      const redKing = findJieqiPiece(pieces, 'rk');
      const blackKing = findJieqiPiece(pieces, 'bk');
      const redRook = findJieqiPiece(pieces, 'rr1');
      assert(redKing?.revealed && !redKing.hidden, 'red king should start revealed');
      assert(blackKing?.revealed && !blackKing.hidden, 'black king should start revealed');
      assert(redRook?.hidden && !redRook.revealed, 'non-king should start hidden');
      assert(redRook?.kind === 'rook' && redRook.label === '車', 'hidden piece should keep real kind and label internally');
    },
  },
  {
    name: '显示棋盘把未揭示棋子渲染成统一暗子标签',
    run: () => {
      const pieces = createInitialJieqiPieces();
      const displayPieces = toDisplayJieqiPieces(pieces);
      assert(findPiece(displayPieces, 'rr1')?.label === '暗', 'hidden piece should display as dark tile');
      assert(findPiece(displayPieces, 'rk')?.label === '帥', 'revealed king should display real label');
      assert(findPiece(pieces, 'rr1')?.label === '車', 'display mapping should not mutate real label');
    },
  },
  {
    name: '暗子按真实棋种生成合法落点',
    run: () => {
      const pieces = createInitialJieqiPieces();
      const redHorse = findJieqiPiece(pieces, 'rn1');
      assert(redHorse && isHiddenJieqiPiece(redHorse), 'red horse should be hidden before moving');
      const moves = getJieqiLegalMoves(pieces, 'rn1');
      assertPoint(moves, { x: 0, y: 7 }, 'hidden horse left jump');
      assertPoint(moves, { x: 2, y: 7 }, 'hidden horse right jump');
    },
  },
  {
    name: '暗子首次实际移动后才揭示真实棋种',
    run: () => {
      const pieces = createInitialJieqiPieces();
      const before = findJieqiPiece(pieces, 'rn1');
      assert(before?.hidden && !before.revealed, 'piece should start hidden');

      const result = applyJieqiMove(pieces, 'rn1', { x: 2, y: 7 });
      assert(result, 'hidden horse move should be legal');
      assert(result.revealed, 'first move should report reveal');
      assert(result.movedPiece.kind === 'horse', 'moved piece should keep real kind');
      assert(result.movedPiece.label === '馬', 'moved piece should reveal real label');
      assert(!result.movedPiece.hidden && result.movedPiece.revealed, 'moved piece should be revealed after move');
      assert(findJieqiPiece(pieces, 'rn1')?.hidden, 'applyJieqiMove should not mutate source pieces');
    },
  },
  {
    name: '已揭示棋子再次移动时标签稳定且不会重复揭示',
    run: () => {
      const first = applyJieqiMove(createInitialJieqiPieces(), 'rn1', { x: 2, y: 7 });
      assert(first, 'first horse move should be legal');
      const second = applyJieqiMove(first.pieces, 'rn1', { x: 4, y: 8 });
      assert(second, 'second horse move should be legal');
      assert(!second.revealed, 'already revealed piece should not reveal again');
      assert(second.movedPiece.label === '馬', 'revealed label should remain stable');
      assert(!isHiddenJieqiPiece(second.movedPiece), 'piece should remain displayed as revealed');
    },
  },
  {
    name: '一步揭棋移动返回吃子结果并移除目标棋子',
    run: () => {
      const pieces = createInitialJieqiPieces([
        piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
        piece({ id: 'bk', side: 'black', kind: 'king', x: 5, y: 0 }),
        piece({ id: 'rr', side: 'red', kind: 'rook', label: '車', x: 4, y: 1 }),
        piece({ id: 'bp', side: 'black', kind: 'pawn', label: '卒', x: 4, y: 0 }),
      ]);

      const result = applyJieqiMove(pieces, 'rr', { x: 4, y: 0 });
      assert(result, 'rook capture should be legal');
      assert(result.captured?.id === 'bp', 'capture result should include target');
      assert(result.revealed, 'capturing with hidden piece should reveal it');
      assert(getJieqiPieceAt(result.pieces, { x: 4, y: 0 })?.id === 'rr', 'moving piece should occupy target');
      assert(!getJieqiPieceAt(result.pieces, { x: 4, y: 1 }), 'source square should be empty');
      assert(!findJieqiPiece(result.pieces, 'bp'), 'captured piece should be removed');
    },
  },
  {
    name: '非法目标不会移动或揭示',
    run: () => {
      const pieces = createInitialJieqiPieces(startingPieces);
      const result = applyJieqiMove(pieces, 'rn1', { x: 1, y: 8 });
      assert(result === null, 'horse cannot move straight forward');
      assert(findJieqiPiece(pieces, 'rn1')?.hidden, 'illegal move should not reveal source piece');
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
