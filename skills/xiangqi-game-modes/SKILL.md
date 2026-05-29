---
name: xiangqi-game-modes
description: Use when adding or refining non-core modes in this Xiangqi web project, including puzzle, Jieqi, flip chess, Gobang, ranked entries, certification/rating, coin arena, minute arena, Huashan, friend room, lobby mode configuration, and other local playable mode shells.
---

# Xiangqi Game Modes

Use this skill for mode expansion beyond the standard Xiangqi game loop.

## First Reads

- `src/App.tsx` for mode routing, lobby entries, puzzle, Jieqi, flip chess, and Gobang UI.
- `src/game.ts` for reusable board rules, puzzle pieces, Gobang helpers, and shared result/replay behavior.
- Mode data modules such as `src/xiangqiPlaySession.ts`, `src/xiangqiCoinArena.ts`, `src/xiangqiMinuteArena.ts`, `src/xiangqiFriendRoom.ts`, `src/xiangqiHuashan.ts`, `src/xiangqiRating.ts`, `src/xiangqiCertification.ts`, `src/xiangqiJieqi.ts`, and `src/xiangqiPuzzle.ts` when the requested surface touches them.
- `docs/implementation-plan.md` for original mode scope.
- `docs/implementation-plan2.md` for V1.1 minimum playable targets.
- `references/current-mode-map.md` for mode expectations.

## Mode Principles

- Prefer a minimal playable loop over a static placeholder when a mode is in scope.
- Reuse the shared board, result, and replay concepts when they genuinely fit.
- Keep commercial, social, and event-like modes local-data-first: model admissions, rows, result summaries, replay rows, archives, and safe placeholders in typed helpers before wiring UI.
- Keep unavailable online/social/commercial mode actions explicit with disabled states or toast feedback.
- Do not let side modes destabilize the standard Xiangqi loop.

## Current Mode Targets

- Xiangqi lobby: multiple local entries with dynamic match copy, different displayed time settings, and disabled feedback for online-only functions.
- Certification/rating: expose local session rows, rule summaries, dimension results, score changes, replay tags, and result rows without adding real accounts.
- Coin arena/minute arena: model resource/admission/ticket rows, relief prompts, mode selection cards, and session result summaries locally; do not implement real payment, recharge, or ranking sync.
- Huashan: provide local home data, stage rules/rewards, leaderboard rows, season progress, challenge sessions, result summaries, replay rows, and safe placeholders for spectating/ranking/reward claims.
- Friend room: create local room data, settings rows, settlement/archive/review helpers, and disabled placeholders for real invite/share/online room behavior.
- Puzzle: daily puzzle plus campaign-map/chapter flow, timer/steps, stamina, reset, hint highlight, comments dialog, record rows, settlement rows, ranking panel, and solved/failure/abandoned state.
- Jieqi: hidden pieces use real piece identity for legal moves and reveal on first movement; local AI can use the same simplified move chooser after the player move; generated hidden-piece backs should keep the dark-piece identity visually clear.
- Flip chess: local flipping, opening choice, movement/capture helpers, trophy sidebar, replay/record rows, rules-guide artwork, and rules/multiplier/health framing; complete online arena behavior can remain future work.
- Gobang: keep 15x15 local play with selectable difficulty, valid AI replies, immediate win/block behavior, win detection, status text, board texture, and reset behavior; do not overbuild beyond the stage goal.

## Validation

- Test each enabled mode's happy path.
- Check unavailable entries produce feedback.
- Add focused tests when a mode introduces reusable logic, such as admissions, settlements, archives, Jieqi reveal, puzzle scoring, flip capture hierarchy, or Gobang win detection.
