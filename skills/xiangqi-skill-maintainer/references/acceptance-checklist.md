# Skill Acceptance Checklist

Use this checklist before closing a skill-maintenance stage or before preparing the final global skill.

## Structure

- Every skill has a `SKILL.md`.
- Every `SKILL.md` has valid `name` and `description` frontmatter.
- Descriptions are narrow enough to avoid card games, Mahjong, Go, international chess, generic websites, and unrelated apps.
- Reference files hold detail and do not duplicate large source files.
- `xiangqi-skill-maintainer/inbox.md` uses `candidate`, `absorbed`, `deferred`, and `rejected` statuses.

## Trigger Boundaries

- `trigger-matrix.md` has at least 10 trigger examples.
- `trigger-matrix.md` has at least 10 non-trigger examples.
- `trigger-matrix.md` has at least 5 boundary examples.
- The non-trigger examples include `我要做一款扑克牌游戏`.
- Boundary examples say whether to trigger, not trigger, or clarify.
- Any changed description has been checked against the matrix.

## Content Truthfulness

- Current facts in skills can be traced to source code, tests, or docs.
- Future plans are marked as future, deferred, target, or final-consolidation work.
- Outdated descriptions are updated or moved to inbox.
- Temporary TODOs, one-off bugs, and unverified ideas are not promoted to long-lived skill guidance.
- Skills point to files and workflows instead of copying large blocks of source code.

## Stage Maintenance

- Stage-end skill review happened.
- Each reusable lesson is classified as no update, inbox candidate, module update, or director update.
- Inbox candidates are not left stale without a status note.
- New validation methods, recurring user preferences, or trigger-boundary changes are recorded.
- The final response for a stage mentions which skill maintenance action happened.

## Final Global Skill

- The future `xiangqi-game-builder` can guide creation of a web-first Chinese chess game.
- It does not trigger for card games, Mahjong, Go, international chess, generic websites, or non-Xiangqi apps.
- It asks for clarification when the request only says "board game" or "chess game" without enough context.
- It contains stable, validated, reusable guidance only.
- Global installation happens only after the project stabilizes.
