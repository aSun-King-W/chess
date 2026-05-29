---
name: xiangqi-web-ui
description: Use when building or polishing the React web interface for this Xiangqi project, including home, lobby, match dialog, game screen, result page, replay page, responsive layout, toasts, menus, settings, chat, and visual validation.
---

# Xiangqi Web UI

Use this skill for user-facing web experience work.

## First Reads

- `src/App.tsx` for screens, routes, local UI state, components, and mode-surface wiring.
- `src/styles.css` for layout, board rendering, responsive behavior, and visual tokens.
- `src/assets/` for self-made/generated board, piece, campaign, Gobang, flip-rule, lobby, mode-icon, and rank assets.
- `docs/implementation-plan2.md` for current V1.1 UI targets.
- `docs/tiantian-xiangqi-observations.md` for product-density observations.
- `references/current-ui-map.md` for the expected page and interaction map.

## Design Direction

- Build the usable product as the first screen; do not create a marketing landing page.
- Preserve the optimized first-level layout: mode rail/bottom tabs, top title bar, scrollable content frame, dense home dashboard, Xiangqi lobby, profile shell, and playable mode surfaces.
- Keep the style close to a general Xiangqi app feel: wood background imagery, generated board/piece skins, campaign map art, Gobang board texture, ranked/game posters, generated round pieces, dense lobby entries, resource bar, mode navigation, and bottom tabs.
- Prefer the current bitmap board and piece assets for inspection-heavy play surfaces; generated dark-piece backs should visually read as hidden Jieqi pieces while preserving stable board sizing.
- Avoid copying original Tiantian Xiangqi trademarks or proprietary assets.
- Use existing local patterns before introducing new abstractions.
- Use `lucide-react` icons for tool buttons when available.

## Interaction Rules

- Every clickable unavailable feature must show a toast or disabled state.
- Route titles must stay synchronized with the active route, selected mode, and bottom tab.
- Mode surfaces should pull copy/rows/status from typed local helper modules instead of duplicating fragile literals in JSX.
- Dialogs must be dismissible and must not hide critical controls on mobile.
- Game settings may include UI-only toggles, but only move hints should affect rule behavior unless a stage says otherwise.
- Result and replay screens must handle empty move history clearly.
- A 0-move result should disable replay entry and show `暂无可复盘棋谱`; replay itself still needs an empty-state guard.
- Replay should keep a dense information surface: board, summary/KPI strip, playback controls, game metadata, current move label, and scrollable move list should remain visible without page-level overflow.
- AI difficulty, campaign level/stamina, and Gobang difficulty controls should be visible as real local controls, not hidden in copy-only panels.
- Text must fit in buttons, cards, panels, and mobile viewports without overlap.

## Responsive Targets

- Desktop: 1280x720 should keep home, lobby, game, result, and replay usable without key content being cut off.
- Mobile: 390x844 should avoid horizontal overflow; navigation, board, dialogs, chat drawer, and bottom tabs must remain usable.

## Validation

- Run a browser walkthrough for major UI changes when a dev server is available.
- Capture or inspect desktop and mobile views when layout, board sizing, dialogs, or result/replay screens change.
- Run `npm run build` after component/type changes; if using bundled `.tools/node`, put `.tools/node/bin` on `PATH` first.
