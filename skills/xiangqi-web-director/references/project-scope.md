# Project Scope Reference

## Current Target

- Build and polish a web-first Chinese chess game inspired by the Tencent Tiantian Xiangqi experience.
- Use `React + TypeScript + Vite`; keep the first version pure frontend.
- Make the first screen an actual usable game experience, not a landing page.
- Preserve a complete local loop: home -> lobby -> matching -> game -> result -> replay or rematch.
- Current baseline: the app shell, primary play pages, Xiangqi lobby, local match flow, game screen, result page, replay page, profile shell, optional strong-AI path, and puzzle/Jieqi/more-game mode surfaces are already implemented.
- Current visual baseline includes self-made/generated board, piece, Jieqi-back, campaign-map, Gobang-board, and mode artwork; keep these legible and avoid swapping in copied Tiantian Xiangqi assets.
- Optional Pikafish WebAssembly assets are bundled under `public/engines/pikafish/`; they are GPL-3.0 and must remain documented as optional with local fallback.
- Current V1.1 validation is recorded in `docs/v1.1-validation.md`; treat it as the latest stable baseline before starting a larger redesign.

## Explicit Non-Goals For Current Work

- No WeChat Mini Program or native app implementation yet.
- No backend unless the user starts a later backend phase.
- No real account login, payment, ads, ranking sync, real social graph, online matchmaking, or real sharing.
- No copied Tiantian Xiangqi trademarks, proprietary images, or protected source assets.
- No use of these Xiangqi skills for unrelated project types such as poker, Dou Dizhu, Mahjong, Go, international chess, RPGs, generic websites, or admin systems.

## Trigger Boundary

- Trigger for explicit Chinese chess, Xiangqi, Tiantian Xiangqi style, Xiangqi rules, Xiangqi lobby, Xiangqi replay, and current repository skill-maintenance work.
- Do not trigger for card games, Mahjong, Go, international chess, generic web apps, commerce apps, blogs, or dashboards.
- Clarify broad "board game", "chess game", or "game lobby" requests unless context already points to Chinese chess.

## Priority Order

1. Preserve and extend the established primary page shell.
2. Standard Xiangqi playable loop.
3. Result and replay flow.
4. Lobby density, page shells, and navigation polish.
5. Puzzle campaign, Jieqi, flip chess, and Gobang local mode depth.
6. Optional engine integration and graceful fallback.
7. Visual and responsive validation.

## Skill Strategy

- Maintain module skills in this repo while the project evolves.
- Update module skills after meaningful stage completion.
- Use `xiangqi-skill-maintainer` to collect recurring preferences and implementation lessons.
- After project completion, synthesize a global-ready `xiangqi-game-builder` skill from validated module knowledge.
