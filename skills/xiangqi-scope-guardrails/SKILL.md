---
name: xiangqi-scope-guardrails
description: Use only for scope decisions in this repository's Xiangqi web project, especially Mini Program, native app, backend, accounts, payments, ads, online matchmaking, copied assets, or trigger-boundary concerns. Do not use for unrelated card games, Mahjong, Go, international chess, generic websites, or non-Xiangqi apps.
---

# Xiangqi Scope Guardrails

Use this skill when scope might drift beyond the current web-first project.

## Current Boundaries

- Web app first.
- Pure frontend first.
- Local play first.
- Self-made or generic visual assets only.
- Skills remain repository-local drafts until final consolidation.
- Xiangqi skills should not trigger for non-Xiangqi projects.

## Defer Unless Explicitly Requested

- WeChat Mini Program implementation.
- Native iOS or Android app.
- Backend services.
- Real login or account identity.
- Payment, recharge, ads, shop transactions, and commercial systems.
- Real online matchmaking, friend rooms, spectators, chat service, or WebSocket rooms.
- Ranking sync, social graph, cloud replay storage, or activity backend.
- Copying original Tiantian Xiangqi images, trademarks, sounds, protected layouts, or proprietary assets.

## Do Not Trigger For

- Poker, Texas Hold'em, Dou Dizhu, or other card games.
- Mahjong.
- Go.
- International chess.
- A standalone Gobang game with no Xiangqi context.
- RPGs, shops, blogs, dashboards, admin systems, or generic websites.

## Clarify Before Triggering

- "Board game"
- "Chess game"
- "Game lobby"
- "Casual game platform"
- "Chess/card platform"

## How To Handle Deferred Features

- In the product UI, use disabled states or clear toast feedback.
- In code, keep placeholders local and explicit.
- In docs or skills, record future phases only when they help avoid current implementation mistakes.
- Do not let future backend or app migration concerns complicate current web implementation.

## When Scope Changes

If the user explicitly starts a later phase, update the director and relevant module skills after the new architecture is understood from the repo and plan docs.
