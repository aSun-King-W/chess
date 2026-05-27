# Small Change Policy

Use this policy to decide whether a small implementation change should update repository-local skills.

## No Skill Update

Do not update skills or inbox for:

- One-time copy edits.
- Single button color, spacing, radius, or font-size tweaks.
- One-off bug fixes that do not reveal a reusable rule.
- Local variable renames.
- Small code moves that do not change architecture or workflow.
- Temporary state used by one screen only.
- Changes that do not affect workflow, user preference, validation standards, trigger boundaries, or scope boundaries.

## Add To Inbox

Add a `candidate` to `inbox.md` when:

- The same small change appears two or more times.
- The user repeats the same preference or correction.
- A small fix suggests a general rule but has not been validated.
- A UI, testing, rules, or trigger decision may apply across modules.
- A validation pass reveals a recurring risk.
- A plan target and current code fact diverge and need later reconciliation.

## Update A Module Skill

Update the owning module skill when:

- A small change becomes a stable implementation pattern.
- A change modifies a standard workflow.
- A change modifies acceptance criteria.
- A change fixes inaccurate skill guidance.
- A new reusable test method is proven.
- A new UI rule affects multiple pages or states.
- A new game logic rule affects rules, tests, and UI behavior.

## Update The Director

Update `xiangqi-web-director` when:

- The project direction, technology stack, scope, phase flow, or final global skill strategy changes.
- The user changes a long-term preference.
- A rule applies across multiple modules.
- A module skill is added or removed.
- The future global `xiangqi-game-builder` trigger boundary changes.
