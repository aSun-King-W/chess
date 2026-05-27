# Current UI Map

## Main Routes

- `home`: main playable shell with mode navigation, first-level dashboard content, and mode-specific embedded surfaces.
- `lobby`: Xiangqi lobby and dense local match entries.
- `jieqi`: Jieqi mode surface.
- `puzzle`: daily puzzle/challenge surface.
- `more-game`: additional modes such as flip chess and Gobang.
- `game`: active game board and controls.
- `result`: post-game result.
- `replay`: replay and move list.
- `profile`: profile/me content.

## Expected UI Behaviors

- Home should prioritize actual play entries and dense information, not a hero-style marketing pitch.
- The first-level page shell should preserve the current mode rail/bottom tabs, title bar, scrollable content frame, and no-overflow layout.
- Lobby should show multiple field/mode entries with clear enabled and unavailable behavior.
- Match dialog copy should reflect the selected entry.
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
