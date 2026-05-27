---
name: xiangqi-validation
description: Use when validating this repository's Xiangqi web project with unit tests, TypeScript build checks, browser walkthroughs, responsive screenshots, rule regression coverage, skill trigger checks, and stage acceptance criteria. Do not use for unrelated non-Xiangqi projects.
---

# Xiangqi Validation

Use this skill whenever implementation needs verification or a stage is being closed.

## First Reads

- `package.json` for available scripts.
- `tests/game-rules.test.ts` for current rule tests.
- `docs/v1.1-validation.md` for prior validation notes.
- `docs/implementation-plan2.md` for acceptance criteria.
- `references/validation-checklist.md` for stage checks.

## Default Checks

- Run `PATH=.tools/node/bin:$PATH .tools/node/bin/npm test` after rule, replay, timer, AI, undo, puzzle, Jieqi, or Gobang logic changes.
- Run `PATH=.tools/node/bin:$PATH .tools/node/bin/npm run build` after TypeScript, React component, route, state, or exported type changes.
- Use browser validation for meaningful UI/layout changes, especially board sizing, dialogs, result/replay, and mobile behavior.

## Browser Walkthroughs

Prioritize these paths:

- Home -> Xiangqi lobby -> enabled match -> game -> move -> AI response -> resign -> result -> replay.
- Home -> ranked or timed entry -> game -> exit confirmation -> result.
- Puzzle -> hint -> correct move -> success -> reset.
- Jieqi -> select hidden piece -> move -> reveal.
- More games -> flip chess -> reveal piece -> rules feedback.
- More games -> Gobang -> place stone -> local AI reply -> reset.

## Visual Targets

- Desktop 1280x720: home, lobby, game, result, and replay must retain key content.
- Mobile 390x844: no unintended horizontal overflow; board, dialogs, chat drawer, bottom tabs, and primary actions remain usable.
- Intentional horizontal scroll is acceptable for mode navigation if it does not move the page body.
- Disabled/unavailable actions must show visible gray state or toast.

## Stage Completion

- Summarize what was tested.
- State any tests not run and why.
- Trigger `xiangqi-skill-maintainer` to capture reusable validation lessons from the stage.
- If skill descriptions or trigger boundaries changed, check the maintainer trigger matrix.
- If skill-maintenance work changed, check the maintainer acceptance checklist.
