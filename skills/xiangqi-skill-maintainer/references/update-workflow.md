# Skill Update Workflow

## What Belongs In A Skill

- Stable implementation workflow.
- Repeated user preference.
- Scope boundary that prevents likely mistakes.
- Trigger boundary that prevents unrelated projects from using Xiangqi guidance.
- Reusable test or browser validation pattern.
- Project-specific architecture or type convention.
- A lesson learned from a completed stage.

## What Does Not Belong

- Temporary TODOs.
- One-time bugs.
- Unverified ideas.
- Detailed code copies that will go stale quickly.
- Long lists already maintained better in project docs.

## Inbox Status Labels

- `candidate`: worth watching, not yet validated.
- `absorbed`: moved into a module skill or director skill.
- `deferred`: useful later, not current-stage guidance.
- `rejected`: too one-off or stale.

## Decision Flow

1. If the change is only a one-time copy/style/local bug tweak, do not update skills.
2. If the change may become reusable but is not proven, add an inbox `candidate`.
3. If the change is stable and belongs to one module, update that module skill or reference.
4. If the change affects multiple modules, stage flow, scope, or trigger boundaries, update the director or maintainer references.
5. If a skill description changed, check `trigger-matrix.md` before closing the stage.

## Stage Update Template

Use this checklist after a meaningful stage:

```text
Stage:
Changed areas:
Reusable lessons:
User preferences:
Trigger impact:
Skill updates made:
Inbox changes:
Validation evidence:
```
