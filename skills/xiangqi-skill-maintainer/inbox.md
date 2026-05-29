# Xiangqi Skill Inbox

This inbox collects repeated preferences and implementation lessons before they become stable skill guidance.

## Absorbed

- `absorbed` 2026-05-29: README now documents the canonical run workflow: use normal `npm` commands, and when using bundled `.tools/node`, add `.tools/node/bin` to `PATH` first. Absorbed into `xiangqi-web-director`, `xiangqi-rules-engine`, and `xiangqi-validation`.
- `absorbed` 2026-05-29: Replay page was redesigned into a dense board + summary/KPI + metadata + current-move + move-list layout; future replay UI changes should preserve information density while collapsing safely on mobile. Absorbed into `xiangqi-web-ui` and validation references.
- `absorbed` 2026-05-29: Today added optional Pikafish-backed AI through `src/xiangqiEngine.ts`; engine output must be FEN/UCI adapted, locally legal-move validated, timeout-safe, and always backed by local fallback. Absorbed into `xiangqi-rules-engine`, `xiangqi-validation`, `xiangqi-web-director`, and `xiangqi-scope-guardrails`.
- `absorbed` 2026-05-29: Core rules now distinguish checkmate from stalemate/困毙, reject out-of-turn/illegal `applyMove` calls, clamp replay steps, and support configurable opening/regular step times. Absorbed into `xiangqi-rules-engine` and validation references.
- `absorbed` 2026-05-29: Puzzle work expanded into a campaign-map flow with stamina, locked/current/completed levels, result overlays, and ranking panel. Absorbed into `xiangqi-game-modes`, `xiangqi-web-ui`, and validation references.
- `absorbed` 2026-05-29: Gobang moved to a 15x15 textured board with selectable difficulty and stronger AI heuristics that win/block immediate threats. Absorbed into `xiangqi-game-modes`, `xiangqi-rules-engine`, and validation references.
- `absorbed` 2026-05-27: The base React/Vite framework and optimized first-level pages are now the stable local baseline; future work should preserve the shell unless explicitly restructuring. Absorbed into `xiangqi-web-director`, `xiangqi-web-ui`, and validation references.
- `absorbed` 2026-05-27, updated 2026-05-29: Project checks should follow the command form currently documented in `README.md`; use normal `npm` commands after ensuring the desired Node/npm is on `PATH`. Absorbed into `xiangqi-web-director`, `xiangqi-rules-engine`, and `xiangqi-validation`.
- `absorbed` 2026-05-27: Current project target is web first; Mini Program and native app work stay out of the main path until explicitly requested. Absorbed into `xiangqi-web-director` and `xiangqi-scope-guardrails`.
- `absorbed` 2026-05-27: Maintain skills inside the repository first, then create a polished global `xiangqi-game-builder` skill after project completion. Absorbed into `xiangqi-web-director` and `xiangqi-skill-maintainer`.
- `absorbed` 2026-05-27: Use multiple module skills during project development, then consolidate into a final total skill later. Absorbed into `xiangqi-web-director`.
- `absorbed` 2026-05-27: Stage completion should include checking whether corresponding skills need updates; the user should not need to manually ask every time. Absorbed into `xiangqi-skill-maintainer`.
- `absorbed` 2026-05-27: Xiangqi skills must not trigger for unrelated requests such as poker, Dou Dizhu, Mahjong, Go, international chess, generic websites, or non-Xiangqi apps. Absorbed into `trigger-matrix.md`, `xiangqi-web-director`, and `xiangqi-scope-guardrails`.
- `absorbed` 2026-05-27: Small changes need a four-way triage: no update, inbox candidate, module skill update, or director update. Absorbed into `small-change-policy.md` and `xiangqi-skill-maintainer`.
- `absorbed` 2026-05-27: Skill maintenance needs detailed acceptance checks for structure, trigger boundaries, content truthfulness, stage maintenance, and final global-skill readiness. Absorbed into `acceptance-checklist.md`.
- `absorbed` 2026-05-28: Expanded Tiantian-style mode work should be captured as typed local product logic first, with UI panels consuming helper rows/status/results and tests protecting admissions, settlements, archives, reveal/capture, scoring, and replay metadata. Absorbed into `xiangqi-game-modes`, `xiangqi-rules-engine`, `xiangqi-web-ui`, and validation references.
- `absorbed` 2026-05-28: Commercial/social/event-like features such as coin arena, friend room, Huashan, ranking, spectating, reward claim, recharge, invite, and share should remain local shells or safe placeholders until backend/online scope is explicit. Absorbed into `xiangqi-game-modes`, `xiangqi-web-director`, and validation guidance.
- `absorbed` 2026-05-28: Self-made/generated bitmap board, piece, mode-icon, and Jieqi back assets are now part of the stable visual baseline; future UI work should preserve legibility and stable board sizing. Absorbed into `xiangqi-web-ui` and validation references.

## Candidates

- `candidate`: Future final skill should support requests like "make a Xiangqi game" by guiding AI through requirements, scaffold, rules, UI, modes, validation, and delivery.

## Deferred

- `deferred`: Install final skill into `~/.codex/skills` only after the web project stabilizes and the final `xiangqi-game-builder` skill is generated.

## Rejected

- None yet.
