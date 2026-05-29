---
name: xiangqi-validation
description: Use when validating this repository's Xiangqi web project with unit tests, TypeScript build checks, browser walkthroughs, responsive screenshots, rule regression coverage, skill trigger checks, and stage acceptance criteria. Do not use for unrelated non-Xiangqi projects.
---

# Xiangqi Validation

Use this skill whenever implementation needs verification or a stage is being closed.

## First Reads

- `package.json` for available scripts.
- `tests/game-rules.test.ts`, `tests/xiangqi-engine.test.ts`, and mode-specific tests for current rule, AI adapter, and product-logic coverage.
- `docs/v1.1-validation.md` for prior validation notes.
- `docs/implementation-plan2.md` for acceptance criteria.
- `references/validation-checklist.md` for stage checks.
- `README.md` for current run commands and local Node/npm setup.

## Default Checks

- Run `npm test` after rule, replay, timer, AI/engine adapter, undo, puzzle, Jieqi, flip chess, arena/session, archive, scoring, or Gobang logic changes.
- Run `npm run build` after TypeScript, React component, route, state, or exported type changes.
- If using the bundled `.tools/node`, follow `README.md`: put `.tools/node/bin` on `PATH` before invoking `npm`.
- Use browser validation for meaningful UI/layout changes, especially board sizing, dialogs, result/replay, and mobile behavior.

## Browser Walkthroughs

Prioritize these paths:

- Home -> Xiangqi lobby -> enabled match -> game -> move -> AI response -> resign -> result -> replay.
- Home -> ranked or timed entry -> game -> exit confirmation -> result.
- Puzzle -> hint -> correct move -> success -> reset.
- Puzzle campaign -> locked level feedback -> playable current level -> result overlay -> ranking panel.
- Jieqi -> select hidden piece -> move -> reveal.
- More games -> flip chess -> reveal piece -> opening/capture/rules feedback.
- More games -> Gobang -> choose difficulty -> place stone -> local AI reply -> reset.
- Local product shells -> certification/rating/coin/minute/Huashan/friend-room entry -> rows/status/result or disabled feedback.

## Visual Targets

- Desktop 1280x720: home, lobby, game, result, and replay must retain key content.
- Mobile 390x844: no unintended horizontal overflow; board, dialogs, chat drawer, bottom tabs, and primary actions remain usable.
- Intentional horizontal scroll is acceptable for mode navigation if it does not move the page body.
- Disabled/unavailable actions must show visible gray state or toast.
- Optional Pikafish/strong-AI behavior must degrade to legal local AI if the worker or assets are missing, slow, or return illegal moves.

## Stage Completion

- Summarize what was tested.
- State any tests not run and why.
- Trigger `xiangqi-skill-maintainer` to capture reusable validation lessons from the stage.
- If skill descriptions or trigger boundaries changed, check the maintainer trigger matrix.
- If skill-maintenance work changed, check the maintainer acceptance checklist.
