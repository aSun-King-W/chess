# Current Engine Map

## Core Types

- `Side`: red or black.
- `PieceKind`: rook, horse, elephant, advisor, king, cannon, pawn.
- `Position`: board coordinate with `x` and `y`.
- `Piece`: id, side, kind, label, and position.
- `Move`: moved piece id, from, to, optional captured piece, and notation.
- `GameState`: pieces, turn, selection, legal moves, recent move, history, phase, result, timers, and pause state.
- `GameResult`: winner, reason, moves, final pieces, elapsed time, and end timestamp.

## Main Rules Functions

- `createInitialGame(totalSeconds?)`
- `selectPiece(game, pieceId)`
- `applyMove(game, pieceId, to)`
- `finishGame(game, winner, reason)`
- `chooseAiMove(pieces, turnIndex)`
- `getLegalMoves(pieces, piece)`
- `buildReplayPieces(moves, step)`
- `canUndoRound(game)`
- `undoLastRound(game)`
- `stepSecondsForMove(moveCount)`
- `createGobangBoard()`
- `placeStone(board, x, y, stone)`
- `chooseGobangMove(board, lastX, lastY)`
- `hasGobangWin(board, stone)`

## Important Expectations

- Red player starts.
- Coordinates use a 9x10 board.
- Move history is the source for result replay.
- `stepSecondsForMove` applies opening step-time rules.
- AI chooses a legal black move by scoring available candidates.
- Tests should protect against illegal self-check moves and broken replay state.
- Undo is round-based: it requires at least two moves and returns to red turn.
- Result data currently stores winner, reason, move list, final pieces, elapsed seconds, and `endedAt`.
- Gobang uses an 11x11 board with `0` empty, `1` black/player, and `2` white/local AI.
