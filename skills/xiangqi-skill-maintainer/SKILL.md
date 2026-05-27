---
name: xiangqi-skill-maintainer
description: Use at stage completion or when maintaining this repository's Xiangqi skills, including trigger-boundary checks, small-change triage, inbox cleanup, acceptance checks, or future consolidation into a global Xiangqi game builder skill. Do not use for unrelated projects such as card games, Mahjong, generic websites, or non-Xiangqi games.
---

# Xiangqi Skill Maintainer

Use this skill to keep repository-local skills useful without turning them into noisy logs.

## Purpose

- Capture repeated user preferences, implementation lessons, testing patterns, and project-specific workflows.
- Update the relevant module skill after meaningful stage completion.
- Keep half-formed ideas in `inbox.md` until they are validated.
- Prepare the future final `xiangqi-game-builder` skill after the web project stabilizes.

## Update Policy

- Do not update skills for ordinary copy tweaks, tiny style edits, or one-off bugs unless they reveal a reusable pattern.
- Do update skills when a change reveals a reusable rule, recurring preference, stable workflow, test pattern, trigger boundary, or scope boundary.
- Prefer updating the owning module skill first.
- Promote cross-module guidance to `xiangqi-web-director`.
- Keep final global-skill ideas in the inbox until project completion.
- Use `references/small-change-policy.md` to decide whether a change is ignored, added to inbox, added to a module skill, or promoted to the director.
- Use `references/trigger-matrix.md` whenever a skill description or final global skill trigger boundary changes.
- Use `references/acceptance-checklist.md` before closing a stage or preparing global installation.

## Stage Completion Workflow

1. Review what changed in the stage.
2. Identify reusable lessons and user preferences.
3. Classify each lesson as: no update, inbox candidate, module skill update, or director update.
4. If a description changed, run the trigger matrix manually and note the result.
5. Update the relevant `SKILL.md` or `references/` file.
6. Update `inbox.md` with status notes: `candidate`, `absorbed`, `deferred`, or `rejected`.
7. Keep the skills concise; remove stale or duplicated guidance.

## Final Consolidation Workflow

At project completion:

- Read all repository-local skills.
- Read `docs/implementation-plan.md`, `docs/implementation-plan2.md`, `docs/tiantian-xiangqi-observations.md`, and validation notes.
- Keep only stable, reusable, automation-friendly guidance.
- Generate a final `xiangqi-game-builder` skill suitable for global installation.
- Ensure the final skill's description is narrow enough to trigger only for Xiangqi or clearly related Xiangqi game generation tasks.
- Verify that card games, Mahjong, Go, international chess, generic sites, and non-Xiangqi apps do not trigger it.

## Reference

- Maintainer inbox: `inbox.md`
- Detailed update workflow: `references/update-workflow.md`
- Trigger examples and non-trigger examples: `references/trigger-matrix.md`
- Small change triage: `references/small-change-policy.md`
- Stage and final acceptance checks: `references/acceptance-checklist.md`
