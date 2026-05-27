# Xiangqi Skill Inbox

This inbox collects repeated preferences and implementation lessons before they become stable skill guidance.

## Absorbed

- `absorbed` 2026-05-27: The base React/Vite framework and optimized first-level pages are now the stable local baseline; future work should preserve the shell unless explicitly restructuring. Absorbed into `xiangqi-web-director`, `xiangqi-web-ui`, and validation references.
- `absorbed` 2026-05-27: Project checks should use the repo-local Node/npm command form from README. Absorbed into `xiangqi-web-director`, `xiangqi-rules-engine`, and `xiangqi-validation`.
- `absorbed` 2026-05-27: Current project target is web first; Mini Program and native app work stay out of the main path until explicitly requested. Absorbed into `xiangqi-web-director` and `xiangqi-scope-guardrails`.
- `absorbed` 2026-05-27: Maintain skills inside the repository first, then create a polished global `xiangqi-game-builder` skill after project completion. Absorbed into `xiangqi-web-director` and `xiangqi-skill-maintainer`.
- `absorbed` 2026-05-27: Use multiple module skills during project development, then consolidate into a final total skill later. Absorbed into `xiangqi-web-director`.
- `absorbed` 2026-05-27: Stage completion should include checking whether corresponding skills need updates; the user should not need to manually ask every time. Absorbed into `xiangqi-skill-maintainer`.
- `absorbed` 2026-05-27: Xiangqi skills must not trigger for unrelated requests such as poker, Dou Dizhu, Mahjong, Go, international chess, generic websites, or non-Xiangqi apps. Absorbed into `trigger-matrix.md`, `xiangqi-web-director`, and `xiangqi-scope-guardrails`.
- `absorbed` 2026-05-27: Small changes need a four-way triage: no update, inbox candidate, module skill update, or director update. Absorbed into `small-change-policy.md` and `xiangqi-skill-maintainer`.
- `absorbed` 2026-05-27: Skill maintenance needs detailed acceptance checks for structure, trigger boundaries, content truthfulness, stage maintenance, and final global-skill readiness. Absorbed into `acceptance-checklist.md`.

## Candidates

- `candidate`: Future final skill should support requests like "make a Xiangqi game" by guiding AI through requirements, scaffold, rules, UI, modes, validation, and delivery.

## Deferred

- `deferred`: Install final skill into `~/.codex/skills` only after the web project stabilizes and the final `xiangqi-game-builder` skill is generated.

## Rejected

- None yet.
