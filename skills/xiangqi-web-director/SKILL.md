---
name: xiangqi-web-director
description: Use only for this repository's web-first Chinese chess/Xiangqi project, especially to choose scope, sequence modules, preserve project boundaries, and coordinate repository-local Xiangqi skills. Do not use for unrelated card games, Mahjong, Go, international chess, generic websites, or non-Xiangqi apps.
---

# Xiangqi Web Director

Use this as the first skill for project-level work on the Xiangqi web app.

## Operating Model

- Treat the current target as a web app first: React, TypeScript, and Vite.
- Treat the current baseline as a stable local frontend: dense first-level pages, multiple local mode surfaces, core Xiangqi loop, optional strong-AI integration, result/replay flow, and self-made board/piece/campaign assets are already in place.
- Do not move the project toward WeChat Mini Program, native app, backend, real login, real payment, ads, real online matchmaking, or copied proprietary assets unless the user explicitly changes scope.
- Keep commercial, social, and event-like features as typed local shells or safe placeholders until backend, payment, account, online, or service scope is explicit.
- Treat bundled third-party engine assets as optional and license-sensitive; preserve documented fallback behavior before relying on them for core play.
- Do not apply this skill to unrelated projects such as poker, Dou Dizhu, Mahjong, Go, international chess, RPGs, shops, blogs, or admin systems.
- If the user says only "board game" or "chess game" without enough context, clarify whether they mean Chinese chess before using Xiangqi-specific guidance.
- Prefer local playable flows over static mockups: home, lobby, match, game, result, replay, and mode shells should remain connected through typed local data.
- Read current repo state before deciding: inspect `src/App.tsx`, `src/game.ts`, `src/styles.css`, tests, and the relevant docs.
- Use module skills for detailed work instead of expanding this director into a large implementation manual.

## Module Routing

- Use `xiangqi-rules-engine` for board state, legal moves, check/checkmate/stalemate, AI moves, optional Pikafish integration, undo, replay, and game-result data.
- Use `xiangqi-web-ui` for page structure, visual style, responsive layout, dialogs, toasts, and interaction polish.
- Use `xiangqi-game-modes` for puzzle, Jieqi, flip chess, Gobang, ranked entries, and other side modes.
- Use `xiangqi-validation` for tests, build checks, browser walkthroughs, screenshots, and acceptance criteria.
- Use `xiangqi-skill-maintainer` at stage completion to decide what should be added to skills.

## Stage Workflow

1. Read current implementation and relevant docs.
2. Identify which module skill owns the change.
3. Preserve the established local shell and first-level page flow unless the user explicitly asks to restructure it.
4. Keep the implementation scoped to the active stage.
5. Verify with the smallest meaningful mix of unit tests, build checks, and browser/manual path checks.
6. Prefer the repo's local Node/npm command form when running checks: `PATH=.tools/node/bin:$PATH .tools/node/bin/npm test` and `PATH=.tools/node/bin:$PATH .tools/node/bin/npm run build`.
7. At stage completion, update the relevant repository-local skill and maintainer inbox if the work produced reusable knowledge.
8. If any skill description or trigger boundary changed, use the maintainer trigger matrix before closing the stage.

## Source Documents

- Current baseline plan: `docs/implementation-plan.md`
- V1.1 enhancement plan: `docs/implementation-plan2.md`
- Product observations: `docs/tiantian-xiangqi-observations.md`
- Validation notes: `docs/v1.1-validation.md`
- Optional engine asset notes: `public/engines/pikafish/README.md`
- More project context: `references/project-scope.md`
- Trigger and non-trigger examples: `../xiangqi-skill-maintainer/references/trigger-matrix.md`

## Guardrails

- This repository's skills are drafts maintained inside the repo, not global Codex skills yet.
- Do not install these skills into `~/.codex/skills` until the project has a stable final `xiangqi-game-builder` skill.
- Do not add long-lived rules for one-off copy tweaks, temporary bugs, or unverified ideas.
