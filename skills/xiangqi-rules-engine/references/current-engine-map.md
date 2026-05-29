# Current Engine Map

## Core Types

- `Side`: red or black.
- `PieceKind`: rook, horse, elephant, advisor, king, cannon, pawn.
- `Position`: board coordinate with `x` and `y`.
- `Piece`: id, side, kind, label, and position.
- `Move`: moved piece id, from, to, optional captured piece, and notation.
- `GameState`: pieces, turn, selection, legal moves, recent move, history, phase, result, total timers, regular/opening step timers, opening move count, and pause state.
- `GameResult`: winner, reason, moves, final pieces, elapsed time, and end timestamp.

## Main Rules Functions

- `createInitialGame(totalSeconds?, regularStepSeconds?, openingStepSeconds?, openingMoveCount?)`
- `selectPiece(game, pieceId)`
- `applyMove(game, pieceId, to)`
- `finishGame(game, winner, reason)`
- `chooseAiMove(pieces, turnIndex)`
- `getLegalMoves(pieces, piece)`
- `getDefeatReason(pieces, side)`
- `hasLegalMove(pieces, side)`
- `buildReplayPieces(moves, step)`
- `canUndoRound(game)`
- `undoLastRound(game)`
- `stepSecondsForMove(moveCount)`
- `createGobangBoard()`
- `placeStone(board, x, y, stone)`
- `chooseGobangMove(board, lastX, lastY, difficulty?)`
- `hasGobangWin(board, stone)`

## Optional Engine Adapter

- `src/xiangqiEngine.ts` exposes `piecesToFen`, `uciBestMoveToMove`, `chooseComputerMove`, and `evaluateComputerPosition`.
- `chooseComputerMove` supports `beginner`, `advanced`, and `expert` difficulty.
- Beginner stays on lightweight local AI; advanced/expert may use the Pikafish worker when available.
- Any engine move must be converted from UCI, mapped to a local piece, and validated with `getLegalMoves`.
- Missing worker/assets, timeouts, thrown errors, null output, or illegal best moves must fall back to local search/scored AI.
- Bundled Pikafish assets are documented in `public/engines/pikafish/README.md` and should remain optional.

## Mode Logic Modules

- `src/jieqi.ts`: base Jieqi hidden-piece helpers, display conversion, legal moves, move application, reveal, and lookup helpers.
- `src/puzzle.ts`: daily puzzle session state, timer, legal moves, hints, reset, and move verdicts.
- `src/xiangqiPuzzle.ts`: puzzle entries, stats, attempts, hints, settlement rows, replay rows, records, comments, and score calculation.
- `src/xiangqiJieqi.ts`: Jieqi arena configs, admissions, board state, reveal rules, capture stats, placeholders, rating settlement, and replay rows.
- `src/xiangqiFlipChess.ts`: flip arenas, initial pieces, opening choice, reveal, move, capture hierarchy, trophy sidebar, settlement, replay/record rows, and safe placeholders.
- `src/xiangqiCoinArena.ts`, `src/xiangqiMinuteArena.ts`, `src/xiangqiFriendRoom.ts`, `src/xiangqiHuashan.ts`, `src/xiangqiRating.ts`, `src/xiangqiCertification.ts`, and `src/xiangqiPlaySession.ts`: typed local product logic for rows, admissions, sessions, result summaries, archives, and replay metadata.

## Important Expectations

- Red player starts.
- Coordinates use a 9x10 board.
- Move history is the source for result replay.
- `stepSecondsForMove` applies configurable opening step-time rules.
- `applyMove` rejects out-of-turn pieces and illegal landing points.
- AI chooses legal moves only; strong-engine output is never trusted without local validation.
- Tests should protect against illegal self-check moves and broken replay state.
- Undo is round-based: it requires at least two moves and returns to red turn.
- Result data currently stores winner, reason, move list, final pieces, elapsed seconds, and `endedAt`.
- `buildReplayPieces` clamps requested replay steps into the legal move-history range.
- Checkmate and stalemate/困毙 are distinct result reasons.
- Gobang uses a 15x15 board with `0` empty, `1` black/player, and `2` white/local AI.
- Mode helpers should stay deterministic and render-free so tests can validate them directly.
