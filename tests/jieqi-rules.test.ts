import {
  applyJieqiMove,
  chooseJieqiComputerMove,
  createInitialJieqiPieces,
  findJieqiPiece,
  getJieqiLegalMoves,
  getJieqiPieceAt,
  isHiddenJieqiPiece,
  toActiveJieqiEnginePieces,
  toDisplayJieqiPieces,
} from '../src/jieqi.js';
import { findPiece, hasPoint, startingPieces } from '../src/game.js';
import type { Piece, PieceKind, Position, Side } from '../src/game.js';
import type { JieqiPiece } from '../src/jieqi.js';

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

function assertNoPoint(points: Position[], point: Position, label: string) {
  assert(!hasPoint(points, point), `${label}: did not expect ${point.x},${point.y}`);
}

function piece(partial: Partial<Piece> & Pick<Piece, 'id' | 'side' | 'kind' | 'x' | 'y'>): Piece {
  return {
    label: partial.kind === 'king' ? (partial.side === 'red' ? '帥' : '將') : '子',
    ...partial,
  };
}

function jieqiPiece(
  partial: Partial<JieqiPiece> & Pick<JieqiPiece, 'id' | 'side' | 'kind' | 'label' | 'x' | 'y'>,
): JieqiPiece {
  return {
    hidden: false,
    revealed: true,
    coveredKind: partial.kind,
    coveredLabel: partial.label,
    ...partial,
  };
}

function countKinds(pieces: JieqiPiece[], side: Side): Record<PieceKind, number> {
  return pieces
    .filter((item) => item.side === side)
    .reduce(
      (counts, item) => ({
        ...counts,
        [item.kind]: counts[item.kind] + 1,
      }),
      { king: 0, rook: 0, horse: 0, elephant: 0, advisor: 0, cannon: 0, pawn: 0 } as Record<PieceKind, number>,
    );
}

const tests: TestCase[] = [
  {
    name: '揭棋初始局只有帅将明示，暗子真实身份在同阵营内打乱',
    run: () => {
      const pieces = createInitialJieqiPieces(startingPieces, () => 0);
      const redKing = findJieqiPiece(pieces, 'rk');
      const blackKing = findJieqiPiece(pieces, 'bk');
      const redRook = findJieqiPiece(pieces, 'rr1');
      assert(redKing?.revealed && !redKing.hidden, 'red king should start revealed');
      assert(blackKing?.revealed && !blackKing.hidden, 'black king should start revealed');
      assert(redRook?.hidden && !redRook.revealed, 'non-king should start hidden');
      assert(redRook?.coveredKind === 'rook' && redRook.coveredLabel === '車', 'covered identity should track original square');
      assert(pieces.some((item) => item.hidden && item.kind !== item.coveredKind), 'at least one hidden piece should be randomized');
      assert(countKinds(pieces, 'red').pawn === 5 && countKinds(pieces, 'black').pawn === 5, 'pawn counts stay legal');
      assert(countKinds(pieces, 'red').rook === 2 && countKinds(pieces, 'black').rook === 2, 'rook counts stay legal');
    },
  },
  {
    name: '显示棋盘把未揭示棋子渲染成统一暗子标签',
    run: () => {
      const pieces = createInitialJieqiPieces();
      const realLabel = findPiece(pieces, 'rr1')?.label;
      const displayPieces = toDisplayJieqiPieces(pieces);
      assert(findPiece(displayPieces, 'rr1')?.label === '暗', 'hidden piece should display as dark tile');
      assert(findPiece(displayPieces, 'rk')?.label === '帥', 'revealed king should display real label');
      assert(findPiece(pieces, 'rr1')?.label === realLabel, 'display mapping should not mutate real label');
    },
  },
  {
    name: '暗子按所在初始位置生成合法落点',
    run: () => {
      const pieces = createInitialJieqiPieces();
      const redHorse = findJieqiPiece(pieces, 'rn1');
      assert(redHorse && isHiddenJieqiPiece(redHorse), 'red horse should be hidden before moving');
      assert(redHorse.coveredKind === 'horse', 'covered horse square should drive hidden move');
      const moves = getJieqiLegalMoves(pieces, 'rn1');
      assertPoint(moves, { x: 0, y: 7 }, 'hidden horse left jump');
      assertPoint(moves, { x: 2, y: 7 }, 'hidden horse right jump');
    },
  },
  {
    name: '揭棋强引擎局面按暗子当前可走身份传入',
    run: async () => {
      const pieces: JieqiPiece[] = [
        jieqiPiece({ id: 'rk', side: 'red', kind: 'king', label: '帥', x: 5, y: 9 }),
        jieqiPiece({ id: 'bk', side: 'black', kind: 'king', label: '將', x: 4, y: 0 }),
        jieqiPiece({
          id: 'bp',
          side: 'black',
          kind: 'rook',
          label: '車',
          x: 0,
          y: 3,
          hidden: true,
          revealed: false,
          coveredKind: 'pawn',
          coveredLabel: '卒',
        }),
      ];

      const enginePieces = toActiveJieqiEnginePieces(pieces);
      assert(findPiece(enginePieces, 'bp')?.kind === 'pawn', 'hidden piece should enter engine as covered kind');
      assert(findJieqiPiece(pieces, 'bp')?.kind === 'rook', 'source Jieqi piece should keep real identity');

      const move = await chooseJieqiComputerMove(pieces, 'black', {
        engine: async () => 'bestmove a6a5',
      });
      assert(move?.pieceId === 'bp', 'engine move should map back to hidden piece id');
      assert(move.to.x === 0 && move.to.y === 4, 'engine target should pass Jieqi covered-pawn legality');
    },
  },
  {
    name: '揭棋强引擎会拒绝明显送大子的走法',
    run: async () => {
      const pieces: JieqiPiece[] = [
        jieqiPiece({ id: 'rk', side: 'red', kind: 'king', label: '帥', x: 5, y: 9 }),
        jieqiPiece({ id: 'bk', side: 'black', kind: 'king', label: '將', x: 3, y: 0 }),
        jieqiPiece({ id: 'br', side: 'black', kind: 'rook', label: '車', x: 4, y: 4 }),
        jieqiPiece({ id: 'rp', side: 'red', kind: 'pawn', label: '兵', x: 4, y: 5 }),
        jieqiPiece({ id: 'rr', side: 'red', kind: 'rook', label: '車', x: 4, y: 9 }),
        jieqiPiece({ id: 'bn', side: 'black', kind: 'horse', label: '馬', x: 0, y: 2 }),
      ];

      const move = await chooseJieqiComputerMove(pieces, 'black', {
        engine: async () => 'bestmove e5e4',
      });
      assert(!(move?.pieceId === 'br' && move.to.x === 4 && move.to.y === 5), 'AI should reject rook-for-pawn blunder');
    },
  },
  {
    name: '兵位暗子真实为象时第一步按兵走，揭开后按象走',
    run: () => {
      const pieces: JieqiPiece[] = [
        jieqiPiece({ id: 'rk', side: 'red', kind: 'king', label: '帥', x: 4, y: 9 }),
        jieqiPiece({ id: 'bk', side: 'black', kind: 'king', label: '將', x: 5, y: 0 }),
        jieqiPiece({
          id: 'rp1',
          side: 'red',
          kind: 'elephant',
          label: '相',
          x: 0,
          y: 6,
          hidden: true,
          revealed: false,
          coveredKind: 'pawn',
          coveredLabel: '兵',
        }),
      ];

      const hiddenMoves = getJieqiLegalMoves(pieces, 'rp1');
      assertPoint(hiddenMoves, { x: 0, y: 5 }, 'hidden pawn-position first move');
      assertNoPoint(hiddenMoves, { x: 2, y: 4 }, 'hidden piece should not use real elephant move');

      const result = applyJieqiMove(pieces, 'rp1', { x: 0, y: 5 });
      assert(result, 'pawn-position move should be legal');
      assert(result.movedPiece.kind === 'elephant', 'piece reveals as elephant');

      const revealedMoves = getJieqiLegalMoves(result.pieces, 'rp1');
      assertPoint(revealedMoves, { x: 2, y: 3 }, 'revealed elephant can move by elephant rule across river');
    },
  },
  {
    name: '揭开的士和象使用揭棋过河规则',
    run: () => {
      const pieces: JieqiPiece[] = [
        jieqiPiece({ id: 'rk', side: 'red', kind: 'king', label: '帥', x: 4, y: 9 }),
        jieqiPiece({ id: 'bk', side: 'black', kind: 'king', label: '將', x: 5, y: 0 }),
        jieqiPiece({ id: 'ra', side: 'red', kind: 'advisor', label: '仕', x: 4, y: 5, coveredKind: 'pawn', coveredLabel: '兵' }),
        jieqiPiece({ id: 're', side: 'red', kind: 'elephant', label: '相', x: 2, y: 4, coveredKind: 'pawn', coveredLabel: '兵' }),
      ];

      assertPoint(getJieqiLegalMoves(pieces, 'ra'), { x: 3, y: 4 }, 'revealed advisor can leave palace');
      assertPoint(getJieqiLegalMoves(pieces, 're'), { x: 4, y: 2 }, 'revealed elephant can cross river');
    },
  },
  {
    name: '暗子首次实际移动后才揭示真实棋种',
    run: () => {
      const pieces = createInitialJieqiPieces([
        piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
        piece({ id: 'bk', side: 'black', kind: 'king', x: 5, y: 0 }),
        piece({ id: 'rn1', side: 'red', kind: 'horse', label: '馬', x: 1, y: 9 }),
      ]);
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
      const first = applyJieqiMove(
        createInitialJieqiPieces([
          piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
          piece({ id: 'bk', side: 'black', kind: 'king', x: 5, y: 0 }),
          piece({ id: 'rn1', side: 'red', kind: 'horse', label: '馬', x: 1, y: 9 }),
        ]),
        'rn1',
        { x: 2, y: 7 },
      );
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

for (const test of tests) {
  await test.run();
  console.log(`ok - ${test.name}`);
}
