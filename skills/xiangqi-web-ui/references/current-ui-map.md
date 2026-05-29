# Current UI Map

## Main Routes

- `home`: main playable shell with mode navigation, first-level dashboard content, and mode-specific embedded surfaces.
- `lobby`: Xiangqi lobby and dense local match entries.
- `jieqi`: Jieqi mode surface.
- `puzzle`: daily puzzle/challenge surface plus campaign-map play flow.
- `more-game`: additional modes such as flip chess and Gobang.
- Local feature surfaces: certification, rating/evaluation, coin arena, minute arena, Huashan, friend room, Jieqi arena, and extended puzzle flows can appear inside the same app shell when backed by typed local data modules.
- `game`: active game board and controls.
- `result`: post-game result.
- `replay`: replay and move list.
- `profile`: profile/me content.

## Expected UI Behaviors

- Home should prioritize actual play entries and dense information, not a hero-style marketing pitch.
- The first-level page shell should preserve the current mode rail/bottom tabs, title bar, scrollable content frame, and no-overflow layout.
- Lobby should show multiple field/mode entries with clear enabled and unavailable behavior.
- Match dialog copy should reflect the selected entry.
- Feature cards and mode panels should use module-provided rows, statuses, and result summaries instead of hard-coded duplicate copy when helpers already exist.
- Campaign map should preserve horizontal/scrollable chapter navigation, locked/current/completed states, stamina, result overlays, and ranking panel without causing page-level overflow.
- AI and Gobang difficulty selectors should update local session behavior and remain understandable in the current shell.
- Game screen should expose board, timers, player info, recent move, menu, chat, settings, pause/intro state, resign/exit confirmation, and unavailable-action feedback.
- Result should show enough match detail to feel like a real game result, including winner, reason, timing, points/progress, actions, and replay availability.
- Replay should provide board stepping, move information, playback controls, and empty-state handling.
- Profile and non-play bottom tabs can remain polished shells until the user asks to implement backend/social/account features.

## Visual Checks

- No important text or controls should overlap.
- No horizontal overflow on common mobile width.
- Horizontal scrolling is acceptable only for intentional mode navigation or compact tab strips.
- Disabled buttons need obvious disabled styling.
- Toast position and duration should be consistent.
- Board sizing should remain stable under labels, markers, hover/focus states, and hidden/revealed piece labels.
- Generated Xiangqi pieces and Jieqi backs should remain legible at board scale; hidden-piece art must not collapse into indistinct text or resize the grid.
- Campaign-map, Gobang texture, flip-rules guide, and generated piece assets should be checked at both desktop and mobile sizes when changed.
