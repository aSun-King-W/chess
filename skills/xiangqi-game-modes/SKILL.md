---
name: xiangqi-game-modes
description: Use when adding or refining non-core modes in this Xiangqi web project, including puzzle, Jieqi, flip chess, Gobang, ranked entries, lobby mode configuration, and other local playable mode shells.
---

# Xiangqi Game Modes

Use this skill for mode expansion beyond the standard Xiangqi game loop.

## First Reads

- `src/App.tsx` for mode routing, lobby entries, puzzle, Jieqi, flip chess, and Gobang UI.
- `src/game.ts` for reusable board rules, puzzle pieces, Gobang helpers, and shared result/replay behavior.
- `docs/implementation-plan.md` for original mode scope.
- `docs/implementation-plan2.md` for V1.1 minimum playable targets.
- `references/current-mode-map.md` for mode expectations.

## Mode Principles

- Prefer a minimal playable loop over a static placeholder when a mode is in scope.
- Reuse the shared board, result, and replay concepts when they genuinely fit.
- Keep unavailable online/social/commercial mode actions explicit with disabled states or toast feedback.
- Do not let side modes destabilize the standard Xiangqi loop.

## Current Mode Targets

- Xiangqi lobby: multiple local entries with dynamic match copy and different displayed time settings.
- Ranked: reuse standard game flow while presenting ranked/season framing.
- Puzzle: one clear challenge, timer/steps, reset, hint highlight, comments dialog, and solved/failure state.
- Jieqi: hidden pieces use real piece identity for legal moves and reveal on first movement; local AI can use the same simplified move chooser after the player move.
- Flip chess: minimum local flipping interaction with rules/multiplier/health framing; full capture win rules can remain future work.
- Gobang: keep compact local play with valid AI replies, win detection, status text, and reset behavior; do not overbuild beyond the stage goal.

## Validation

- Test each enabled mode's happy path.
- Check unavailable entries produce feedback.
- Add rule tests when a mode introduces reusable logic, such as Jieqi reveal or Gobang win detection.
