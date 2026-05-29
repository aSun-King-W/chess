---
name: xiangqi-rules-engine
description: Use when implementing or modifying Chinese chess rules, board state, move generation, check/checkmate, AI move choice, undo, replay, game results, Jieqi/puzzle/flip/Gobang logic, or rule regression tests in this Xiangqi web project.
---

# Xiangqi Rules Engine

Use this skill for game logic. Keep UI behavior out unless it affects the game model.

## First Reads

- `src/game.ts` for the current rules engine and exported types.
- `src/xiangqiEngine.ts` for FEN/UCI conversion, optional Pikafish-backed move choice, difficulty settings, and fallback search.
- `tests/game-rules.test.ts` for rule coverage.
- `tests/xiangqi-engine.test.ts` for engine adapter and fallback coverage.
- Mode-specific logic modules such as `src/jieqi.ts`, `src/puzzle.ts`, `src/xiangqiJieqi.ts`, `src/xiangqiPuzzle.ts`, `src/xiangqiFlipChess.ts`, and their tests when touched.
- `public/engines/pikafish/README.md` before changing bundled engine assets or assumptions.
- `docs/implementation-plan.md` for the original rules target.
- `docs/implementation-plan2.md` for V1.1 additions such as undo, Jieqi reveal, and 0-move replay behavior.
- `references/current-engine-map.md` for the current expected model shape.

## Rules Principles

- Keep the board model explicit: side, piece kind, label, id, position, selected piece, legal moves, recent move, move history, phase, result, timers, and pause state.
- Generate legal moves by starting with raw piece moves, rejecting own-piece captures, and filtering moves that leave the mover in check.
- Treat replay as data derived from `Move[]`; do not invent replay-only board rules that diverge from normal moves.
- Preserve deterministic local behavior. AI can be simple, but it must never choose illegal moves or stall the game.
- Strong engine usage is optional: convert to FEN/UCI, validate any returned best move against local legal moves, and fall back to local search/scored AI on missing assets, timeout, failure, or illegal output.
- Keep rule functions pure where practical so tests can call them directly.
- Keep shared mini-mode helpers such as puzzle pieces and Gobang board utilities in `src/game.ts` only while they remain small and reusable.
- Keep mode wrappers deterministic and local: admissions, settlements, replay rows, archive filters, score changes, and placeholder lookup functions should be testable without rendering React.

## Stage Work

- For standard Xiangqi, cover rook, horse, elephant, advisor, king, cannon, pawn, river rules, palace rules, blocked horse/elephant movement, flying general, check, checkmate, stalemate/困毙, king capture, timeout, and resignation.
- For undo, only undo a completed red-black round when required by the UI design; do not silently undo partial history unless the stage explicitly needs that behavior.
- For Jieqi, use real hidden piece data for legal moves, reveal a hidden piece on first move, and keep revealed labels stable.
- For puzzle modules, separate session progression, hint reveal, move verdicts, scoring, records, comments, and settlement rows from UI event handlers.
- For flip chess, keep reveal/move/capture/opening/trophy/settlement helpers independent from board rendering.
- For result and replay, ensure 0-move results are handled as empty replay data and not as a playable replay.
- For Gobang, protect valid empty-cell placement, difficulty-aware local AI replies, immediate win/block behavior, and five-in-a-row detection when the helper logic changes.

## Validation

- Add focused rule tests for new logic before relying on browser behavior.
- Run `npm test` when rules, engine, or replay behavior changes; if using bundled `.tools/node`, put `.tools/node/bin` on `PATH` first.
- Run `npm run build` for type safety when exported types change.
